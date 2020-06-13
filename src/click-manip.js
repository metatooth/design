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

import {Raycaster} from 'three';
import {Vector2} from 'three';
import {Vector3} from 'three';

import {Manipulator} from './manipulator';

/**
 * Description: A single click. Mousedown will raycast from mouse
 * location and create a SphereGeometry if an interesect with the
 * viewer's mesh occurs.
 * @param {Viewer} viewer: the owning viewer, used for raycasting
 * @param {Tool} tool: for user interaction
 */
function ClickManip( viewer, tool ) {
  Manipulator.call( this );

  this.type = 'ClickManip';

  this.viewer = viewer;
  this.tool = tool;

  this.found = false;
  this.point = new Vector3;
}

ClickManip.prototype = Object.assign( Object.create( Manipulator.prototype ), {
  constructor: ClickManip,

  isClickManip: true,

  /**
   * Description: checks the mouse position of the event to see if it
   * intersects with the target mesh.
   * @param {Event} event - event to check for interesection
   */
  grasp: function( event ) {
    if (event.type == 'mousedown') {
      this.viewer.controls.enabled = false;
      this.viewer.controls.saveState();

      const mouse = new Vector2;
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      const raycaster = new Raycaster;
      raycaster.setFromCamera( mouse, this.viewer.camera );
      const intersects = raycaster.intersectObject( this.viewer.mesh() );

      if ( intersects.length > 0 ) {
        this.point = intersects[0].point;
        this.found = true;
      }
    }
  },

  /**
   * @param {Event} event
   */
  effect: function( event ) {
    this.viewer.controls.reset();
    this.viewer.controls.enabled = true;
  },


});

export {ClickManip};
