const fs = require("fs");
const path = require("path");
const { parseDuration } = require('./utils');
const { lookupMaterial } = require('./materials')

const file = fs.readFileSync(__dirname + path.sep + "products.tsv", { encoding: "utf-8" });
const lines = file.split('\r\n');

const buildings = [];
let building;
lines.forEach(line => {
  const fields = line.trim().split('\t');
  switch (fields.length) {
    case 2:
      // [Smithy, /images/building/smithy.png]
      if (building) {
        buildings.push(building);
      }
      building = {
        name: fields[0],
        img: fields[1],
        items: []
      }
      break;
    case 4:
      // [Robust Axe, /images/product/smithy/axe.png, 30s, 2 Roll Cake]
      const time = fields[2];
      const timeInSec = parseDuration(time, 's');
      building.items.push({
        name: fields[0],
        img: fields[1],
        time: time,
        perDay: Math.floor((24 * 60 * 60) / timeInSec),
        materials: fields[3].split(/\s*,\s*/).map(material => {
          const splitIndex = material.indexOf(" ");
          return {
            qty: Number.parseInt(material.slice(0, splitIndex)),
            name: material.slice(splitIndex + 1),
          }
        })
      });
      break;
  }
});
if (building) {
  buildings.push(building);
}

buildings.forEach(building => {
  building.items.forEach(item => {
    item.materials.forEach(material => {
      const rawMaterial = lookupMaterial(material.name);
      if (rawMaterial) {
        material.img = rawMaterial.img;
      } else {
        const product = lookupProduct(material.name);
        if (product) {
          material.img = product.img;
        }
      }
    });

    const totalRawMaterials = getTotalRawMaterials(item.materials)
    item.totals = Object.keys(totalRawMaterials).map(name => {
      const material = lookupMaterial(name);
      return {
        id: material.id,
        name: name,
        img: material.img,
        qty: totalRawMaterials[name],
      };
    }).sort((a, b) => {
      return a.id - b.id
    });
  });
});

function lookupProduct(name) {
  for (let i = 0; i < buildings.length; i++) {
    const building = buildings[i];
    for (let j = 0; j < building.items.length; j++) {
      const item = building.items[j];
      if (item.name === name) {
        return item;
      }
    }
  }
}

function getTotalRawMaterials(resources) {
  const total = {};
  resources.forEach(resource => {
    const material = lookupMaterial(resource.name);
    const product = lookupProduct(resource.name);
    if (!material && !product) {
      throw new Error(`resource '${resource.name}' not found`);
    }
    if (material) {
      addToMap(total, material.name, resource.qty)
    } else if (product) {
      const subTotals = getTotalRawMaterials(product.materials);
      Object.keys(subTotals).forEach(name => addToMap(total, name, subTotals[name]));
    }
  });
  return total;
}

function addToMap(map, key, value) {
  if (map[key]) {
    map[key] += value;
  } else {
    map[key] = value;
  }
}

exports.productBuildings = buildings;
exports.lookupProduct = lookupProduct;
