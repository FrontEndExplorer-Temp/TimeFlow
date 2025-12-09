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
import aiKeyRoutes from './routes/aiKeyRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import initCronJobs from './cron/cronJobs.js';

connectDB();
initCronJobs();

const app = express();

// Production-level CORS configuration
const getCorsOptions = () => {
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    // Development origins - always allowed locally
    const devOrigins = [
        'http://localhost:5173',   // Vite dev server
        'http://localhost:3000',   // Alternative React dev port
        'http://localhost:8081',   // React Native dev server
        'exp://localhost:8081',    // Expo dev server
        'http://localhost:5000',   // Backend itself (for testing)
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8081',
        'http://127.0.0.1:5000'
    ];

    // Production origins - from env var (comma-separated)
    const prodOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : ['https://time-flow-pied.vercel.app'];

    // Allow all local IPs for development (useful for testing across devices on same network)
    const allowedOrigins = isDevelopment
        ? [...devOrigins, ...prodOrigins]
        : prodOrigins;

    return {
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl requests, local tests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Fallback: allow localhost in development, deny in production
            if (isDevelopment && origin.includes('localhost')) {
                return callback(null, true);
            }

            if (isDevelopment) {
                // Log but allow in dev
                console.warn(`CORS request from unknown origin in DEV: ${origin}`);
                return callback(null, true);
            }

            // Reject in production silently (don't expose API details)
            return callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count', 'X-Page-Count'], // Useful for pagination
        credentials: true,
        maxAge: 86400 // 24 hours
    };
};

app.use(express.json());
app.use(cors(getCorsOptions()));
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
app.use('/api/ai-keys', aiKeyRoutes);
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
