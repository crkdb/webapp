const parseDuration = require('parse-duration');

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

exports.parseDuration = parseDuration;
exports.formatTime = formatTime;