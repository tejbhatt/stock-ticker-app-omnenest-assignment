/**
 * ARRAY-BASED IMPLEMENTATION OF TIMEWINDOWDEQUE
 * 
 * This is the original implementation that uses a JavaScript array internally.
 * It has O(n) time complexity for shift() operations, which can be a bottleneck
 * when dealing with large datasets or frequent operations.
 * 
 * See Time-Window-Deque.ts for the optimized deque implementation.
 */

/**
 * Represents a price data point with its timestamp
 */
export interface PriceData {
  price: number;
  timestamp: number;
}

/**
 * A time-windowed queue that maintains price data points within a specified time window.
 * This implementation uses a JavaScript array internally, which makes shift() operations O(n).
 * 
 * NOTE: This is kept for reference. The main implementation now uses a custom deque
 * for better performance with O(1) operations at both ends.
 */
export class TimeWindowDeque {
  /** Internal array to store active price data points */
  private data: PriceData[] = [];
  
  /** Running sum of all active prices for quick average calculation */
  private sum: number = 0;
  
  /** Array to store expired price data points for historical reference */
  private expiredData: PriceData[] = [];

  /**
   * Adds a new price data point to the queue
   * Note: O(1) time complexity for push operation
   */
  push(price: number, timestamp: number): void {
    const newData = { price, timestamp };
    this.data.push(newData);
    this.sum += price;
  }

  /**
   * Removes data points older than the specified cutoff timestamp
   * Note: O(n) time complexity due to array.shift() in a loop
   */
  expire(cutoff: number): void {
    // This is the performance bottleneck - shift() is O(n)
    while (this.data.length > 0 && this.data[0].timestamp < cutoff) {
      const removed = this.data.shift()!;
      this.sum -= removed.price;
      this.expiredData.push(removed);
    }
  }

  /**
   * Gets the current number of active data points in the queue
   */
  size(): number {
    return this.data.length;
  }

  /**
   * Gets the sum of all active prices in the queue
   */
  getSum(): number {
    return this.sum;
  }

  /**
   * Gets the most recent price from the queue
   */
  getLatestPrice(): number | null {
    return this.data.length > 0 ? this.data[this.data.length - 1].price : null;
  }

  /**
   * Calculates the average of all active prices in the queue
   */
  getAverage(): number | null {
    return this.size() > 0 ? this.sum / this.size() : null;
  }

  /**
   * Gets a copy of all active price data points
   */
  getHistory(): PriceData[] {
    return [...this.data];
  }

  /**
   * Gets an array of just the price values (without timestamps)
   */
  getValues(): number[] {
    return this.data.map(entry => entry.price);
  }

  /**
   * Gets a copy of all expired price data points
   */
  getExpiredValues(): PriceData[] {
    return [...this.expiredData];
  }
}
