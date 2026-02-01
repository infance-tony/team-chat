const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for 1-to-1
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // for group
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure either receiverId or groupId is present
messageSchema.pre('save', function(next) {
  if (!this.receiverId && !this.groupId) {
    return next(new Error('Message must have either receiverId or groupId'));
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);