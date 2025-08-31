import test from 'node:test';
import assert from 'node:assert/strict';
import { ItemsControl } from '../src/elements/ItemsControl.js';
import { UIElement } from '@noxigui/core';

class Dummy extends UIElement {
  measure() {}
  arrange() {}
}

test('items control regenerates children when source changes', () => {
  const ic = new ItemsControl();
  ic.itemTemplate = () => new Dummy();
  ic.itemsSource = [1, 2];
  const panel: any = ic.itemsPanel as any;
  assert.equal(panel.children.length, 2);
  assert.equal(panel.children[0].getDataContext(), 1);
  assert.equal(panel.children[1].getDataContext(), 2);

  ic.itemsSource = ['a'];
  assert.equal(panel.children.length, 1);
  assert.equal(panel.children[0].getDataContext(), 'a');
});

