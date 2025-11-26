import { RED_NUMBERS, BLACK_NUMBERS, COLUMNS, DOZENS, WHEEL_ORDER } from '../utils/constants';

describe('Constants', () => {
  
  describe('RED_NUMBERS and BLACK_NUMBERS', () => {
    it('should have 18 red numbers', () => {
      expect(RED_NUMBERS.length).toBe(18);
    });

    it('should have 18 black numbers', () => {
      expect(BLACK_NUMBERS.length).toBe(18);
    });

    it('should not have overlapping numbers', () => {
      const overlap = RED_NUMBERS.filter(n => BLACK_NUMBERS.includes(n));
      expect(overlap.length).toBe(0);
    });

    it('should not include 0', () => {
      expect(RED_NUMBERS).not.toContain(0);
      expect(BLACK_NUMBERS).not.toContain(0);
    });

    it('should cover all numbers 1-36 combined', () => {
      const allNumbers = [...RED_NUMBERS, ...BLACK_NUMBERS].sort((a, b) => a - b);
      const expected = Array.from({ length: 36 }, (_, i) => i + 1);
      expect(allNumbers).toEqual(expected);
    });

    it('should match official roulette red numbers', () => {
      const officialRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      expect(RED_NUMBERS.sort((a, b) => a - b)).toEqual(officialRed);
    });
  });

  describe('COLUMNS', () => {
    it('should have 3 columns', () => {
      expect(Object.keys(COLUMNS).length).toBe(3);
    });

    it('should have 12 numbers per column', () => {
      expect(COLUMNS[1].length).toBe(12);
      expect(COLUMNS[2].length).toBe(12);
      expect(COLUMNS[3].length).toBe(12);
    });

    it('should have correct column 1 numbers (1, 4, 7, ...)', () => {
      const expected = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
      expect(COLUMNS[1]).toEqual(expected);
    });

    it('should have correct column 2 numbers (2, 5, 8, ...)', () => {
      const expected = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
      expect(COLUMNS[2]).toEqual(expected);
    });

    it('should have correct column 3 numbers (3, 6, 9, ...)', () => {
      const expected = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
      expect(COLUMNS[3]).toEqual(expected);
    });

    it('should not overlap between columns', () => {
      const all = [...COLUMNS[1], ...COLUMNS[2], ...COLUMNS[3]];
      const unique = new Set(all);
      expect(unique.size).toBe(36);
    });
  });

  describe('DOZENS', () => {
    it('should have 3 dozens', () => {
      expect(Object.keys(DOZENS).length).toBe(3);
    });

    it('should have 12 numbers per dozen', () => {
      expect(DOZENS[1].length).toBe(12);
      expect(DOZENS[2].length).toBe(12);
      expect(DOZENS[3].length).toBe(12);
    });

    it('should have correct 1st dozen (1-12)', () => {
      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      expect(DOZENS[1]).toEqual(expected);
    });

    it('should have correct 2nd dozen (13-24)', () => {
      const expected = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
      expect(DOZENS[2]).toEqual(expected);
    });

    it('should have correct 3rd dozen (25-36)', () => {
      const expected = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
      expect(DOZENS[3]).toEqual(expected);
    });
  });

  describe('WHEEL_ORDER', () => {
    it('should have 37 numbers (0-36)', () => {
      expect(WHEEL_ORDER.length).toBe(37);
    });

    it('should start with 0', () => {
      expect(WHEEL_ORDER[0]).toBe(0);
    });

    it('should contain each number exactly once', () => {
      const sorted = [...WHEEL_ORDER].sort((a, b) => a - b);
      const expected = Array.from({ length: 37 }, (_, i) => i);
      expect(sorted).toEqual(expected);
    });

    it('should match European roulette wheel order', () => {
      const expected = [
        0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
        24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
      ];
      expect(WHEEL_ORDER).toEqual(expected);
    });
  });
});
