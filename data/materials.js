const fs = require("fs");
const path = require("path");
const { parseDuration, formatTime } = require('./utils');

const file = fs.readFileSync(__dirname + path.sep + "materials.tsv", { encoding: "utf-8" });
const lines = file.split('\r\n');

let index = 0;
const buildings = [];
let building;
lines.forEach(line => {
  const fields = line.trim().split('\t');
  switch (fields.length) {
    case 3:
      // [Lumberjack's Lodge, images/building/wood.png, Roll Cake]
      building = {
        name: fields[0],
        img: fields[1],
        res: {
          id: index++,
          name: fields[2],
          img: "",
          sets: []
        }
      };
      break;
    case 5:
      // [Roll Cake Wood, /images/material/wood_1.png, 3, 30s, 30]
      if (building.res.sets.length === 0) {
        building.res.img = fields[1];
      }
      const qty = Number.parseInt(fields[2]);
      const timeInSec = parseDuration(fields[3], 's');
      const timePerUnit = timeInSec / qty;
      const dayInSec = 24 * 60 * 60;
      building.res.sets.push({
        name: fields[0],
        img: fields[1],
        qty: qty,
        time: fields[3],
        timePerUnit: formatTime(timePerUnit),
        unitsPerDay: qty * Math.floor(dayInSec / timeInSec),
        cost: Number.parseInt(fields[4])
      });
      if (building.res.sets.length === 3) {
        buildings.push(building);
      }
      break;
  }
});

function lookupMaterial(name) {
  for (let i = 0; i < buildings.length; i++) {
    const building = buildings[i];
    if (building.res.name === name) {
      return building.res;
    }
  }
}

exports.materialBuildings = buildings;
exports.lookupMaterial = lookupMaterial;
