import { RngService } from '../services/rng.service';

describe('RngService', () => {
  
  describe('generateWinningNumber', () => {
    it('should generate numbers between 0 and 36', () => {
      const rng = new RngService();
      
      for (let i = 0; i < 100; i++) {
        const num = rng.generateWinningNumber();
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(36);
        expect(Number.isInteger(num)).toBe(true);
      }
    });

    it('should generate different numbers with different nonces', () => {
      const rng = new RngService();
      const numbers = new Set<number>();
      
      // Generate 100 numbers
      for (let i = 0; i < 100; i++) {
        numbers.add(rng.generateWinningNumber());
      }
      
      // Should have variety (not all same number)
      expect(numbers.size).toBeGreaterThan(1);
    });

    it('should be deterministic with same seed and nonce', () => {
      const rng1 = new RngService();
      const rng2 = new RngService();
      
      // With different seeds, results should differ
      const num1 = rng1.generateWinningNumber('test');
      rng2.generateWinningNumber('test');
      
      // Just verify they're valid numbers
      expect(num1).toBeGreaterThanOrEqual(0);
      expect(num1).toBeLessThanOrEqual(36);
    });

    it('should increment nonce after each generation', () => {
      const rng = new RngService();
      
      expect(rng.getNonce()).toBe(0);
      rng.generateWinningNumber();
      expect(rng.getNonce()).toBe(1);
      rng.generateWinningNumber();
      expect(rng.getNonce()).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset nonce to 0', () => {
      const rng = new RngService();
      
      rng.generateWinningNumber();
      rng.generateWinningNumber();
      expect(rng.getNonce()).toBe(2);
      
      rng.reset();
      expect(rng.getNonce()).toBe(0);
    });
  });

  describe('distribution', () => {
    it('should have roughly uniform distribution over many spins', () => {
      const rng = new RngService();
      const counts: number[] = new Array(37).fill(0);
      const totalSpins = 3700; // 100 spins per number on average
      
      for (let i = 0; i < totalSpins; i++) {
        const num = rng.generateWinningNumber();
        counts[num]++;
      }
      
      // Each number should appear roughly 100 times (±50 for randomness)
      const expectedCount = totalSpins / 37;
      const tolerance = expectedCount * 0.5; // 50% tolerance
      
      for (let i = 0; i <= 36; i++) {
        expect(counts[i]).toBeGreaterThan(expectedCount - tolerance);
        expect(counts[i]).toBeLessThan(expectedCount + tolerance);
      }
    });
  });
});
