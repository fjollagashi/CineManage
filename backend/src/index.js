import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import auth from './routes/auth.js';
import movies from './routes/movies.js';
import shows from './routes/shows.js';
import bookings from './routes/bookings.js';
import reviews from './routes/reviews.js';
import analytics from './routes/analytics.js';
import admin from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/movies', movies);
app.use('/api/shows', shows);
app.use('/api/bookings', bookings);
app.use('/api/reviews', reviews);
app.use('/api/analytics', analytics);
app.use('/api/admin', admin);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`CineManage API running at http://localhost:${PORT}`));
