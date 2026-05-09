const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/match');
const userRoutes = require('./routes/users');
const ContactRoutes = require('./routes/Contact');


require('dotenv').config(); 

const app = express();


app.use(cors({
  origin: 'https://skill-fusion-ynamdeo248-9189s-projects.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});


connectDB();

app.get('/', (req, res) => {
  res.json({ message: "Backend is running!" });
});
app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);

app.use('/api/users', userRoutes);
const jobRoutes = require('./routes/jobs');
app.use('/api/jobs', jobRoutes);
const resumeRoutes = require('./routes/resume');
app.use('/api/resume', resumeRoutes);
const interviewRoutes = require('./routes/interview');
app.use('/api/interview', interviewRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
