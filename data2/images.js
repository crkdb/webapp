const { sep } = require("path");
const { parseTSV } = require('./utils');

const images = parseTSV(__dirname, 'images.tsv').map(fields => {
  return {
    name: fields[0],
    image: fields[1],
  }
});

function getImage(name) {
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    if (image.name === name) {
      return `/images/${image.image}`;
    }
  }
  return `image with name "${name}" not found`;
}

exports.getImage = getImage;