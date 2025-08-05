import { TimeWindowDeque } from './Time-Window-Deque';

describe('TimeWindowDeque', () => {
  let deque: TimeWindowDeque;
  const now = Date.now();
  
  beforeEach(() => {
    // Create a new deque with small capacity to test growth
    deque = new TimeWindowDeque(4);
  });

  describe('Basic Operations', () => {
    it('should start empty', () => {
      expect(deque.size()).toBe(0);
      expect(deque.getLatestPrice()).toBeNull();
      expect(deque.getAverage()).toBeNull();
      expect(deque.getSum()).toBe(0);
      expect(deque.getHistory()).toEqual([]);
    });

    it('should add items and maintain size', () => {
      deque.push(100, now);
      expect(deque.size()).toBe(1);
      deque.push(101, now + 1000);
      expect(deque.size()).toBe(2);
    });

    it('should get the latest price', () => {
      deque.push(100, now);
      expect(deque.getLatestPrice()).toBe(100);
      
      deque.push(105, now + 1000);
      expect(deque.getLatestPrice()).toBe(105);
    });
  });

  describe('Expiration', () => {
    it('should expire old items', () => {
      const thirtySeconds = 30000; // 30 seconds in milliseconds
      deque.push(100, now - (thirtySeconds * 2));  // 60 seconds old
      deque.push(101, now - thirtySeconds);        // 30 seconds old
      deque.push(102, now);                        // current
      
      // Expire items older than 30 seconds
      deque.expire(now - thirtySeconds);
      
      expect(deque.size()).toBe(2);    // Only 2 items should remain
      expect(deque.getValues()).toEqual([101, 102]);
      
      const expired = deque.getExpiredValues();
      expect(expired).toHaveLength(1);
      expect(expired[0].price).toBe(100);
    });

    it('should maintain correct sum after expiration', () => {
      const thirtySeconds = 30000; // 30 seconds in milliseconds
      deque.push(100, now - (thirtySeconds * 2));  // 60 seconds old
      deque.push(101, now - thirtySeconds);        // 30 seconds old
      deque.push(102, now);                        // current
      
      expect(deque.getSum()).toBe(303);  // 100 + 101 + 102
      
      deque.expire(now - thirtySeconds);
      expect(deque.getSum()).toBe(203);  // 101 + 102
    });
  });

  describe('Average Calculation', () => {
    it('should calculate average correctly', () => {
      deque.push(100, now);
      deque.push(200, now + 1000);
      
      expect(deque.getAverage()).toBe(150);  // (100 + 200) / 2
      
      deque.push(300, now + 2000);
      expect(deque.getAverage()).toBe(200);  // (100 + 200 + 300) / 3
    });

    it('should return null for average when empty', () => {
      expect(deque.getAverage()).toBeNull();
    });
  });

  describe('Buffer Growth', () => {
    it('should grow when capacity is reached', () => {
      // Initial capacity is 4
      deque.push(100, now);
      deque.push(101, now + 1000);
      deque.push(102, now + 2000);
      deque.push(103, now + 3000);
      
      // This push should trigger growth
      deque.push(104, now + 4000);
      
      expect(deque.size()).toBe(5);
      expect(deque.getValues()).toEqual([100, 101, 102, 103, 104]);
    });
  });

  describe('History and Values', () => {
    it('should return correct history and values', () => {
      const testData = [
        { price: 100, timestamp: now },
        { price: 101, timestamp: now + 1000 },
        { price: 102, timestamp: now + 2000 }
      ];
      
      testData.forEach(item => deque.push(item.price, item.timestamp));
      
      const history = deque.getHistory();
      expect(history).toEqual(testData);
      
      const values = deque.getValues();
      expect(values).toEqual([100, 101, 102]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty deque operations', () => {
      expect(deque.size()).toBe(0);
      expect(deque.getLatestPrice()).toBeNull();
      expect(deque.getAverage()).toBeNull();
      expect(deque.getSum()).toBe(0);
      expect(deque.getHistory()).toEqual([]);
      expect(deque.getExpiredValues()).toEqual([]);
    });

    it('should handle expiration when all items are expired', () => {
      deque.push(100, now - 2000);
      deque.expire(now);
      
      expect(deque.size()).toBe(0);
      expect(deque.getExpiredValues()).toHaveLength(1);
    });
  });
});
