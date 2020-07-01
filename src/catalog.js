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
import {HTTP} from './api-services/http-common.js';
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

  create: function(component, name) {
    return new Promise((resolve, reject) => {
      this.exportGltf(component)
          .then((gltf) => this.makeUri(gltf))
          .then((resp) => this.upload(resp))
          .then((data) => this.makeJson(data))
          .then((json) => this.jsonCreate(json, name))
          .then((resp) => resolve(resp));
    });
  },

  exists: function(name) {

  },

  forget: function(component) {
    const iter = this.compMap.entries();
    let result = iter.next();
    while (!result.done) {
      console.log('forgot? ', result);
      if (result.value[1] == component) {
        this.compMap.delete(result.value[0]);
        break;
      }
      result = iter.next();
    }
  },

  name: function(component) {
    const iter = this.compMap.keys();
    let result = iter.next();
    while (!result.done) {
      if (this.compMap.get(result.value) == component) {
        return result.value;
      }
      result = iter.next();
    }
  },

  retrieve: function(name) {
    return new Promise((resolve, reject) => {
      if (!this.compMap.has(name)) {
        this.jsonRetrieve(name)
            .then((data) => this.loadData(data))
            .then((resp) => this.createComponent(name, resp.data, resp.object))
            .then((comp) => resolve(comp));
      } else {
        console.log('name is ', name);
        console.log('we already got one! ', this.compMap.get(name));
        resolve(this.compMap.get(name));
      }
    });
  },

  save: function(component, name) {
    return new Promise((resolve, reject) => {
      this.exportGltf(component)
          .then((gltf) => this.makeUri(gltf))
          .then((resp) => this.upload(resp))
          .then((data) => this.makeJson(data))
          .then((json) => this.jsonSave(json, name))
          .then((resp) => resolve(resp));
    });
  },

  valid: function(name, component) {
    if (this.compMap.has(name)) {
      component = this.compMap.get(name);
      return true;
    }
    return false;
  },

  writable: function(name) {

  },

  /** protected? */

  createComponent: function(name, data, object) {
    return new Promise((resolve, reject) => {
      const component = new Component();

      const children = object.scene.children;
      const only = object.scene.children[0];

      if (only.name == '<STL_BINARY>') {
        component.add(only.children[0]);
      } else {
        console.log('scene.children ', children);
        console.log('scene.children.length ', children.length);

        for (let i = 0, l = children.length; i < l; i++) {
          console.log(children[i]);
          component.add(children[i]);
        }
      }
      console.log('name ~> ', name);
      const newname = name + '/revisions/' + data.number;
      console.log('newname ~> ', newname);
      console.log(this.compMap.size);
      this.compMap.set(name, component);
      console.log(this.compMap.size);
      console.log(this.compMap);
      resolve(component);
    });
  },

  exportGltf: function(component) {
    console.log('exportGltf ~> ', component);
    const exporter = new GLTFExporter;
    return new Promise((resolve, reject) => {
      exporter.parse(component, (gltf) => {
        console.log(gltf);
        resolve(gltf);
      });
    });
  },

  jsonCreate: function(data, name) {
    console.log('JSON CREATE');
    console.log(data);
    console.log(name);
    const postpath = name + '/revisions';
    console.log('postpath ~> ', postpath);

    return HTTP.post(postpath, data)
        .then((response) => {
          console.log('jsonCreate ~> HTTP.post ~> ', response);
          console.log(response.data.number);

          console.log(this.compMap.size);
          console.log(this.compMap);
          const newname = postpath + '/' + response.data.locator;
          console.log(name);
          const comp = this.compMap.get(name);
          console.log(comp);
          this.forget(comp);
          console.log(this.compMap.size);
          console.log(this.compMap);
          console.log('newname ~> ', newname);
          this.compMap.set(newname, comp);
          console.log(this.compMap.size);
          console.log(this.compMap);

          return true;
        })
        .catch((error) => {
          console.log('error at jsonCreate: ', error);
          return false;
        });
  },

  jsonRetrieve: function(name) {
    console.log('JSON RETRIEVE');
    console.log(name);
    return HTTP.get( name )
        .then((response) => {
          const latest = response.data.data.revisions.length - 1;
          console.log(latest);
          console.log(response.data.data.revisions[latest]);
          return response.data.data.revisions[latest];
        });
  },

  jsonSave: function(data, name) {
    console.log('JSON SAVE');
    console.log(data);
    console.log(name);
    return HTTP.put(name, data)
        .then((response) => {
          console.log('jsonSave ~> HTTP.put ~> ', response);
          console.log(response);
          return true;
        })
        .catch((error) => {
          console.log('error at jsonSave: ', error);
          return false;
        });
  },

  upload: function(resp) {
    const s3 = new S3;
    return s3.upload(resp.data, resp.uri);
  },

  loadData: function(data) {
    const url = data.location;
    console.log('loadData ~> ', url);
    return new Promise((resolve, reject) => {
      const m = url.match(/\.\w+$/);
      console.log(m[0]);
      if (m[0] == '.stl') {
        this.loadStl(url)
            .then((resp) => {
              const params = {
                data: data,
                object: resp,
              };
              resolve(params);
            });
      } else if (m[0] == '.gltf' || m[0] == '.glb') {
        this.loadGltf(url)
            .then((resp) => {
              const params = {
                data: data,
                object: resp,
              };
              resolve(params);
            });
      } else {
        reject(new Error('Unknown file extension ', m[0]));
      }
    });
  },

  loadStl: function(url) {
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

  loadGltf: function(url) {
    const loader = new GLTFLoader;
    return new Promise((resolve, reject) => {
      loader.load(url, function(gltf) {
        resolve(gltf);
      }, undefined, reject);
    });
  },

  makeJson: function(data) {
    console.log('makeJson ~> ', data);
    return new Promise((resolve, reject) => {
      const params = {data: {
        location: data['Location'],
        mime_type: 'model/gltf+json',
        service: 's3',
        bucket: data['Bucket'],
        s3key: data['Key'],
        etag: data['ETag'],
      }};
      resolve(params);
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
