const { sep } = require("path");
const { parseTSV, formatTime } = require('./utils');

class Building {
  /**
   * @param {string[]} fields 
   */
  constructor(fields) {
    this.id = Number.parseInt(fields[0]);
    this.name = fields[1];
    this.image = fields[2];
    this.limit = Number.parseInt(fields[3]);
  }
}

class Resource {
  /**
   * @param {Number} id 
   * @param {Number} buildingID 
   */
  constructor(id, buildingID) {
    this.id = id;
    this.buildingID = buildingID;
  }
}

class Material extends Resource {
  /**
   * @param {string[]} fields 
   */
  constructor(fields) {
    super(Number.parseInt(fields[0]), Number.parseInt(fields[1]));

    this.name = fields[2];
    this.single = fields[3];
    this.image = fields[4];

    this.cost = Number.parseInt(fields[6]);
    this.quantity = Number.parseInt(fields[7]);

    const time = Number.parseInt(fields[5]);
    this.time = formatTime(time);    
    this.timePerUnit = formatTime(time / this.quantity);
  }
}

class Product extends Resource {
  /**
   * @param {string[]} fields 
   */
  constructor(fields) {
    super(Number.parseInt(fields[0]), Number.parseInt(fields[1]));

    this.name = fields[2];
    this.image = fields[3];
    this.time = fields[4];
    this.ingredients = fields[5].split(/\s*,\s*/).map(line => {
      return new Ingredient(line);
    });
  }
}

class Ingredient {
  /**
   * @param {string} line 
   */
  constructor(line) {
    const index = line.indexOf(' ');
    this.quantity = Number.parseInt(line.substring(0, index));
    this.name = line.substring(index + 1);
  }
}

const buildings = parseTSV(`${__dirname}${sep}buildings.tsv`).map(fields => {
  return new Building(fields);
});

const materials = parseTSV(`${__dirname}${sep}materials.tsv`).map(fields => {
  return new Material(fields, buildings);
});

const products = parseTSV(`${__dirname}${sep}products.tsv`).map(fields => {
  return new Product(fields, buildings);
});

// push materials and products into building.resources
buildings.forEach(building => {
  building.materials = materials.filter(material => building.id === material.buildingID);
  building.products = products.filter(product => building.id === product.buildingID);
});

// grab the image for the product ingredients
products.forEach(product => {
  product.ingredients.forEach(ingredient => {
    const material = materials.find(m => m.single === ingredient.name);
    if (material) {
      ingredient.image = material.image;
    }
    const product = products.find(p => p.name === ingredient.name);
    if (product) {
      ingredient.image = product.image;
      ingredient.ingredients = product.ingredients;
    }
  });
});

// calc the base materials for each product
// calc total cost of product
products.forEach(product => {
  product.baseMaterials = getBaseMaterialsRecurse(product);
  product.totalCost = product.baseMaterials.reduce((prev, bm) => {
    let cost;
    materials.forEach(m => {
      if (m.single === bm.name) {
        cost = m.cost / m.quantity;
      }
    });
    return prev + bm.quantity * cost;
  }, 0);
});

/**
 * @param {Ingredient} ingredient 
 * @returns {[]Ingredient}
 */
function getBaseMaterialsRecurse(ingredient) {
  const total = [];
  if (ingredient.ingredients) {
    const quantity = (ingredient.quantity) ? ingredient.quantity : 1;
    ingredient.ingredients.forEach(ing => {
      const subBaseMaterials = getBaseMaterialsRecurse(ing);
      for (let i = 0; i < quantity; i++) {
        total.push(...subBaseMaterials);
      }
    });
  } else {
    const {quantity, name, image} = ingredient;
    total.push({ quantity, name, image });
  }

  const baseMaterials = [];
  total.forEach(m => {
    for (let i = 0; i < baseMaterials.length; i++) {
      if (baseMaterials[i].name === m.name) {
        baseMaterials[i].quantity += m.quantity;
        return;
      }
    }
    const {quantity, name, image} = m;
    baseMaterials.push({ quantity, name, image });
  });
  return baseMaterials;
}

exports.buildings = buildings;
exports.materials = materials;
exports.products = products;