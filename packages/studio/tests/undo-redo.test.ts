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
  store.addAssets([{ alias: 'hero', name: 'Hero', src: '' }]);
  assert.equal(useStudio.getState().project.assets.length, 1);
  store.deleteAsset('hero');
  assert.equal(useStudio.getState().project.assets.length, 0);
  store.undo();
  assert.equal(useStudio.getState().project.assets.length, 1);
  store.redo();
  assert.equal(useStudio.getState().project.assets.length, 0);
});

test('undo/redo removes added asset', () => {
  reset();
  const store = useStudio.getState();
  store.addAssets([{ alias: 'hero', name: 'Hero', src: '' }]);
  assert.equal(useStudio.getState().project.assets.length, 1);
  store.undo();
  assert.equal(useStudio.getState().project.assets.length, 0);
  store.redo();
  assert.equal(useStudio.getState().project.assets.length, 1);
});

test('undo/redo restores multiple deleted assets at once', () => {
  reset();
  const store = useStudio.getState();
  store.addAssets([
    { alias: 'a1', name: '', src: '' },
    { alias: 'a2', name: '', src: '' },
  ]);
  assert.equal(useStudio.getState().project.assets.length, 2);
  store.deleteAssets(['a1', 'a2']);
  assert.equal(useStudio.getState().project.assets.length, 0);
  store.undo();
  assert.equal(useStudio.getState().project.assets.length, 2);
  store.redo();
  assert.equal(useStudio.getState().project.assets.length, 0);
});

test('new command clears redo stack', () => {
  reset();
  const store = useStudio.getState();
  store.addAssets([{ alias: 'a1', name: '', src: '' }]);
  store.addAssets([{ alias: 'a2', name: '', src: '' }]);
  store.undo();
  assert.deepEqual(
    useStudio.getState().project.assets.map((a) => a.alias),
    ['a1'],
  );
  store.addAssets([{ alias: 'a3', name: '', src: '' }]);
  store.redo();
  assert.deepEqual(
    useStudio.getState().project.assets.map((a) => a.alias),
    ['a1', 'a3'],
  );
});

test('history capped at 10 commands', () => {
  reset();
  const store = useStudio.getState();
  for (let i = 1; i <= 11; i++) {
    store.addAssets([{ alias: `a${i}`, name: '', src: '' }]);
  }
  for (let i = 0; i < 11; i++) {
    store.undo();
  }
  const assets = useStudio.getState().project.assets;
  assert.equal(assets.length, 1);
  assert.equal(assets[0].alias, 'a1');
});
