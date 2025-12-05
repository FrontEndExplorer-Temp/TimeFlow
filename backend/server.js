import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import passport from 'passport';
import './config/passport.js';
import userRoutes from './routes/userRoutes.js';
import timerRoutes from './routes/timerRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import initCronJobs from './cron/cronJobs.js';

connectDB();
initCronJobs();

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8081', 'exp://localhost:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(passport.initialize());

app.use('/api/users', userRoutes);
app.use('/api/timers', timerRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
