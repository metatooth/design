import {S3} from './api-services/S3.js';
import {HTTP} from './api-services/http-common.js';
import * as md5 from 'blueimp-md5';

import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';
import {Object3D} from 'three';
import {Vector3} from 'three';

import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader.js';

import {JSONLoader} from './loaders/JSONLoader.js';
import {JSONExporter} from './exporters/JSONExporter.js';

/**
 * A catalog manages persistent information
 * @constructor
 */
function Catalog() {
  this.type = 'Catalog';

  this.compMap = new Map;
}

Object.assign( Catalog.prototype, {
  constructor: Catalog,

  isCatalog: true,

  create: function(component, name) {
    return new Promise((resolve, reject) => {
      this.exportJson(component)
          .then((json) => this.makeUri(json))
          .then((resp) => this.upload(resp))
          .then((data) => this.makeJson(data))
          .then((json) => this.jsonCreate(json, name))
          .then((resp) => resolve(resp));
    });
  },

  exists: function(name) {
    console.log('not implemented!');
  },

  forget: function(component) {
    const iter = this.compMap.entries();
    let result = iter.next();
    while (!result.done) {
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
        HTTP.get(name)
            .then((response) => this.parseData(response.data.data))
            .then((object) => this.createComponent(name, object))
            .then((comp) => resolve(comp));
      } else {
        resolve(this.compMap.get(name));
      }
    });
  },

  save: function(component, name) {
    return new Promise((resolve, reject) => {
      this.exportJson(component)
          .then((json) => this.makeUri(json))
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
    return new Promise((resolve, reject) => {
      if (name.match(/revisions\/[0-9a-f]*$/)) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  },

  createComponent: function(name, object) {
    return new Promise((resolve, reject) => {
      this.compMap.set(name, object);
      resolve(object);
    });
  },

  exportJson: function(component) {
    const exporter = new JSONExporter;
    return new Promise((resolve, reject) => {
      exporter.parse(component, (json) => {
        resolve(json);
      });
    });
  },

  jsonCreate: function(data, name) {
    let postpath;
    if (name.match(/^\/plans\/[0-9a-f]*/)) {
      postpath = name + '/revisions';
    } else {
      postpath = '/plans';
      data.data.name = name;
    }

    return HTTP.post(postpath, data)
        .then((response) => {
          const newname = postpath + '/' + response.data.data.locator;
          const comp = this.compMap.get(name);
          this.forget(comp);
          this.compMap.set(newname, comp);
          return true;
        })
        .catch((error) => {
          return false;
        });
  },

  jsonSave: function(data, name) {
    return this.writable(name).then((ok) => {
      if (ok) {
        return HTTP.put(name, data)
            .then((response) => {
              return true;
            })
            .catch((error) => {
              return false;
            });
      } else {
        return false;
      }
    });
  },

  parseData: function(data) {
    return new Promise((resolve, reject) => {
      let url;
      let revision;
      if (data.url) {
        url = data.url;
      } else {
        const latest = data.revisions.length - 1;
        revision = data.revisions[latest].locator;
        console.log(revision);
        url = data.revisions[latest].location;
      }

      const m = url.match(/\.\w+$/);
      if (m[0] == '.stl' || m[0] == '.ply') {
        let loader;
        if (m[0] == '.stl') {
          loader = new STLLoader();
        } else if (m[0] == '.ply') {
          loader = new PLYLoader();
        }

        loader.load( url, function( geometry ) {
          const material = new MeshPhongMaterial( {
            color: 0x00bbee,
            specular: 0x2d2d2d,
            shininess: 40,
          } );

          const mesh = new Mesh(geometry, material);

          console.log(geometry.attributes);

          if (!geometry.attributes.normal) {
            console.log('no normals, computing...');
            geometry.computeVertexNormals();
            console.log('done.');
          }

          mesh.name = 'maxillary';
          mesh.geometry.sourceUrl = url;
          geometry.computeBoundingBox();

          const off = new Vector3();
          geometry.boundingBox.getCenter(off);
          mesh.position.x = - off.x;
          mesh.position.y = - off.y;
          mesh.position.z = - off.z;

          const object = new Object3D();
          object.name = '<MetatoothRoot>';
          object.add(mesh);

          resolve(object);
        });
      } else if (m[0] == '.json') {
        const loader = new JSONLoader();
        loader.load( url, function( object ) {
          resolve(object);
        });
      } else {
        reject(new Error('Unknown file extension ', m[0]));
      }
    });
  },

  makeJson: function(data) {
    return new Promise((resolve, reject) => {
      const params = {data: {
        location: data['Location'],
        mime_type: 'application/json',
        service: 's3',
        bucket: data['Bucket'],
        s3key: data['Key'],
        etag: data['ETag'],
      }};
      resolve(params);
    });
  },

  makeUri: function(json) {
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

      const md5sum = md5(JSON.stringify(json));
      resolve({data: json,
        uri: year + '/' + month + '/' + day + '/' + md5sum + '.json'});
    });
  },

  upload: function(resp) {
    const s3 = new S3;
    return s3.upload(resp.data, resp.uri);
  },

});

export {Catalog};

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

