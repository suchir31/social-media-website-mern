const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const { verifyToken } = require('../middlewares/auth');
const Post = require('../models/Post');
const User = require('../models/User');
// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Folder where images will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) // Unique filename
  }
});
const upload = multer({ storage });

// POST route to add a new post with image upload
router.post('/posts', verifyToken, upload.single('image'), async (req, res) => {
   //console.log("post");
  try {
    const { caption } = req.body;
    const imageUrl = req.file.path; // Path to uploaded image

    // Create a new post
    const newPost = new Post({
      user: req.user._id, // Current authenticated user
      image: imageUrl,
      caption: caption
    });

    // Save the post to the database
    await newPost.save();

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
router.get('/posts', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id; // Extract user ID from the verified token
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
router.delete('/posts/:id', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the logged-in user is the owner of the post
    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Post.findByIdAndDelete(postId);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

router.post('/posts/:id/like', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'User already liked this post' });
    }

    post.likes.push(userId);
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error });
  }
});

module.exports = router;
router.get('/posts/:username', verifyToken, async (req, res) => {
  const { username } = req.params;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user);
    // Find posts created by the user
    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
router.get('/posts/:postId/like', verifyToken, async (req, res) => {
  try {
    console.log("like");
    const { postId } = req.params;
    const post = await Post.findById(postId).populate('likes', 'username'); // Populate likes with username
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post.likes);
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
