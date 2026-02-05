/**
 * Calculate reward points for a single transaction amount.
 *
 * Rules:
 *   - 2 points for every dollar spent over $100
 *   - 1 point for every dollar spent between $50 and $100
 *
 * Only whole-dollar amounts earn points (fractional cents are floored).
 *
 * @param {number} amount - The transaction amount in dollars.
 * @returns {number} The reward points earned.
 */
export function calculatePoints(amount) {
  const dollars = Math.floor(amount);
  let points = 0;

  if (dollars > 100) {
    points += 2 * (dollars - 100);
  }

  if (dollars > 50) {
    points += Math.min(dollars, 100) - 50;
  }

  return points;
}
