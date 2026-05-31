const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const formaterLog = (niveau, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${niveau.toUpperCase()}]: ${message}${metaString}\n`;
};

const logger = {
  info: (message, meta) => {
    const logStr = formaterLog('info', message, meta);
    console.log(logStr.trim());
    fs.appendFileSync(path.join(logDir, 'combined.log'), logStr);
  },
  
  error: (message, error, meta = {}) => {
    const errorDetails = {
      message: error?.message || error,
      stack: error?.stack,
      ...meta
    };
    const logStr = formaterLog('error', message, errorDetails);
    console.error(logStr.trim());
    fs.appendFileSync(path.join(logDir, 'errors.log'), logStr);
    fs.appendFileSync(path.join(logDir, 'combined.log'), logStr);
  },

  security: (message, meta) => {
    const logStr = formaterLog('security', message, meta);
    console.warn(`\x1b[31m${logStr.trim()}\x1b[0m`); // Texte rouge en console
    fs.appendFileSync(path.join(logDir, 'security.log'), logStr);
    fs.appendFileSync(path.join(logDir, 'combined.log'), logStr);
  }
};

module.exports = logger;