// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const setupTriggers = require('./db/setupTriggers');

// Global error handlers to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  // Keep the server running despite the error
  // process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  // Keep the server running despite the error
  // process.exit(1);
});

app.use(cors({
  origin: '*', // allow all origins for testing
  //origin: 'http://localhost:3000', // frontend origin
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => res.send('🎵 Concert API is alive'));

// Setup database triggers and functions
setupTriggers();

// (we'll mount routers here)

// Register all routes
const concertsRouter = require('./routes/concerts');
app.use('/api/concerts', concertsRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const ticketsRouter = require('./routes/ticket');
app.use('/api/tickets', ticketsRouter);

const sponsorsRouter = require('./routes/sponsors');
app.use('/api/sponsors', sponsorsRouter);

const organizersRouter = require('./routes/organizers');
app.use('/api/organizers', organizersRouter);

const staffRouter = require('./routes/staff');
app.use('/api/staff', staffRouter);

const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

const paymentsRouter = require('./routes/payments');
app.use('/api/payments', paymentsRouter);

const artistsRouter = require('./routes/artists');
app.use('/api/artists', artistsRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(port, () => console.log(`Server listening on :${port}`));