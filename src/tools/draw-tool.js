import {BufferGeometry} from 'three';
import {BufferAttribute} from 'three';
import {Line} from 'three';
import {LineBasicMaterial} from 'three';

import {Component} from '../component.js';
import {GrowingVertices} from '../rubberbands/growing-vertices.js';
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
      return new ScribbleVertexManip( viewer, new GrowingVertices(v), this );
    }
    return null;
  },

  /**
   * @param {Manipulator} manipulator - the manipulation to analyze
   * @return {Command}
   */
  interpret: function( manipulator ) {
    const length = manipulator.rubberband.children.length;

    if (length > 0) {
      const positions = new Float32Array( length * 3 );
      for (let i = 0, l = length; i < l; ++i) {
        positions[3*i] = manipulator.rubberband.children[i].position.x;
        positions[3*i+1] = manipulator.rubberband.children[i].position.y;
        positions[3*i+2] = manipulator.rubberband.children[i].position.z;
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
      geometry.setDrawRange( 0, length );
      const material = new LineBasicMaterial( {color: 0x00dd77,
        linewidth: 10} );

      const line = new Line( geometry, material );

      return new PasteCmd( manipulator.viewer.editor, [new Component(line)] );
    }
    return null;
  },
});

export {DrawTool};
