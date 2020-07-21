import {Vector3} from 'three';
import {BufferGeometry} from 'three';
import {BufferAttribute} from 'three';
import {Line} from 'three';
import {LineBasicMaterial} from 'three';

import {Component} from '../component.js';

import {Command} from './command.js';
import {PasteCmd} from './paste-cmd.js';

import {Graph} from '../graph.js';

/**
 * Description: dijkstra command
 * @constructor
 * @param {Editor} editor the editor the command acts within
 * @param {Vector3} source starting point
 * @param {Vector3} target finish point
 */
function DijkstraCmd( editor, source, target ) {
  Command.call( this, editor );
  this.type = 'DijkstraCmd';
  this.source = source;
  this.target = target;
  this.epsilon = 1e-06;
}

DijkstraCmd.prototype = Object.assign( Object.create( Command.prototype ), {
  constructor: DijkstraCmd,

  isDijkstraCmd: true,

  execute: function() {
    const now = new Date;
    console.log(this.source);
    console.log(this.target);

    let mesh;
    for (let i = 0, l = this.editor.component.children.length; i < l; i++) {
      if (this.editor.component.children[i].type == 'Mesh') {
        mesh = this.editor.component.children[i];
        break;
      }
    }

    let positions = null;
    if (mesh.geometry.index) {
      positions = mesh.geometry.toNonIndexed().getAttribute('position');
    } else {
      positions = mesh.geometry.getAttribute('position');
    }

    console.log('positions ', positions.count);

    const graph = new Graph;
    for (let i = 0, l = positions.count; i < l; i = i + 9) {
      const a = new Vector3(positions.array[i],
          positions.array[i+1],
          positions.array[i+2]);
      graph.addVertex(a);

      const b = new Vector3(positions.array[i+3],
          positions.array[i+4],
          positions.array[i+5]);
      graph.addVertex(b);

      const c = new Vector3(positions.array[i+6],
          positions.array[i+7],
          positions.array[i+8]);
      graph.addVertex(c);

      graph.addEdge(a, b);
      graph.addEdge(a, c);
      graph.addEdge(b, c);
    }

    console.log(graph);
    console.log(((new Date) - now), 'ms elapsed.');

    console.log('source vector3', this.source);
    console.log('target vector3', this.target);

    if (!this.source.equals(this.target)) {
      const results = this.dijkstra(graph, this.source, this.target);
      console.log('Done. ', ((new Date) - now), 'ms elapsed.');

      console.log('Found path of length', results.length);

      const newPositions = new Float32Array(3*results.length);
      for (let i = 0, l = results.length; i < l; i++) {
        newPositions[3*i] = results[i].x;
        newPositions[3*i+1] = results[i].y;
        newPositions[3*i+2] = results[i].z;
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute( 'position',
          new BufferAttribute( newPositions, 3 ));
      geometry.setDrawRange( 0, results.length );
      const material = new LineBasicMaterial({color: 0x00bbee,
        linewidth: 5});

      const line = new Line( geometry, material );
      const cmd = new PasteCmd( this.editor, [new Component(line)] );
      cmd.execute();
    }
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

  /**
   * Perform Dijkstra's algorithm
   * @protected
   * @param {Graph} graph
   * @param {Vector3} source
   * @param {Vector3} target
   * @return {Vector3[]}
   */
  dijkstra: function(graph, source, target) {
    const dist = new Map;
    const prev = new Map;
    const Q = new Map;

    for (const key of graph.adjacency.keys()) {
      dist.set(key, Infinity);
      prev.set(key, undefined);
      Q.set(key, undefined);
    }

    const sid = graph.id(source);
    const tid = graph.id(target);

    console.log('source id', sid);
    console.log('target id', tid);

    dist.set(sid, 0);

    while (Q.size > 0) {
      console.log('** Q size **', Q.size);
      let distU = Infinity;
      let uid = null;
      dist.forEach(function(value, key, map) {
        if (value < distU) {
          distU = value;
          uid = key;
        }
      });

      console.log('min u', uid);

      if (!Q.delete(uid)) console.log('Q deletion failed!', uid);
      if (!dist.delete(uid)) console.log('dist deletion failed!', uid);

      if (uid === tid) break;

      const adjacency = graph.adjacency.get(uid);

      let alt;
      for (let i = 0, l = adjacency.length; i < l; i++) {
        const v = adjacency[i];
        const vid = graph.id(v);
        const u = graph.get(uid);
        alt = distU + u.distanceTo(v);
        if (alt < dist.get(vid)) {
          dist.set(vid, alt);
          prev.set(vid, uid);
        }
      }
    }

    const S = [];

    let uid = tid;
    if (prev.has(uid) || uid === sid) {
      while (uid) {
        S.unshift(graph.get(uid));
        uid = prev.get(uid);
      }
    }

    return S;
  },

});

export {DijkstraCmd};
