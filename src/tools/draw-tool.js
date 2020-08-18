import {BufferGeometry} from 'three';
import {BufferAttribute} from 'three';
import {Line} from 'three';
import {LineBasicMaterial} from 'three';
import {Vector3} from 'three';

import {Component} from '../component.js';
import {GrowingMultiLine} from '../rubberbands/growing-multi-line.js';
import {PasteCmd} from '../commands/paste-cmd.js';
import {ScribbleVertexManip} from '../manipulators/scribble-vertex-manip.js';
import {Tool} from './tool.js';

/**
 * Description: A tool for drawing.
 * @constructor
 */
function DrawTool() {
  Tool.call( this );

  this.type = 'DrawTool';
}

DrawTool.prototype = Object.assign( Object.create( Tool.prototype ), {
  constructor: DrawTool,

  isDrawTool: true,

  /**
   * @param {Viewer} viewer - the container
   * @param {Event} event - the starting event
   * @return {Manipulator}
   */
  create: function( viewer, event ) {
    if (event.type == 'mousedown') {
      const v = viewer.unproject( event.clientX, event.clientY );
      return new ScribbleVertexManip( viewer, new GrowingMultiLine(v), this );
    }
    return null;
  },

  /**
   * @param {Manipulator} manipulator - the manipulation to analyze
   * @return {Command}
   */
  interpret: function( manipulator ) {
    const length = manipulator.rubberband.children.length;


    if (length > 1) {
      let points = [];
      for (let i = 0, l = length - 1; i < l; ++i) {
        const a = manipulator.rubberband.children[i].position;
        const b = manipulator.rubberband.children[i+1].position;
        const d = a.distanceTo(b);

        points = points.concat( this.subdivide( a, b, Math.round(d / 0.1) ) );
      }

      const positions = new Float32Array( points.length * 3 );

      for (let i = 0, l = points.length; i < l; i++) {
        console.log('points', points[i].x, points[i].y, points[i].z);
        const client = manipulator.viewer.topleft( points[i] );
        console.log('points', client.x, client.y, client.z);
        const intersects = manipulator.raycast( points[i].x, points[i].y );

        if (intersects.length > 0) {
          positions[3*i] = intersects[0].point.x;
          positions[3*i+1] = intersects[0].point.y;
          positions[3*i+2] = intersects[0].point.z;
        }
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
      geometry.setDrawRange( 0, points.length );
      const material = new LineBasicMaterial( {color: 0x00dd77,
        linewidth: 10} );

      const line = new Line( geometry, material );

      return new PasteCmd( manipulator.viewer.editor, [new Component(line)] );
    }
    return null;
  },

  subdivide: function(a, b, steps) {
    const dir = new Vector3;
    dir.subVectors(b, a);

    const points = [];
    for (let i = 0; i < steps; i++) {
      points.push( a.clone().addScaledVector( dir, i/steps ) );
    }

    return points;
  },
});

export {DrawTool};
