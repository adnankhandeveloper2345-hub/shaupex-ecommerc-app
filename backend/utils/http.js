// Express 4 does not catch errors thrown inside async routes. wrap() sends them to the error handler.
exports.wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.httpError = (status, message) => Object.assign(new Error(message), { status });
exports.slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
