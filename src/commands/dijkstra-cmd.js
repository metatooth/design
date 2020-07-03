import {Vector3} from 'three';

import {Command} from './command.js';

/**
 * Description: dijkstra command
 * @constructor
 * @param {Editor} editor: the editor the command acts within
 * @param {Vector3} source: starting point
 * @param {Vector3} target: finish point
 * interpret the command
 */
function DijkstraCmd( editor, source, target ) {
  Command.call( this, editor );
  this.type = 'DijkstraCmd';
  this.source = source;
  this.target = target;
}

DijkstraCmd.prototype = Object.assign( Object.create( Command.prototype ), {
  constructor: DijkstraCmd,

  isDijkstraCmd: true,

  execute: function() {
    console.log(this.source);
    console.log(this.target);
    const length = this.editor.component.children.length;
    this.dijkstra(this.editor.component.children[length-1],
        this.source,
        this.target);
  },

  unexecute: function() {
  },

  /**
   * If true, the command can be unexecuted.
   * @return {boolean}
   */
  reversible: function() {
    return true;
  },

  /** should be #protected **/

  dijkstra: function(graph, source, target) {
    const now = new Date;

    const positions = graph.geometry.getAttribute('position');

    const dist = new Map;
    const prev = new Map;
    const Q = [];

    for (let i = 0, l = positions.count; i < l; i = i + positions.itemSize) {
      const v = new Vector3(positions.array[i],
          positions.array[i+1],
          positions.array[i+2]);
      dist.set(v, null);
      prev.set(v, undefined);
      Q.push(v);
    }

    dist.set(source, 0);

    const u = new Vector3;
    dist.forEach(function(value, key, map) {
      if (value == 0) {
        u.x = key.x;
        u.y = key.y;
        u.z = key.z;
      }
    });

    console.log('0 at ', u);

    const index = Q.indexOf(u);
    console.log(index);
    console.log(Q.length);

    for (let i = 0, l = Q.length; i < l; i++) {
      if (Math.abs(u.distanceTo(Q[i])) < 1) {
        console.log('Equals! ', i, Q[i]);
        break;
      }
    }

    if (index !== -1) Q.splice(index, 1);

    console.log(Q.length);

    console.log('Dijkstra\'s Algorithm done. ',
        ((new Date) - now), 'ms elapsed.');
  },

});

export {DijkstraCmd};
