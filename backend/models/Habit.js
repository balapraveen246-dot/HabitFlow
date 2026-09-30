const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    category: {
      type: String,
      default: 'General',
    },

    icon: {
      type: String,
      default: 'star',
    },

    color: {
      type: String,
      default: '#16a34a',
    },

    startDate: {
      type: String,
      required: true,
    },

    schedule: {
      type: mongoose.Schema.Types.Mixed,
      default: { type: 'daily' },
    },

    active: {
      type: Boolean,
      default: true,
    },

    history: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Habit', habitSchema);