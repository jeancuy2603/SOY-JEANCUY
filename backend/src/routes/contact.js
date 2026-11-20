import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const limitContactMessages = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Has enviado varios mensajes. Inténtalo de nuevo más tarde.' }
});

router.post('/', limitContactMessages, async (req, res) => {
  const senderEmail = typeof req.body.senderEmail === 'string' ? req.body.senderEmail.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

  if (!emailPattern.test(senderEmail) || senderEmail.length > 254) {
    return res.status(400).json({ message: 'Escribe un correo electrónico válido.' });
  }
  if (!message || message.length > 5000) {
    return res.status(400).json({ message: 'El mensaje debe tener entre 1 y 5000 caracteres.' });
  }

  const { MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASSWORD, CONTACT_EMAIL } = process.env;
  const port = Number(MAIL_PORT);
  const mailPassword = MAIL_PASSWORD?.replace(/\s/g, '');
  if (!MAIL_HOST || !Number.isInteger(port) || port < 1 || port > 65535 ||
      !MAIL_USER || !CONTACT_EMAIL) {
    return res.status(503).json({
      message: 'Falta configurar los datos SMTP en backend/.env. Complétalos y reinicia el backend para activar el envío.'
    });
  }
  if (!mailPassword) {
    return res.status(503).json({
      message: 'Falta configurar MAIL_PASSWORD en backend/.env. Pega la contraseña de aplicación de Gmail y reinicia el backend.'
    });
  }

  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port,
      secure: MAIL_SECURE === 'true',
      auth: { user: MAIL_USER, pass: mailPassword }
    });

    await transporter.sendMail({
      from: { name: 'SOY JEANCUY - formulario de contacto', address: MAIL_USER },
      to: CONTACT_EMAIL,
      replyTo: senderEmail,
      subject: 'Nuevo mensaje desde el portafolio SOY JEANCUY',
      text: `Correo de quien escribe: ${senderEmail}\n\nMensaje:\n${message}`
    });

    return res.json({ message: 'Tu mensaje se envió correctamente.' });
  } catch (error) {
    console.error('No se pudo enviar el mensaje de contacto:', error.code || error.message);
    return res.status(502).json({ message: 'No se pudo enviar el mensaje. Inténtalo más tarde.' });
  } finally {
    transporter?.close();
  }
});

export default router;
