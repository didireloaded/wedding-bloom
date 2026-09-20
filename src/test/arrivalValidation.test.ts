import { describe, it, expect } from 'vitest';
import { validLocation, distanceMeters } from '../../supabase/functions/_shared/arrival-validation';

describe('arrival location validation', () => {
  it('accepts real coordinates and rejects invalid accuracy or ranges', () => {
    expect(validLocation(-22.56, 17.08, 20)).toBe(true);
    for (const accuracy of [-1, 251, NaN, Infinity, '20', null]) expect(validLocation(-22.56, 17.08, accuracy)).toBe(false);
    expect(validLocation(91, 17, 10)).toBe(false);
    expect(validLocation(-22, 181, 10)).toBe(false);
  });
  it('calculates distance without invalid antipodal results', () => {
    expect(distanceMeters(-22.56, 17.08, -22.56, 17.08)).toBe(0);
    expect(distanceMeters(0, 0, 0, 1)).toBeCloseTo(111194.93, 1);
    expect(Number.isFinite(distanceMeters(90, 0, -90, 180))).toBe(true);
  });
});
