import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import { ApiError } from './utils/ApiError';

// Import Routes
import authRoutes from './routes/AuthRoutes';
import boardRoutes from './routes/BoardRoutes';
import listRoutes from './routes/ListRoutes';
import cardRoutes from './routes/CardRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

const app = express();

// Connect to Database
connectDB();

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'https://trello-zone-pfbw.vercel.app'
];

if (process.env.ALLOWED_ORIGINS) {
    const customOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    allowedOrigins.push(...customOrigins);
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        // Allow if it matches allowed list or starts with 'https://trello-zone' and ends with '.vercel.app'
        const isAllowed = allowedOrigins.includes(origin) || 
                          /^https:\/\/trello-zone[-a-zA-Z0-9]*\.vercel\.app$/.test(origin);
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Request Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 500 ? '\x1b[31m' // Red
            : res.statusCode >= 400 ? '\x1b[33m' // Yellow
            : res.statusCode >= 300 ? '\x1b[36m' // Cyan
            : '\x1b[32m'; // Green
        
        console.log(
            `${statusColor}[${res.statusCode}]\x1b[0m ${req.method} ${req.originalUrl} - ${duration}ms`
        );
    });
    
    next();
});

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/uploads', express.static(path.resolve('public/uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

// Health Check
app.get('/', (req: Request, res: Response) => {
    res.json({ 
        success: true,
        message: 'Trello-Zone API is running',
        status: 200,
        timestamp: new Date().toISOString()
    });
});

// 404 Route
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`\x1b[33m[404]\x1b[0m Route not found: ${req.method} ${req.originalUrl}`);
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    let error = err;

    // Translate database, validation, and file upload errors to friendly ApiError instances
    if (!(err instanceof ApiError)) {
        // 1. Database Connection Timeout / Server offline / Buffering timeout
        if (
            err.name === 'MongooseError' || 
            err.name === 'MongoNetworkError' || 
            err.name === 'MongoServerSelectionError' ||
            err.name === 'MongoTimeoutError' ||
            err.message?.includes('buffering timed out') ||
            err.message?.includes('Server selection timed out') ||
            err.message?.includes('connection timed out') ||
            err.code === 'ETIMEDOUT' ||
            err.code === 'ECONNREFUSED'
        ) {
            error = new ApiError(
                503,
                "The database is currently experiencing network issues or connection timeout. Please check that MongoDB is running and try again."
            );
        } 
        // 2. Mongoose Cast Error (e.g. invalid ObjectId format)
        else if (err.name === 'CastError') {
            error = new ApiError(
                400,
                `Invalid request format. The identifier "${err.value}" is not valid.`
            );
        } 
        // 3. Mongoose Schema Validation Error
        else if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((val: any) => val.message);
            error = new ApiError(
                400,
                `Validation failed: ${messages.join(', ')}`,
                messages
            );
        } 
        // 4. Mongoose Duplicate Key Error (e.g. unique field constraint violation)
        else if (err.code === 11000) {
            const fieldName = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
            const formattedField = fieldName.replace('_', ' ');
            error = new ApiError(
                400,
                `The ${formattedField} you entered is already in use. Please enter a different one.`
            );
        } 
        // 5. SyntaxError (Invalid JSON in body)
        else if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
            error = new ApiError(
                400,
                "The request body contains invalid JSON. Please check your formatting."
            );
        }
        // 6. Multer File Upload Errors
        else if (err.name === 'MulterError') {
            error = new ApiError(
                400,
                `File upload error: ${err.message}`
            );
        } 
        // 7. General fallback
        else {
            error = new ApiError(
                500,
                err.message || 'Something went wrong on our server. Please try again later.'
            );
        }
    }

    // Log the error
    const statusCode = error.statusCode || 500;
    console.error(`\x1b[31m[ERROR ${statusCode}]\x1b[0m ${error.message}`);
    if (statusCode === 500 && err.stack) {
        console.error(err.stack);
    }

    return res.status(statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors || [],
        data: null,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n\x1b[36m==========================================\x1b[0m`);
        console.log(`\x1b[32m  Trello-Zone API Server\x1b[0m`);
        console.log(`\x1b[36m==========================================\x1b[0m`);
        console.log(`  Port:        \x1b[33m${PORT}\x1b[0m`);
        console.log(`  Environment: \x1b[33m${process.env.NODE_ENV || 'development'}\x1b[0m`);
        console.log(`  URL:         \x1b[34mhttp://localhost:${PORT}\x1b[0m`);
        console.log(`\x1b[36m==========================================\x1b[0m\n`);
    });
}

export default app