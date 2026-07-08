import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'express-async-errors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use(routes);
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
});
app.use((err, _req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
app.listen(PORT, () => {
    console.log(`\n🚀 LifeOS Server running at http://localhost:${PORT}`);
    console.log(`📊 API endpoints at http://localhost:${PORT}/api`);
});
