import express from 'express';
import cors from 'cors';
import { config } from './utils/config.js';
import bookRoutes from './routes/bookRoutes';
import categoryRoutes from './routes/categoryRoutes';
import borrowingRoutes from './routes/borrowingRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (_, res) => {
    res.send('Welcome to the DevBook API!');
});


export default app;