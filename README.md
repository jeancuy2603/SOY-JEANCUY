# SOY JEANCUY — Repositorio personal y portafolio

Aplicación full-stack con portal público en React y panel administrativo privado en Angular. Ambos usan la misma API y base de datos; el portal recibe los cambios publicados en tiempo real.

## Módulos implementados

### Portal público
- Inicio con identidad, biografía, ubicación y proyectos destacados.
- Sobre mí con biografía, habilidades, experiencia y enlaces sociales.
- Proyectos publicados.
- Diplomas y certificados publicados.
- Repositorio de archivos públicos con vista previa en navegador.
- Acceso a hoja de vida PDF cuando se carga desde administración.

### Panel privado
- Aplicación Angular independiente con inicio de sesión JWT.
- Dashboard con contadores y actividad reciente.
- Crear carpetas y subcarpetas.
- Subir uno o varios archivos; asociarlos a una carpeta.
- Buscar y filtrar archivos por carpeta.
- Renombrar, mover, publicar/ocultar y enviar archivos a papelera.
- Vista previa autenticada de archivos privados.
- Crear, editar y publicar proyectos.
- Crear, editar y publicar diplomas/certificados, asociados a archivos.
- Editar perfil, titular, biografía, habilidades, experiencia, ubicación, correo y redes.
- Subir fotografía, logo y hoja de vida.
- Papelera para restaurar o eliminar definitivamente archivos, carpetas, proyectos y diplomas.
- Los cambios publicados se consultan desde el portal público.
- El portal React escucha los avisos de publicación de la API y vuelve a consultar el contenido público sin necesitar una recarga manual.

## Requisitos
- Node.js 20 o superior
- MySQL 8
- npm

## Instalación local

### 1. Base de datos
Abre MySQL Workbench o la consola de MySQL y ejecuta `backend/database/schema.sql`.

> Si ya habías creado una base de datos con una versión anterior de SOY JEANCUY, haz primero una copia de seguridad. El esquema de esta versión incorpora nuevas columnas y tablas; para una instalación limpia, elimina la base anterior y vuelve a ejecutar el SQL.

### 2. Configurar backend
Abre una terminal:

```bash
cd backend
```

Copia `.env.example` como `.env` (en Git Bash):

```bash
cp .env.example .env
```

Edita `.env` y configura usuario/contraseña de MySQL. Reemplaza `JWT_SECRET` por una cadena aleatoria larga y privada.

Para que el formulario envíe mensajes a `j2698611@gmail.com`, configura `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASSWORD` y `CONTACT_EMAIL` usando los valores de `.env.example`. Con Gmail, crea una contraseña de aplicación desde la seguridad de tu cuenta (requiere verificación en dos pasos) y úsala como `MAIL_PASSWORD`; no uses ni compartas la contraseña normal de Gmail. Reinicia el backend después de guardar estos valores.

Instala dependencias e inicia la API:

```bash
npm install
npm run dev
```

La API quedará en `http://localhost:4000`. Puedes comprobarla en `http://localhost:4000/api/health`.

### 3. Crear administrador
En otra terminal:

```bash
cd backend
npm run create-admin -- admin@soyjeancuy.com "CAMBIA_ESTA_CLAVE" "Jean Cuy"
```

Utiliza una contraseña propia, larga y única. No compartas el `.env`.

### 4. Configurar el portal público React
En una tercera terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

### 5. Configurar el panel Angular
En una cuarta terminal:

```bash
cd admin-angular
npm install
npm run start
```

Abre `http://localhost:4200` e inicia sesión con el correo y contraseña del administrador. El enlace **Administrar** del portal también abre este panel.

Si cambias los puertos o dominios, actualiza `CLIENT_URL` y `ADMIN_URL` en `backend/.env`; el portal admite `VITE_API_URL` y `VITE_ADMIN_URL` como variables opcionales.

## Estructura

```text
SOY-JEANCUY-COMPLETO/
├── frontend/
│   ├── public/
│   └── src/
│       ├── services/api.js
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── admin-angular/
│   ├── src/app/
│   │   ├── app.ts
│   │   ├── app.html
│   │   └── admin-api.ts
│   └── src/styles.css
├── backend/
│   ├── database/schema.sql
│   ├── uploads/
│   └── src/
│       ├── config/db.js
│       ├── controllers/authController.js
│       ├── middleware/auth.js
│       ├── routes/auth.js
│       ├── routes/content.js
│       ├── routes/admin.js
│       ├── routes/contact.js
│       ├── createAdmin.js
│       └── server.js
└── README.md
```

## Límites y notas importantes
- Los archivos se almacenan localmente en `backend/uploads`; para producción conviene usar almacenamiento privado S3-compatible y backups automatizados.
- El límite por archivo se configura con `MAX_FILE_MB` en `.env`.
- El login usa JWT con expiración de 8 horas.
- Los documentos privados solo se sirven mediante la ruta administrativa autenticada.
- La publicación es explícita: los elementos nuevos quedan privados/borrador salvo que marques su casilla de publicación.
- La aplicación necesita la base MySQL y el backend activos para que los datos persistan y se sincronicen.
- Los cambios del CRUD se guardan en MySQL (`soy_jeancuy`) y los archivos cargados en `backend/uploads`; detener o reiniciar el frontend/backend no borra esos datos. No elimines esa base de datos ni la carpeta de cargas si quieres conservarlos.
- Los borradores y archivos privados solo aparecen en el panel Angular; el portal React consume las rutas públicas de la API.
- El formulario de contacto envía los mensajes desde el backend por SMTP. Si la configuración SMTP falta o no es válida, el sitio mostrará un error y no fingirá que el mensaje se envió.
- Para respaldar el contenido, exporta la base MySQL y copia `backend/uploads`. El backend resuelve `.env` y la carpeta de cargas desde su propia ubicación, aunque se inicie desde otra carpeta.
- Antes de desplegar en internet, configura HTTPS, dominio, CORS con el dominio real, secretos seguros, políticas de backup y revisa los permisos y límites de carga.
