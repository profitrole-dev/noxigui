import { Observable } from './observable.js';

export type Change<T extends object> = { property: keyof T; value: T[keyof T] };

export type ObservableObject<T extends object> = T & { observable: Observable<Change<T>> };

export function ViewModel<T extends object>(obj: T): ObservableObject<T> {
  const observable = new Observable<Change<T>>();
  return new Proxy(obj as ObservableObject<T>, {
    get(target, prop, receiver) {
      if (prop === 'observable') return observable;
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      if (prop === 'observable') return false;
      const result = Reflect.set(target as any, prop, value, receiver);
      observable.notify({ property: prop as keyof T, value } as Change<T>);
      return result;
    },
  });
}

