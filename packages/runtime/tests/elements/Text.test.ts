import test from 'node:test';
import assert from 'node:assert/strict';
import { Text } from '../../src/elements/Text.js';
import { createMockRenderer } from '../mocks.js';

const renderer = createMockRenderer();

test('Text measure uses word wrap', () => {
  const txt = new Text(renderer, 'hello world', { fill: '#fff', fontSize: 10 });
  txt.measure({ width: 40, height: Infinity });
  assert.deepEqual(txt.desired, { width: 36, height: 20 });
});

test('Text arrange centers content', () => {
  const txt = new Text(renderer, 'hello world', { fill: '#fff', fontSize: 10 });
  txt.hAlign = 'Center';
  txt.vAlign = 'Center';
  txt.arrange({ x: 0, y: 0, width: 100, height: 30 });
  assert.deepEqual(txt.final, { x: 0, y: 0, width: 100, height: 30 });
  const render = txt.text as any;
  assert.equal(render.x, 17);
  assert.equal(render.y, 10);
});
