interface Item<K, V> {
  previous: Item<K, V> | undefined;
  next: Item<K, V> | undefined;
  key: K;
  value: V;
}

export const enum Touch {
  None = 0,
  AsOld = 1,
  AsNew = 2,
}

export class LinkedMap<K, V> {
  private _map: Map<K, Item<K, V>>;
  private _head: Item<K, V> | undefined;
  private _tail: Item<K, V> | undefined;
  private _size: number;

  constructor() {
    this._map = new Map<K, Item<K, V>>();
    this._head = undefined;
    this._tail = undefined;
    this._size = 0;
  }

  clear(): void {
    this._map.clear();
    this._head = undefined;
    this._tail = undefined;
    this._size = 0;
  }

  isEmpty(): boolean {
    return !this._head && !this._tail;
  }

  get size(): number {
    return this._size;
  }

  has(key: K): boolean {
    return this._map.has(key);
  }

  get(key: K, touch: Touch = Touch.None): V | undefined {
    const item = this._map.get(key);
    if (!item) {
      return undefined;
    }
    if (touch !== Touch.None) {
      this.touch(item, touch);
    }
    return item.value;
  }

  set(key: K, value: V, touch: Touch = Touch.None): void {
    let item = this._map.get(key);
    if (item) {
      item.value = value;
      if (touch !== Touch.None) {
        this.touch(item, touch);
      }
    } else {
      item = { key, value, next: undefined, previous: undefined };
      switch (touch) {
        case Touch.None:
          this.addItemLast(item);
          break;
        case Touch.AsOld:
          this.addItemFirst(item);
          break;
        case Touch.AsNew:
          this.addItemLast(item);
          break;
        default:
          this.addItemLast(item);
          break;
      }
      this._map.set(key, item);
      this._size++;
    }
  }

  delete(key: K): boolean {
    return !!this.remove(key);
  }

  remove(key: K): V | undefined {
    const item = this._map.get(key);
    if (!item) {
      return undefined;
    }
    this._map.delete(key);
    this.removeItem(item);
    this._size--;
    return item.value;
  }

  shift(): V | undefined {
    if (!this._head && !this._tail) {
      return undefined;
    }
    if (!this._head || !this._tail) {
      throw new Error('Invalid list');
    }
    const item = this._head;
    this._map.delete(item.key);
    this.removeItem(item);
    this._size--;
    return item.value;
  }

  forEach(
    callbackfn: (value: V, key: K, map: LinkedMap<K, V>) => void,
    thisArg?: any,
  ): void {
    let current = this._head;
    while (current) {
      if (thisArg) {
        callbackfn.bind(thisArg)(current.value, current.key, this);
      } else {
        callbackfn(current.value, current.key, this);
      }
      current = current.next;
    }
  }

  values(): V[] {
    const result: V[] = [];
    let current = this._head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  keys(): K[] {
    const result: K[] = [];
    let current = this._head;
    while (current) {
      result.push(current.key);
      current = current.next;
    }
    return result;
  }

  protected trimOld(newSize: number) {
    if (newSize >= this.size) {
      return;
    }
    if (newSize === 0) {
      this.clear();
      return;
    }
    let current = this._head;
    let currentSize = this.size;
    while (current && currentSize > newSize) {
      this._map.delete(current.key);
      current = current.next;
      currentSize--;
    }
    this._head = current;
    this._size = currentSize;
    if (current) {
      current.previous = undefined;
    }
  }

  private addItemFirst(item: Item<K, V>): void {
    // First time Insert
    if (!this._head && !this._tail) {
      this._tail = item;
    } else if (!this._head) {
      throw new Error('Invalid list');
    } else {
      item.next = this._head;
      this._head.previous = item;
    }
    this._head = item;
  }

  private addItemLast(item: Item<K, V>): void {
    // First time Insert
    if (!this._head && !this._tail) {
      this._head = item;
    } else if (!this._tail) {
      throw new Error('Invalid list');
    } else {
      item.previous = this._tail;
      this._tail.next = item;
    }
    this._tail = item;
  }

  private removeItem(item: Item<K, V>): void {
    if (item === this._head && item === this._tail) {
      this._head = undefined;
      this._tail = undefined;
    } else if (item === this._head) {
      // This can only happend if size === 1 which is handle
      // by the case above.
      if (!item.next) {
        throw new Error('Invalid list');
      }
      item.next.previous = undefined;
      this._head = item.next;
    } else if (item === this._tail) {
      // This can only happend if size === 1 which is handle
      // by the case above.
      if (!item.previous) {
        throw new Error('Invalid list');
      }
      item.previous.next = undefined;
      this._tail = item.previous;
    } else {
      const next = item.next;
      const previous = item.previous;
      if (!next || !previous) {
        throw new Error('Invalid list');
      }
      next.previous = previous;
      previous.next = next;
    }
    item.next = undefined;
    item.previous = undefined;
  }

  private touch(item: Item<K, V>, touch: Touch): void {
    if (!this._head || !this._tail) {
      throw new Error('Invalid list');
    }
    if (touch !== Touch.AsOld && touch !== Touch.AsNew) {
      return;
    }

    if (touch === Touch.AsOld) {
      if (item === this._head) {
        return;
      }

      const next = item.next;
      const previous = item.previous;

      // Unlink the item
      if (item === this._tail) {
        // previous must be defined since item was not head but is tail
        // So there are more than on item in the map
        previous!.next = undefined;
        this._tail = previous;
      } else {
        // Both next and previous are not undefined since item was neither head nor tail.
        next!.previous = previous;
        previous!.next = next;
      }

      // Insert the node at head
      item.previous = undefined;
      item.next = this._head;
      this._head.previous = item;
      this._head = item;
    } else if (touch === Touch.AsNew) {
      if (item === this._tail) {
        return;
      }

      const next = item.next;
      const previous = item.previous;

      // Unlink the item.
      if (item === this._head) {
        // next must be defined since item was not tail but is head
        // So there are more than on item in the map
        next!.previous = undefined;
        this._head = next;
      } else {
        // Both next and previous are not undefined since item was neither head nor tail.
        next!.previous = previous;
        previous!.next = next;
      }
      item.next = undefined;
      item.previous = this._tail;
      this._tail.next = item;
      this._tail = item;
    }
  }

  toJSON(): [K, V][] {
    const data: [K, V][] = [];

    this.forEach((value, key) => {
      data.push([key, value]);
    });

    return data;
  }
}

export class LRUCache<K, V> extends LinkedMap<K, V> {
  private _limit: number;
  private _ratio: number;

  constructor(limit: number, ratio = 1) {
    super();
    this._limit = limit;
    this._ratio = Math.min(Math.max(0, ratio), 1);
  }

  get limit(): number {
    return this._limit;
  }

  set limit(limit: number) {
    this._limit = limit;
    this.checkTrim();
  }

  get ratio(): number {
    return this._ratio;
  }

  set ratio(ratio: number) {
    this._ratio = Math.min(Math.max(0, ratio), 1);
    this.checkTrim();
  }

  get(key: K): V | undefined {
    return super.get(key, Touch.AsNew);
  }

  peek(key: K): V | undefined {
    return super.get(key, Touch.None);
  }

  set(key: K, value: V): void {
    super.set(key, value, Touch.AsNew);
    this.checkTrim();
  }

  private checkTrim() {
    if (this.size > this._limit) {
      this.trimOld(Math.round(this._limit * this._ratio));
    }
  }
}
