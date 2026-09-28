exports.notFound = (req, res) => res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, _req, res, _next) => {
  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  if (status === 500) console.error(err);
  res.status(status).json({ success: false, error: status === 500 ? 'Internal server error' : err.message, details: err.details });
};
