import {Vector3} from 'three';
import {DrawTool} from '../src/tools/draw-tool.js';

describe('DrawTool', () => {
  test('subdivides to [(0,0,0), (1,0,0)] by 0.2 to equal ...]', () => {
    const draw = new DrawTool();
    const a = new Vector3(0, 0, 0);
    const b = new Vector3(1, 0, 0);

    const points = draw.subdivide(a, b, 5);
    const result = [
      new Vector3(0, 0, 0),
      new Vector3(0.2, 0, 0),
      new Vector3(0.4, 0, 0),
      new Vector3(0.6, 0, 0),
      new Vector3(0.8, 0, 0),
    ];

    expect(points).toStrictEqual(result);
  });
});
