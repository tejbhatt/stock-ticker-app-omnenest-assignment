/**
 * CIRCULAR BUFFER (RING BUFFER) IMPLEMENTATION OF DEQUE
 * 
 * This implementation uses a fixed-size array as a circular buffer to achieve:
 * - O(1) time complexity for all operations (push/pop/shift/unshift)
 * - Better cache locality than linked list implementation
 * - Constant memory overhead
 * - Efficient memory usage with a fixed-size buffer
 */

/**
 * Represents a price data point with its timestamp
 */
export interface PriceData {
  price: number;
  timestamp: number;
}

/**
 * A circular buffer (ring buffer) implementation of a deque
 * with O(1) operations at both ends
 */
class CircularDeque<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private _size: number = 0;
  private readonly capacity: number;

  /**
   * Creates a new circular deque with the given capacity
   * @param capacity Maximum number of elements the deque can hold
   */
  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity);
    this.buffer = new Array<T | undefined>(this.capacity);
  }

  /**
   * Adds an element to the end of the deque
   * @param value The value to add
   */
  push(value: T): void {
    if (this._size === this.capacity) {
      // Buffer is full, need to grow (or throw error, or overwrite)
      this._grow();
    }
    
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.capacity;
    this._size++;
  }

  /**
   * Removes and returns the first element from the deque
   */
  shift(): T | undefined {
    if (this._size === 0) return undefined;
    
    const value = this.buffer[this.head];
    this.buffer[this.head] = undefined; // Clear the reference
    this.head = (this.head + 1) % this.capacity;
    this._size--;
    
    return value;
  }

  /**
   * Returns the first element without removing it
   */
  peekFirst(): T | undefined {
    if (this._size === 0) return undefined;
    return this.buffer[this.head];
  }

  /**
   * Returns the last element without removing it
   */
  peekLast(): T | undefined {
    if (this._size === 0) return undefined;
    const lastIndex = (this.tail - 1 + this.capacity) % this.capacity;
    return this.buffer[lastIndex];
  }

  /**
   * Returns the number of elements in the deque
   */
  size(): number {
    return this._size;
  }

  /**
   * Converts the deque to an array
   */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      const index = (this.head + i) % this.capacity;
      result.push(this.buffer[index]!);
    }
    return result;
  }

  /**
   * Grows the internal buffer when it's full
   */
  private _grow(): void {
    const newCapacity = this.capacity * 2;
    const newBuffer = new Array<T | undefined>(newCapacity);
    
    // Copy elements to new buffer
    for (let i = 0; i < this._size; i++) {
      const index = (this.head + i) % this.capacity;
      newBuffer[i] = this.buffer[index];
    }
    
    this.buffer = newBuffer;
    this.head = 0;
    this.tail = this._size;
    (this as any).capacity = newCapacity; // Workaround for readonly property
  }
}

/**
 * A time-windowed queue that maintains price data points within a specified time window.
 * Uses a circular buffer-based deque for efficient O(1) operations at both ends.
 * More cache-friendly than the linked list implementation.
 */
export class TimeWindowDeque {
  /** Internal deque using circular buffer */
  private data: CircularDeque<PriceData>;
  /** Running sum of all active prices */
  private sum: number = 0;
  /** Array to store expired price data points */
  private expiredData: PriceData[] = [];
  /** Maximum capacity of the circular buffer */
  private readonly capacity: number;

  /**
   * Creates a new TimeWindowDeque with the specified initial capacity
   * @param initialCapacity Initial capacity of the internal buffer (default: 32)
   */
  constructor(initialCapacity: number = 32) {
    this.capacity = Math.max(1, initialCapacity);
    this.data = new CircularDeque<PriceData>(this.capacity);
  }

  /**
   * Adds a new price data point to the queue
   */
  push(price: number, timestamp: number): void {
    this.data.push({ price, timestamp });
    this.sum += price;
  }

  /**
   * Removes data points older than the specified cutoff timestamp
   */
  expire(cutoff: number): void {
    while (this.data.size() > 0) {
      const first = this.data.peekFirst();
      if (!first || first.timestamp >= cutoff) break;
      
      const removed = this.data.shift()!;
      this.sum -= removed.price;
      this.expiredData.push(removed);
    }
  }

  /**
   * Gets the current number of active data points
   */
  size(): number {
    return this.data.size();
  }

  /**
   * Gets the sum of all active prices
   */
  getSum(): number {
    return this.sum;
  }

  /**
   * Gets the most recent price
   */
  getLatestPrice(): number | null {
    const last = this.data.peekLast();
    return last ? last.price : null;
  }

  /**
   * Calculates the average of all active prices
   */
  getAverage(): number | null {
    const size = this.size();
    return size > 0 ? this.sum / size : null;
  }

  /**
   * Gets a copy of all active price data points
   */
  getHistory(): PriceData[] {
    return this.data.toArray();
  }

  /**
   * Gets an array of just the price values
   */
  getValues(): number[] {
    return this.data.toArray().map(entry => entry.price);
  }

  /**
   * Gets a copy of all expired price data points
   */
  getExpiredValues(): PriceData[] {
    return [...this.expiredData];
  }
}
