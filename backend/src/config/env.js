import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

export const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

dotenv.config({ path: path.join(backendRoot, '.env') });

export const uploadDir = path.resolve(backendRoot, process.env.UPLOAD_DIR || 'uploads');
