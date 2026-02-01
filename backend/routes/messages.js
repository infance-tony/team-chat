const express = require('express');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get messages for 1-to-1 or group
router.get('/', auth, async (req, res) => {
  const { receiverId, groupId } = req.query;
  try {
    let query = {};
    if (receiverId) {
      query = { $or: [{ senderId: req.user._id, receiverId }, { senderId: receiverId, receiverId: req.user._id }] };
    } else if (groupId) {
      query = { groupId };
    }
    const messages = await Message.find(query).populate('senderId', 'name').sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  const { receiverId, groupId, content } = req.body;
  try {
    const message = new Message({ senderId: req.user._id, receiverId, groupId, content });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;