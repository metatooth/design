import {JSONLoader} from './loaders/JSONLoader.js';

import {Component} from './component.js';

/**
 * Metaroot is the root node for component hierachies
 * @constructor
 */
function Metaroot() {
  Component.call(this);
  this.type = 'Metaroot';
}

Metaroot.prototype = Object.assign( Object.create( Component.prototype ), {
  constructor: Metaroot,

  isMetaroot: true,

  parse: function( url ) {
    const loader = new JSONLoader;
    const scope = this;
    return new Promise((resolve, reject) => {
      loader.load(url, function(data) {
        while (data.children.length > 0) {
          scope.add(data.children.pop());
        }
        resolve(scope);
      }, undefined, reject);
    });
  },

});

export {Metaroot};
