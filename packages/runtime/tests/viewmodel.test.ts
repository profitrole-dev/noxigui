import test from 'node:test';
import assert from 'node:assert/strict';
import { Observable } from '../src/observable.js';
import { ViewModel } from '../src/viewmodel.js';

test('observable subscriptions', () => {
  const obs = new Observable<number>();
  let acc = 0;
  const fn = (v: number) => { acc += v; };
  obs.subscribe(fn);
  obs.notify(5);
  assert.equal(acc, 5);
  obs.unsubscribe(fn);
  obs.notify(5);
  assert.equal(acc, 5);
});

test('viewmodel notifies on property changes', () => {
  const vm = ViewModel({ a: 1 });
  const events: Array<{ property: string; value: number }> = [];
  vm.observable.subscribe((e) => events.push(e));
  vm.a = 2;
  assert.deepEqual(events, [{ property: 'a', value: 2 }]);
});

test('array mutations trigger single notifications', () => {
  const vm = ViewModel({ inv: [1, 2, 3] });
  const events: Array<{ property: string; value: any }> = [];
  (vm.inv as any).observable.subscribe((e: any) => events.push(e));
  vm.inv.push(4);
  vm.inv.shift();
  assert.equal(events.length, 2);
});

