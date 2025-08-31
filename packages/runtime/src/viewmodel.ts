import { Observable } from './observable.js';

export type Change<T extends object> = { property: keyof T; value: T[keyof T] };

export type ObservableObject<T extends object> = T & { observable: Observable<Change<T>> };

/**
 * Wrap an object in a proxy that notifies on property assignments. Nested
 * objects and arrays are automatically wrapped so that changes to deep fields
 * also trigger notifications.
 */
export function ViewModel<T extends object>(obj: T): ObservableObject<T> {
  const observable = new Observable<Change<T>>();
  let suppress = false;

  const wrap = (val: any): any => {
    if (val && typeof val === 'object' && !(val as any).observable) {
      return ViewModel(val);
    }
    return val;
  };

  const init = (o: any) => {
    if (Array.isArray(o)) {
      for (let i = 0; i < o.length; i++) o[i] = wrap(o[i]);
    } else {
      for (const k of Object.keys(o)) o[k] = wrap(o[k]);
    }
  };

  init(obj);

  const arrayMethods = new Set(['push','pop','shift','unshift','splice','sort','reverse']);

  return new Proxy(obj as ObservableObject<T>, {
    get(target, prop, receiver) {
      if (prop === 'observable') return observable;
      const value = Reflect.get(target, prop, receiver);

      if (Array.isArray(target) && arrayMethods.has(prop as string) && typeof value === 'function') {
        return (...args: any[]) => {
          suppress = true;
          const result = (value as Function).apply(target, args.map(wrap));
          init(target);
          suppress = false;
          observable.notify({ property: 'length' as any, value: target.length } as Change<any>);
          return result;
        };
      }

      return wrap(value);
    },
    set(target, prop, value, receiver) {
      if (prop === 'observable') return false;
      const wrapped = wrap(value);
      const result = Reflect.set(target as any, prop, wrapped, receiver);
      if (!suppress) {
        observable.notify({ property: prop as keyof T, value: wrapped } as Change<T>);
      }
      return result;
    },
  });
}

