const fs = require('fs');
const { sep } = require("path");
const parseDuration = require('parse-duration');

/**
 * @param {string} file 
 * @returns {string[][]}
 */
 function parseTSV(dir, fileName) {
  const data = fs.readFileSync(`${dir}${sep}${fileName}`, { encoding: 'utf-8' });
  const lines = data.split(/\s*\n\s*/);
  // remove headers line
  lines.shift()
  // remove blank lines, split tabs, and trim spaces
  return lines.filter(line => line).map(line => line.split(/\t/).map(field => field.trim()));
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