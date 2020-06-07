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
import {Raycaster} from 'three';
import {SphereGeometry} from 'three';
import {Vector2} from 'three';

import {DragManip} from './drag-manip.js';

/**
 * Description: Mousedown. Drag... Mouseup.
 * @param {Viewer} viewer - visualization
 * @param {Rubberband} rubberband - used to track mouse movement
 */
function VertexManip( viewer, rubberband ) {
  DragManip.call( this, viewer, rubberband );

  this.type = 'VertexManip';

  this.raycaster = new Raycaster;

  this.radius = 0.3;
  this.div = 32;
  this.color = 0xff33bb;
  this.specular = 0x111111;
  this.shininess = 100;
}

VertexManip.prototype = Object.assign( Object.create( DragManip.prototype ), {
  constructor: VertexManip,

  isVertexManip: true,

  /**
   * @param {Event} event - is dragging
   * @return {boolean}
   */
  manipulating: function( event ) {
    const x = ( event.clientX / window.innerWidth ) * 2 - 1;
    const y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    if ( event.type == 'mousemove' ) {
      this.rubberband.track( x, y );
    } else if ( event.type == 'mousedown' ) {
      if ( event.button == 0 ) {
        this.raycaster.setFromCamera( new Vector2( x, y ), this.viewer.camera );

        const intersects = this.raycaster.intersectObject( this.viewer.mesh() );

        if ( intersects.length > 0 ) {
          const geometry = new SphereGeometry( this.radius,
              this.div, this.div );
          const material = new MeshPhongMaterial( {color: this.color,
            specular: this.specular, shininess: this.shininess} );
          const sphere = new Mesh( geometry, material );
          sphere.position.x = intersects[0].point.x;
          sphere.position.y = intersects[0].point.y;
          sphere.position.z = intersects[0].point.z;

          this.viewer.scene.add( sphere );
        }
      } else if ( event.button == 1 ) {
        return false;
      } else if ( event.button == 2 ) {
        this.raycaster.setFromCamera( new Vector2( x, y ), this.viewer.camera );

        const intersects = this.raycaster.intersectObjects(
            this.viewer.scene.children );

        for ( let i = 0, l = intersects.length; i < l; i++ ) {
          if ( intersects[i].object.geometry.constructor.name ==
               'SphereGeometry' ) {
            this.viewer.scene.remove( intersects[0].object );
          }
        }
      }
    } else if ( event.type == 'mouseup' ) {
      return false;
    }
    return true;
  },
});

export {VertexManip};
