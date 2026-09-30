const fs = require('fs/promises');
const path = require('path');

const Habit = require('../models/Habit');
const Settings = require('../models/Settings');

const DEFAULTS = () => ({
  settings: {
    displayName: 'Friend',
    theme: 'light',
    timezone: 'UTC',
    weekStart: 1,
  },
  habits: [],
});

// Old JSON file — used only for one-time migration
const file =
  process.env.DATA_FILE ||
  path.join(__dirname, '..', 'data', 'habits.json');

let queue = Promise.resolve();

function plainHabit(habit) {
  return {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    category: habit.category,
    icon: habit.icon,
    color: habit.color,
    startDate: habit.startDate,
    schedule: habit.schedule,
    active: habit.active,
    history: habit.history || {},
    createdAt: habit.createdAt,
  };
}

function plainSettings(settings) {
  return {
    displayName: settings.displayName,
    theme: settings.theme,
    timezone: settings.timezone,
    weekStart: settings.weekStart,
  };
}

async function migrateOldJsonIfNeeded() {
  const existingSettings = await Settings.findOne({ key: 'default' });
  const existingHabits = await Habit.countDocuments();

  // MongoDB already has data
  if (existingSettings || existingHabits > 0) {
    return;
  }

  try {
    const raw = await fs.readFile(file, 'utf8');
    const oldData = JSON.parse(raw);

    const settings = {
      ...DEFAULTS().settings,
      ...(oldData.settings || {}),
    };

    await Settings.create({
      key: 'default',
      ...settings,
    });

    if (Array.isArray(oldData.habits) && oldData.habits.length > 0) {
      await Habit.insertMany(oldData.habits);
    }

    console.log('✅ Existing habits.json data migrated to MongoDB');
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      await Settings.create({
        key: 'default',
        ...DEFAULTS().settings,
      });

      console.log('✅ MongoDB initialized with default settings');
    } else {
      throw error;
    }
  }
}

async function read() {
  await migrateOldJsonIfNeeded();

  let settingsDoc = await Settings.findOne({ key: 'default' });

  if (!settingsDoc) {
    settingsDoc = await Settings.create({
      key: 'default',
      ...DEFAULTS().settings,
    });
  }

  const habitDocs = await Habit.find({}).lean();

  return {
    settings: plainSettings(settingsDoc),
    habits: habitDocs.map(plainHabit),
  };
}

function update(fn) {
  const run = queue.then(async () => {
    const data = await read();

    const result = await fn(data);

    // Update settings
    await Settings.findOneAndUpdate(
      { key: 'default' },
      {
        key: 'default',
        ...data.settings,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Current habit IDs
    const ids = data.habits.map((habit) => habit.id);

    // Remove habits deleted by the service
    if (ids.length > 0) {
      await Habit.deleteMany({
        id: { $nin: ids },
      });
    } else {
      await Habit.deleteMany({});
    }

    // Save/update habits
    for (const habit of data.habits) {
      await Habit.findOneAndUpdate(
        { id: habit.id },
        habit,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    return result;
  });

  queue = run.catch(() => {});

  return run;
}

const reset = () =>
  update(async (data) => {
    const defaults = DEFAULTS();

    data.settings = defaults.settings;
    data.habits = [];

    return undefined;
  });

const setFile = () => {
  // Kept for backward compatibility.
  // MongoDB is now the primary storage.
};

module.exports = {
  read,
  update,
  reset,
  setFile,
  DEFAULTS,
};