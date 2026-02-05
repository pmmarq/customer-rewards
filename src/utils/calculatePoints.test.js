import { calculatePoints } from './calculatePoints';

describe('calculatePoints', () => {
  it('returns 0 for amounts at or below $50', () => {
    expect(calculatePoints(0)).toBe(0);
    expect(calculatePoints(25)).toBe(0);
    expect(calculatePoints(50)).toBe(0);
  });

  it('returns 1 point per dollar between $50 and $100', () => {
    // $51 → 1 pt,  $75 → 25 pts,  $100 → 50 pts
    expect(calculatePoints(51)).toBe(1);
    expect(calculatePoints(75)).toBe(25);
    expect(calculatePoints(100)).toBe(50);
  });

  it('returns 2 points per dollar over $100 plus the $50-$100 tier', () => {
    // $101 → 2*1 + 50 = 52
    expect(calculatePoints(101)).toBe(52);
    // $120 → 2*20 + 50 = 90
    expect(calculatePoints(120)).toBe(90);
    // $200 → 2*100 + 50 = 250
    expect(calculatePoints(200)).toBe(250);
  });

  it('floors fractional dollar amounts before calculating', () => {
    // $50.99 floors to $50 → 0 pts
    expect(calculatePoints(50.99)).toBe(0);
    // $100.99 floors to $100 → 50 pts
    expect(calculatePoints(100.99)).toBe(50);
    // $120.75 floors to $120 → 90 pts
    expect(calculatePoints(120.75)).toBe(90);
  });

  it('handles negative amounts gracefully', () => {
    expect(calculatePoints(-10)).toBe(0);
  });
});
