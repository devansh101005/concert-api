// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const setupTriggers = require('./db/setupTriggers');

app.use(express.json());

app.get('/', (req, res) => res.send('🎵 Concert API is alive'));

// Setup database triggers and functions
setupTriggers();


// (we'll mount routers here)

app.listen(port, () => console.log(`Server listening on :${port}`));

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
