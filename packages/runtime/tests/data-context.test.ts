import test from 'node:test';
import assert from 'node:assert/strict';
import { StackPanel } from '../src/elements/StackPanel.js';
import { UIElement } from '@noxigui/core';

class Dummy extends UIElement {
  measure() {}
  arrange() {}
}

test('data context propagates to children', () => {
  const sp = new StackPanel();
  const a = new Dummy();
  const b = new Dummy();
  b.setDataContext('child');
  sp.add(a);
  sp.add(b);
  sp.setDataContext('parent');
  assert.equal(a.getDataContext(), 'parent');
  assert.equal(b.getDataContext(), 'child');
});
