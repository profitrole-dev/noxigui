export type Listener<T> = (value: T) => void;

export class Observable<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(fn: Listener<T>) {
    this.listeners.add(fn);
  }

  unsubscribe(fn: Listener<T>) {
    this.listeners.delete(fn);
  }

  notify(value: T) {
    for (const fn of this.listeners) {
      fn(value);
    }
  }
}

