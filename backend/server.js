require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const port = process.env.PORT || 3001;

// Connect to MongoDB first
connectDB();

app.listen(port, () => {
  console.log(`HabitFlow API listening on :${port}`);
});