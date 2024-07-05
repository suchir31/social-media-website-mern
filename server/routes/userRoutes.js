
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const FriendRequest = require('../models/FriendRequest');
const Friendship = require('../models/Friendship');
const User = require('../models/User'); // Adjust the path to your User model as necessary
const { generateToken, verifyToken } = require('../middlewares/auth');
const Message = require('../models/Message');

router.post('/register', async (req, res) => {
  console.log("opened");
  const {  username,email, password } = req.body;
  console.log(1);
  if (!username || !password) {
    return res.status(400).send('Username and password are required.');
  }
  // Validate input
  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Email, username, and password are required.' });
  }

  try {
    // Check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if username already exists
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    user = new User({
      email,
      username,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response with token
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response with token
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
router.get('/profile', verifyToken, async (req, res) => {
  console.log("came get")
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
// Get friends by username
router.get('/:username/friends', verifyToken, async (req, res) => {
  try {
    // Find the user by username
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find friendships by user ID
    const friendships = await Friendship.find({ user: user._id }).populate('friend', 'username');
    const friends = friendships
    .filter((f) => f.friend !== null) // Filter out null friends
    .map((f) => f.friend);
    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



// Search for users
router.get('/search', verifyToken, async (req, res) => {
  console.log("search");
  try {
    const query = req.query.query;
    console.log(query);
    const users = await User.find({ username: new RegExp(query, 'i') }).select('username');
    console.log(users.length);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a friend
router.post('/:username/friends', verifyToken, async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const username = req.params.username;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the friend by username
    const friend = await User.findOne({ username: friendUsername });
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    // Check if the friendship already exists
    const existingFriendship = await Friendship.findOne({ user: user._id, friend: friend._id });
    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship already exists' });
    }

    // Create new friendship
    const newFriendship = new Friendship({ user: user._id, friend: friend._id });
    await newFriendship.save();
    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



// Send a friend request
router.post('/:username/friend-request', verifyToken, async (req, res) => {
  try {
    const requester = req.user; // The user sending the friend request
    const recipient = await User.findOne({ username: req.params.username });

    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = await FriendRequest.findOne({ requester: requester._id, recipient: recipient._id });
    if (existingRequest && existingRequest.status!='rejected') {
      return res.status(400).json({ message: 'Friend request already sent' });
    }
    if(existingRequest && existingRequest.status=='rejected')
        { 
          existingRequest.status='pending';
          await existingRequest.save();
          res.json({ message: 'Friend request sent successfully' });
        }
    else{
      const newRequest = new FriendRequest({ requester: requester._id, recipient: recipient._id });
          await newRequest.save();
          res.json({ message: 'Friend request sent successfully' });
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// Get friend requests for a user
router.get('/friend-requests', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    const friendRequests = await FriendRequest.find({ recipient: user._id, status: 'pending' }).populate('requester', 'username');
    res.json(friendRequests);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept a friend request
router.post('/friend-requests/:requestId/accept', verifyToken, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    request.status = 'accepted';
    await request.save();

    const friendship = new Friendship({ user: request.requester, friend: request.recipient });
    await friendship.save();

    const friendship1 = new Friendship({ user: request.recipient, friend: request.requester });
    await friendship1.save();
    const updatedFriends = await Friendship.find({ user: req.user._id }).populate('friend', 'username');
    console.log(updatedFriends,"ll");
    const friend = updatedFriends.map((f) => f.friend);
    res.json({ message: 'Friend request accepted and friendships created', friends: friend });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a friend request
router.post('/friend-requests/:requestId/reject', verifyToken, async (req, res) => {     
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
