/**
 * An undirected graph represented by an adjacency list.
 * @constructor
 */
function Graph() {
  this.type = 'Graph';
  this.adjacency = new Map;
  this.size = 20;
  this.vertices = [this.size];
  for (let i = 0; i < this.size; i++) {
    this.vertices[i] = [this.size];
    for (let j = 0; j < this.size; j++) {
      this.vertices[i][j] = [this.size];
      for (let k = 0; k < this.size; k++) {
        this.vertices[i][j][k] = [];
      }
    }
  }
  this.count = 0;
  this.epsilon = 1e-06;
}

Object.assign( Graph.prototype, {
  constructor: Graph,

  isGraph: true,

  addVertex: function(v) {
    const i = Math.floor(v.x) + this.size/2;
    const j = Math.floor(v.y) + this.size/2;
    const k = Math.floor(v.z) + this.size/2;

    let found = false;
    for (let q = 0, l = this.vertices[i][j][k].length; q < l; q++) {
      if (this.vertices[i][j][k][q].distanceTo(v) < this.epsilon) {
        found = true;
        break;
      }
    }

    if (!found) {
      this.vertices[i][j][k].push(v);
      this.adjacency.set(this.id(v), []);
      this.count++;
    }
  },

  addEdge: function(v, w) {
    this.adjacency.get(this.id(v)).push(w);
    this.adjacency.get(this.id(w)).push(v);
  },

  get: function(key) {
    const json = JSON.parse(key);
    return this.vertices[json.i][json.j][json.k][json.index];
  },

  id: function(v) {
    const i = Math.floor(v.x) + this.size/2;
    const j = Math.floor(v.y) + this.size/2;
    const k = Math.floor(v.z) + this.size/2;

    let id = {};

    for (let q = 0, l = this.vertices[i][j][k].length; q < l; q++) {
      if (this.vertices[i][j][k][q].equals(v)) {
        id = {i: i, j: j, k: k, index: q};
        break;
      }
    }

    return JSON.stringify(id);
  },
});

export {Graph};

