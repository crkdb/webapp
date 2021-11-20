const fs = require("fs");
const path = require("path");

const file = fs.readFileSync(__dirname + path.sep + "resources.tsv", {
  encoding: "utf-8",
});

const resources = file.split('\r\n')
  // remove first line (headers)
  .filter((_, index) => index > 0)
  // split line into array of fields
  .map(line => line.trim().split('\t'))
  // lines with less than 2 fields are empty
  .filter(fields => fields.length >= 2)
  // create objects
  .map(fields => {
    if (fields.length == 2) {
      return {
        name: fields[0],
        img: fields[1]
      };
    }
    return {
      name: fields[0],
      img: fields[1],
      time: fields[2],
      mats: fields[3].split(/\s*,\s*/),
      loc: fields[4]
    };
  });

function lookupResource(name) {
  const resource = resources.find((p) => p.name === name);
  if (!resource) {
    throw new Error(`failed to lookup resource with name '${name}'`);
  }
  return resource;
}

function expandMaterial(material) {
  const splitIndex = material.indexOf(" ");
  const qty = Number.parseInt(material.slice(0, splitIndex));
  const name = material.slice(splitIndex + 1);
  const resource = lookupResource(name);
  const materials = resource.mats
    ? resource.mats.map(expandMaterial)
    : undefined;
  return {
    name: name,
    qty: qty,
    img: resource.img,
    mats: materials,
  };
}

function expandProduct(product) {
  const materials = product.mats.map(expandMaterial);
  const totals = getTotalMaterials({ mats: materials });
  return {
    name: product.name,
    img: product.img,
    loc: product.loc,
    mats: materials,
    totals: totals
  };
}

function getTotalMaterials(resource, childLoop) {
  const isMaterial = !resource.mats;
  if (isMaterial) {
    return { [resource.name]: resource.qty };
  }

  const totalMaterials = {};
  resource.mats.forEach((m) => {
    const materials = getTotalMaterials(m, true);
    Object.keys(materials).forEach((name) => {
      const amount = (resource.qty) ? resource.qty * materials[name] : materials[name];
      if (!totalMaterials[name]) {
        totalMaterials[name] = amount;
      } else {
        totalMaterials[name] += amount;
      }
    });
  });
  if (childLoop) {
    return totalMaterials;
  }

  // lookup img and rearrange data into an array
  return Object.keys(totalMaterials).map(name => {
    return {
      img: lookupResource(name).img,
      qty: totalMaterials[name]
    };
  });
}

const products = resources.filter((p) => p.mats).map(expandProduct);
exports.products = products;

const { materialBuildings } = require('./materials');
const { productBuildings } = require('./products');

exports.materialBuildings = materialBuildings;
exports.productBuildings = productBuildings;
