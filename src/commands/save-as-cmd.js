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

import AssetsService from '../api-services/assets.js';
import {Command} from './command.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as AWS from 'aws-sdk';
import * as md5 from 'blueimp-md5';

/**
 * Description: save as command
 * @constructor
 * @param {Editor} editor: the editor the command acts within
 */
function SaveAsCmd( editor ) {
  Command.call( this, editor, null );
}

SaveAsCmd.prototype = Object.assign( Object.create( Command.prototype ), {
  constructor: SaveAsCmd,

  isSaveAsCmd: true,

  execute: function() {
    const scope = this;
    const exporter = new GLTFExporter;
    exporter.parse(this.editor.component, function( gltf ) {
      console.log( gltf );

      AWS.config.update({
        region: process.env.VUE_APP_AWS_REGION,
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: process.env.VUE_APP_AWS_REGION + ':' +
            process.env.VUE_APP_AWS_IDENTITY_POOL_ID,
        }),
      });

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
      const gltfName = year + '/' + month + '/' + day + '/' + md5sum +
          '.gltf';
      const gltfKey = encodeURIComponent(gltfName);

      console.log(gltfName);
      console.log(gltfKey);

      const params = {
        Bucket: process.env.VUE_APP_S3_BUCKET_NAME,
        Key: gltfName,
        Body: Buffer.from(JSON.stringify(gltf)),
        ACL: 'public-read',
      };

      const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: process.env.VUE_APP_S3_BUCKET_NAME},
      });

      s3.upload(params, {}, function(err, data) {
        if (err) {
          console.log(err, data);
        } else {
          console.log(data['Key']);
          console.log(data['ETag']);
          console.log(data['Bucket']);
          const params = {data: {
            name: scope.editor.component.name,
            url: data['Location'],
            mime_type: 'model/vnd.gltf+json',
            service: 's3',
            bucket: data['Bucket'],
            s3key: data['Key'],
            etag: data['ETag'],
          }};
          console.log(params);
          AssetsService.create(params).then(( response ) => {
            console.log( response );
          }).catch(( error ) => {
            console.log('ERR ', error );
          });
        }
      });
    });
  },

});

export {SaveAsCmd};
