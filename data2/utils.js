const fs = require('fs');
const parseDuration = require('parse-duration');

/**
 * @param {string} file 
 * @returns {string[][]}
 */
 function parseTSV(file) {
  const data = fs.readFileSync(file, { encoding: 'utf-8' });
  const lines = data.split(/\s*\n\s*/);
  // remove headers line
  lines.shift()
  // split tabs and trim spaces
  return lines.map(line => line.split(/\t/).map(field => field.trim()));
}

/**
 * @param {Number} seconds 
 * @returns {string}
 */
function formatTime(seconds) {
  let time = seconds;

  const h = Math.floor(parseDuration(`${time}s`, 'h'));
  time -= h * 60 * 60;

  const m = Math.floor(parseDuration(`${time}s`, 'm'));
  time -= m * 60;

  const s = Math.floor(parseDuration(`${time}s`, 's'));

  let result = '';
  if (h > 0) {
    result += `${h}h`;
  }
  if (m > 0) {
    result += `${m}m`;
  }
  if (s > 0) {
    result += `${s}s`;
  }

  return result;
}

exports.parseTSV = parseTSV;
exports.formatTime = formatTime;