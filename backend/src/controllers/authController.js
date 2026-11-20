import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
export async function login(req,res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({message:'Correo y contraseña son obligatorios.'});
  const [rows] = await pool.query('SELECT id,name,email,password_hash,role FROM users WHERE email=? LIMIT 1',[email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password,user.password_hash))) return res.status(401).json({message:'Credenciales incorrectas.'});
  const token = jwt.sign({id:user.id,name:user.name,role:user.role},process.env.JWT_SECRET,{expiresIn:'8h'});
  res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
}
