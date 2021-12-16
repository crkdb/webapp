const { parseTSV, formatTime } = require('./utils');
const { getImage } = require('./images');

class Building {
  /**
   * @param {string[]} fields 
   */
  constructor(fields) {
    this.id = Number.parseInt(fields[0]);
    this.name = fields[1];
    this.limit = Number.parseInt(fields[2]);
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

    this.cost = Number.parseInt(fields[5]);
    this.quantity = Number.parseInt(fields[6]);

    const time = Number.parseInt(fields[4]);
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
    this.time = fields[3];
    this.ingredients = fields[4].split(/\s*,\s*/).map(line => {
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

const buildings = parseTSV(__dirname, 'buildings.tsv').map(fields => {
  return new Building(fields);
});

const materials = parseTSV(__dirname, 'materials.tsv').map(fields => {
  return new Material(fields, buildings);
});

const products = parseTSV(__dirname, 'products.tsv').map(fields => {
  return new Product(fields, buildings);
});

// push materials and products into building.[materials/products]
buildings.forEach(building => {
  building.materials = materials.filter(material => building.id === material.buildingID);
  building.products = products.filter(product => building.id === product.buildingID);
});

// grab the image for the product ingredients
products.forEach(product => {
  product.ingredients.forEach(ingredient => {
    const material = materials.find(m => m.single === ingredient.name);
    if (material) {
      ingredient.id = material.id;
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
  product.baseMaterials.sort((a, b) => {
    return a.id - b.id;
  });
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
    const {id, quantity, name, image} = ingredient;
    total.push({ id, quantity, name, image });
  }

  const baseMaterials = [];
  total.forEach(m => {
    for (let i = 0; i < baseMaterials.length; i++) {
      if (baseMaterials[i].name === m.name) {
        baseMaterials[i].quantity += m.quantity;
        return;
      }
    }
    const {id, quantity, name, image} = m;
    baseMaterials.push({ id, quantity, name, image });
  });
  return baseMaterials;
}

exports.getImage = getImage;
exports.buildings = buildings;
exports.materials = materials;
exports.products = products;
