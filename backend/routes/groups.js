const express = require('express');
const Group = require('../models/Group');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find().populate('members', 'name').populate('createdBy', 'name');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create group (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  const { name, members } = req.body;
  try {
    const group = new Group({ name, members, createdBy: req.user._id });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add member to group (admin only)
router.put('/:id/add', auth, adminOnly, async (req, res) => {
  const { userId } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove member from group (admin only)
router.put('/:id/remove', auth, adminOnly, async (req, res) => {
  const { userId } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    group.members = group.members.filter(id => id.toString() !== userId);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete group (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;