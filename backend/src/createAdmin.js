import bcrypt from 'bcryptjs'; import { pool } from './config/db.js';
const [,,email,password,name='Administrador SOY JEANCUY']=process.argv;
if(!email||!password){console.error('Uso: npm run create-admin -- correo contraseña "Nombre"');process.exit(1);}
if(password.length<12){console.error('Usa una contraseña de al menos 12 caracteres.');process.exit(1);}
const hash=await bcrypt.hash(password,12);
await pool.query('INSERT INTO users(name,email,password_hash) VALUES(?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),password_hash=VALUES(password_hash)',[name,email,hash]);
console.log('Administrador creado/actualizado:',email); await pool.end();
