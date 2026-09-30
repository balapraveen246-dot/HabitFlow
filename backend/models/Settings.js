const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: 'default',
    },

    displayName: {
      type: String,
      default: 'Friend',
    },

    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },

    timezone: {
      type: String,
      default: 'UTC',
    },

    weekStart: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);