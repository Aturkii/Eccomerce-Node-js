import mongoose from 'mongoose';

const adminApplicationArchiveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicationMessage: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  archivedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
  versionKey: false
});

export const AdminApplicationArchive = mongoose.model('AdminApplicationArchive', adminApplicationArchiveSchema);
