'use strict';

function requestLogger(req, res, next) {
  res.on('finish', () => {
    console.log(`[${req.method}] ${req.path} → ${res.statusCode}`);
  });
  next();
}

module.exports = { requestLogger };
