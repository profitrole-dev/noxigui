import { Observable } from './observable.js';

export type Change<T extends object> = { property: keyof T; value: T[keyof T] };

export type ObservableObject<T extends object> = T & { observable: Observable<Change<T>> };

export function ViewModel<T extends object>(obj: T): ObservableObject<T> {
  const observable = new Observable<Change<T>>();

  const wrap = (v: any): any => {
    if (Array.isArray(v)) return v.map(wrap);
    if (v && typeof v === 'object' && !(v as any).observable) return ViewModel(v);
    return v;
  };

  const target = obj as any;
  for (const k of Object.keys(target)) target[k] = wrap(target[k]);

  return new Proxy(target as ObservableObject<T>, {
    get(t, prop, receiver) {
      if (prop === 'observable') return observable;
      return Reflect.get(t, prop, receiver);
    },
    set(t, prop, value, receiver) {
      if (prop === 'observable') return false;
      const wrapped = wrap(value);
      const result = Reflect.set(t, prop, wrapped, receiver);
      observable.notify({ property: prop as keyof T, value: wrapped } as Change<T>);
      return result;
    },
  });
}

