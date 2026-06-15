import { describe } from 'vitest';
import { calculateInitialDomainAndTickNumber } from './domain';

describe('calculateInitialDomainAndTickNumber', () => {
  const getDomain = (axis: any) =>
    calculateInitialDomainAndTickNumber(axis, 'y', 0, {} as any, [10, 20], 5).domain;

  it('keeps the data max when min is set inside the data range', () => {
    expect(getDomain({ id: 'y', scaleType: 'linear', min: 15, domainLimit: 'strict' })).to.deep.equal(
      [15, 20],
    );
  });

  it('keeps the data max when min is set inside the data range with a nice domain', () => {
    expect(getDomain({ id: 'y', scaleType: 'linear', min: 15, domainLimit: 'nice' })).to.deep.equal([
      15, 20,
    ]);
  });

  it('collapses the domain when min is above all data', () => {
    expect(getDomain({ id: 'y', scaleType: 'linear', min: 25, domainLimit: 'strict' })).to.deep.equal(
      [25, 25],
    );
  });

  it('keeps the data min when min is below all data', () => {
    expect(getDomain({ id: 'y', scaleType: 'linear', min: 5, domainLimit: 'strict' })).to.deep.equal([
      5, 20,
    ]);
  });
});
