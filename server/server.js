const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes'); // Example user routes
const messageRoutes = require('./routes/messages'); 
const postRoutes = require('./routes/posts');
const app = express();
// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://soci-front.vercel.app'
}));
app.get("/", (req, res) => {
    res.json("Hello");
})
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api',postRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Database connection
mongoose.connect('mongodb+srv://suchirreddy5:45YqTbnuchq0dmBh@authcluster.qy86knx.mongodb.net/?retryWrites=true&w=majority&appName=authCluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
