import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import deleteUserCron from "./middlewares/deleteUser.js";
import auditDependencies from './middlewares/auditDependencies.js'
import helmet  from 'helmet';
import cors from 'cors'
import { limiter } from './middlewares/rateLimiter.js';
 
 

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors())
 

app.use(helmet());

// Démarre le cron
deleteUserCron.start();
auditDependencies.start()

app.use(limiter)
app.use('/api/auth', authRoutes);
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
