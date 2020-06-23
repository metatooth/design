/*
 * Copyright (c) 1990, 1991 Stanford University
 *
 * Permission to use, copy, modify, distribute, and sell this software and its
 * documentation for any purpose is hereby granted without fee, provided
 * that the above copyright notice appear in all copies and that both that
 * copyright notice and this permission notice appear in supporting
 * documentation, and that the name of Stanford not be used in advertising or
 * publicity pertaining to distribution of the software without specific,
 * written prior permission.  Stanford makes no representations about
 * the suitability of this software for any purpose.  It is provided "as is"
 * without express or implied warranty.
 *
 * STANFORD DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,
 * INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
 * IN NO EVENT SHALL STANFORD BE LIABLE FOR ANY SPECIAL, INDIRECT OR
 * CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
 * DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION
 * WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';

import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

import AssetsService from './api-services/assets.js';

import {Component} from './components/component.js';

/**
 * Description: manages persistent information
 * @constructor
 */
function Catalog() {
  this.type = 'Catalog';

  this.compMap = new Map;
  this.color = 0x00bbee;
  this.specular = 0x222222;
  this.shininess = 40;
}

Object.assign( Catalog.prototype, {
  constructor: Catalog,

  isCatalog: true,

  /**
   * Description: Save coomponent and identify with name.
   * @param {Component} component
   * @param {String} name
   * @return {Boolean}
   */
  save: function(component, name) {
    const ok = this.assetSave(component, name);
    if (ok) {
      this.compMap.set(name, component);
    }
    return ok;
  },

  retrieve: function(name) {
    return new Promise((resolve, reject) => {
      if (!this.compMap.has(name)) {
        this.loadAssetJson(name)
            .then((data) => this.loadAsset(data.url))
            .then((geometry) => this.createMesh(geometry))
            .then((mesh) => this.createComponent(name, mesh))
            .then((component) => resolve(component));
      } else {
        resolve(this.compMap.get(name));
      }
    });
  },

  valid: function(name, component) {
    if (this.compMap.has(name)) {
      component = this.compMap.get(name);
      return true;
    }
    return false;
  },

  forget: function(component) {
    const iter = this.compMap.keys();
    let result = iter.next();
    while (!result.done) {
      if (result.value == component) {
        this.compMap.delete(result.name);
        break;
      }
      result = iter.next();
    }
  },

  name: function(component) {
    const iter = this.compMap.keys();
    let result = iter.next();
    while (!result.done) {
      if (result.value == component) {
        return result.name;
      }
      result = iter.next();
    }
  },

  /** protected? */

  loadAssetJson: function(asset) {
    return AssetsService.get( asset )
        .then((response) => {
          return response.data.data;
        });
  },

  loadAsset: function(url) {
    const loader = new STLLoader;
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  },

  createMesh: function(geometry) {
    return new Promise((resolve, reject) => {
      const material = new MeshPhongMaterial( {color: this.color,
        specular: this.specular,
        shininess: this.shininess} );
      const mesh = new Mesh( geometry, material );
      mesh.translation = geometry.center();
      resolve(mesh);
    });
  },

  createComponent: function(name, mesh) {
    return new Promise((resolve, reject) => {
      const component = new Component(mesh);
      this.compMap.set(name, component);
      resolve(component);
    });
  },

});

export {Catalog};
