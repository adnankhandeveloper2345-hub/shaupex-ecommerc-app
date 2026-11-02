const Settings = require('../models/Settings');

// one shared settings document (delivery charges etc). Created with defaults on first use.
exports.getSettings = async () =>
  (await Settings.findOne({ key: 'main' })) ||
  (await Settings.create({ key: 'main' }).catch(() => Settings.findOne({ key: 'main' })));
