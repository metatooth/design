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

import {S3} from './api-services/s3.js';
import AssetsService from './api-services/assets.js';
import * as md5 from 'blueimp-md5';

import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';

import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';

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

  exists: function(name) {

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

  retrieve: function(name, component) {
    return new Promise((resolve, reject) => {
      if (!this.compMap.has(name)) {
        this.loadAssetJson(name)
            .then((data) => this.loadAsset(data.url))
            .then((mesh) => this.createComponent(name, mesh))
            .then((component) => resolve(component))
            .catch((error) => console.log(error));
      } else {
        resolve(this.compMap.get(name));
      }
    });
  },

  save: function(component, name) {
    return new Promise((resolve, reject) => {
      this.exportGltf(component)
          .then((gltf) => this.makeUri(gltf))
          .then((resp) => this.upload(resp))
          .then((data) => this.createAssetJson(data))
          .then((params) => this.createAsset(params))
          .then((data) => resolve(true))
          .catch((error) => console.log(error));
    });
  },

  valid: function(name, component) {
    if (this.compMap.has(name)) {
      component = this.compMap.get(name);
      return true;
    }
    return false;
  },

  /** protected? */

  createAsset: function(params) {
    console.log('createAsset ~> ', params);
    return AssetsService.create(params)
        .then((response) => {
          return response.data.data;
        });
  },

  createAssetJson: function(data) {
    console.log('createAssetJson ~> ', data);
    return new Promise((resolve, reject) => {
      const params = {data: {
        url: data['Location'],
        mime_type: 'model/gltf+json',
        service: 's3',
        bucket: data['Bucket'],
        s3key: data['Key'],
        etag: data['ETag'],
      }};
      resolve(params);
    });
  },

  createComponent: function(name, object) {
    console.log('createComponent ', name, object);
    return new Promise((resolve, reject) => {
      if (object.type == 'Mesh') {
        const component = new Component(object);
        this.compMap.set(name, component);
        resolve(component);
      } else {
        const component = new Component();
        console.log(object.scene.children.length);
        for (let i = 0, l = object.scene.children.length; i < l; ++i) {
          if (object.scene.children[i].name == '<STL_BINARY>') {
            component.add(object.scene.children[i].children[0]);
          } else {
            component.add(object.scene.children[i]);
          }
        }
        this.compMap.set(name, component);
        resolve(component);
      }
    });
  },

  createName: function(gltf) {
    console.log('createName ~> ', gltf);
    return new Promise((resolve, reject) => {
      const dateObj = new Date;
      let month = dateObj.getUTCMonth() + 1;

      if (month < 10) {
        month = '0' + month;
      }

      let day = dateObj.getUTCDate();

      if (day < 10) {
        day = '0' + day;
      }

      const year = dateObj.getUTCFullYear();

      const md5sum = md5(gltf);
      resolve(year + '/' + month + '/' + day + '/' + md5sum + '.gltf');
    });
  },

  exportGltf: function(component) {
    console.log('exportGltf ~> ', component);
    const exporter = new GLTFExporter;
    return new Promise((resolve, reject) => {
      exporter.parse(component, (gltf) => {
        resolve(gltf);
      });
    });
  },

  upload: function(resp) {
    const s3 = new S3;
    return s3.upload(resp.data, resp.uri);
  },

  loadAssetJson: function(asset) {
    return AssetsService.get( asset )
        .then((response) => {
          return response.data.data;
        });
  },

  loadAsset: function(url) {
    console.log('loadAsset ~> ', url);
    return new Promise((resolve, reject) => {
      const m = url.match(/\.\w+$/);
      console.log(m[0]);
      if (m[0] == '.stl') {
        resolve(this.loadStlAsset(url));
      } else if (m[0] == '.gltf' || m[0] == '.glb') {
        resolve(this.loadGltfAsset(url));
      } else {
        reject(new Error('Unknown file extension ', m[0]));
      }
    });
  },

  loadStlAsset: function(url) {
    const loader = new STLLoader;
    const scope = this;
    return new Promise((resolve, reject) => {
      loader.load(url, function(geometry) {
        const material = new MeshPhongMaterial( {color: scope.color,
          specular: scope.specular,
          shininess: scope.shininess} );
        const mesh = new Mesh( geometry, material );
        mesh.translation = geometry.center();
        resolve(mesh);
      }, undefined, reject);
    });
  },

  loadGltfAsset: function(url) {
    const loader = new GLTFLoader;
    return new Promise((resolve, reject) => {
      loader.load(url, function(gltf) {
        resolve(gltf);
      }, undefined, reject);
    });
  },

  makeUri: function(gltf) {
    console.log('makeUri ~> ', gltf);
    return new Promise((resolve, reject) => {
      const dateObj = new Date;
      let month = dateObj.getUTCMonth() + 1;

      if (month < 10) {
        month = '0' + month;
      }

      let day = dateObj.getUTCDate();

      if (day < 10) {
        day = '0' + day;
      }

      const year = dateObj.getUTCFullYear();

      const md5sum = md5(JSON.stringify(gltf));
      resolve({data: gltf,
        uri: year + '/' + month + '/' + day + '/' + md5sum + '.gltf'});
    });
  },

});

export {Catalog};
