import test from 'node:test';
import assert from 'node:assert/strict';
import { Image } from '../../src/elements/Image.js';
import { createMockRenderer } from '../mocks.js';

const renderer = createMockRenderer();

test('Image measure scales uniformly', () => {
  const img = new Image(renderer);
  img.setTexture({ width: 100, height: 80 });
  img.measure({ width: 50, height: 40 });
  assert.deepEqual(img.desired, { width: 50, height: 40 });
});

test('Image arrange applies alignment and stretch', () => {
  const img = new Image(renderer);
  img.setTexture({ width: 100, height: 80 });
  img.hAlign = 'Center';
  img.vAlign = 'Bottom';
  img.arrange({ x: 0, y: 0, width: 200, height: 200 });
  assert.deepEqual(img.final, { x: 0, y: 0, width: 200, height: 200 });
  const sprite = img.sprite as any;
  assert.equal(sprite.scaleX, 2);
  assert.equal(sprite.scaleY, 2);
  assert.equal(sprite.x, 0);
  assert.equal(sprite.y, 40);
});
