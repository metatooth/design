import {Component} from './component.js';

/**
 * Metamesh represents a triangular mesh, read/write format is STL
 * @constructor
 */
function Metamesh() {
  Component.call(this);
  this.type = 'Metamesh';
}

Metamesh.prototype = Object.assign( Object.create( Component.prototype ), {
  constructor: Metamesh,

  isMetamesh: true,

});

export {Metamesh};
