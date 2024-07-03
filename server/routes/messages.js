const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { verifyToken } = require('../middlewares/auth');

// Fetch conversation with a user
router.get('/conversation/:friendUsername', verifyToken, async (req, res) => {
  try {
    const friendUsername = req.params.friendUsername;
    const user = req.user;

    // Find the friend's user document based on the username
    const friend = await User.findOne({ username: friendUsername });
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    // Fetch messages between the authenticated user and the friend
    const messages = await Message.find({
      $or: [
        { sender: user._id, recipient: friend._id },
        { sender: friend._id, recipient: user._id },
      ],
    })
      .sort({ timestamp: 1 })
      .populate('sender', 'username') // Populate sender's username
      .populate('recipient', 'username'); // Populate recipient's username

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
//send msg
router.post('/send', verifyToken, async (req, res) => {
    try {
      const { recipientUsername, content } = req.body;
      const sender = req.user;
  
      // Find the recipient's user document based on the username
      const recipient = await User.findOne({ username: recipientUsername });
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
  
      // Create a new message
      const newMessage = new Message({
        sender: sender._id,
        recipient: recipient._id,
        content: content,
        seen: false // Initial status: message not seen by recipient
      });
  
      await newMessage.save();
      res.json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  module.exports = router;
// routes/messages.js

// Fetch unseen messages for the authenticated user
router.get('/unseen', verifyToken, async (req, res) => {
    try {
      const userId = req.user._id;
  
      // Find messages sent to the authenticated user that are not seen
      const unseenMessages = await Message.find({
        recipient: userId,
        seen: false
      })
        .populate('sender', 'username')
        .sort({ timestamp: -1 }); // Sort by timestamp descending to get latest first
  
      res.json(unseenMessages);
    } catch (error) {
      console.error('Error fetching unseen messages:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  router.put('/mark-seen/:friendUsername', verifyToken, async (req, res) => {
    try {
      const userId = req.user._id;
      const friendUsername = req.params.friendUsername;
  
      // Find the friend's user document based on their username
      const friend = await User.findOne({ username: friendUsername });
      if (!friend) {
        return res.status(404).json({ message: 'Friend not found' });
      }
  
      // Update messages between userId and friend._id that are not seen
      const updateResult = await Message.updateMany({
        $or: [
          { sender: userId, recipient: friend._id },
          { sender: friend._id, recipient: userId }
        ],
        seen: false
      }, { seen: true });
  
      res.json({ message: 'Messages marked as seen for the friend' });
    } catch (error) {
      console.error('Error marking messages as seen:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  module.exports = router;
  router.get('/unread-counts', verifyToken, async (req, res) => {
    try {
      const user = req.user;
  
      // Get all senders who have sent messages to the user
      const senders = await Message.find({ recipient: user._id, seen: false }).distinct('sender');
  
      const unreadMessageCounts = {};
  
      // For each sender, count the number of unread messages
      for (const senderId of senders) {
        // Populate sender's username
        const sender = await User.findById(senderId);
        console.log(sender)
        if (sender) {
          const count = await Message.countDocuments({ sender: sender._id, recipient: user._id, seen: false });
          console.log(sender,count);
          unreadMessageCounts[sender.username] = count;
        }
      }
  
      console.log(unreadMessageCounts);
      res.json(unreadMessageCounts);
    } catch (error) {
      console.error('Error fetching unread message counts:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  module.exports = router;
  