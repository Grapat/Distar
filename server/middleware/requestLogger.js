const morgan = require('morgan');
const requestLogger = morgan(':method :url :status :response-time ms');
module.exports = requestLogger;
