import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
mock.method(global, 'setTimeout', () => 0 as any);
mock.method(global, 'clearTimeout', () => {});

const { useStudio, defaultProject } = await import('../src/state/useStudio.js');

function reset() {
  useStudio.setState({
    project: structuredClone(defaultProject),
    activeTab: 'Layout',
    dirty: { layout: false, data: false, assets: false },
    canvas: { width: 1280, height: 720 },
  });
}

test('undo/redo restores deleted asset', () => {
  reset();
  const store = useStudio.getState();
  store.setAssets([{ alias: 'hero', name: 'Hero', src: '' }]);
  assert.equal(useStudio.getState().project.assets.length, 1);
  store.deleteAsset('hero');
  assert.equal(useStudio.getState().project.assets.length, 0);
  store.undo();
  assert.equal(useStudio.getState().project.assets.length, 1);
  store.redo();
  assert.equal(useStudio.getState().project.assets.length, 0);
});

test('new command clears redo stack', () => {
  reset();
  const store = useStudio.getState();
  store.setAssets([{ alias: 'a1', name: '', src: '' }]);
  store.setAssets([{ alias: 'a2', name: '', src: '' }]);
  store.undo();
  assert.equal(useStudio.getState().project.assets[0].alias, 'a1');
  store.setAssets([{ alias: 'a3', name: '', src: '' }]);
  store.redo();
  assert.equal(useStudio.getState().project.assets[0].alias, 'a3');
});

test('history capped at 10 commands', () => {
  reset();
  const store = useStudio.getState();
  for (let i = 1; i <= 11; i++) {
    store.setAssets([{ alias: `a${i}`, name: '', src: '' }]);
  }
  for (let i = 0; i < 11; i++) {
    store.undo();
  }
  const assets = useStudio.getState().project.assets;
  assert.equal(assets.length, 1);
  assert.equal(assets[0].alias, 'a1');
});
