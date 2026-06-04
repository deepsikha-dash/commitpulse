import { describe, expect, expectTypeOf, it } from 'vitest';
import GithubWrapped from './GithubWrapped';
import type { WrappedStats, UserProfile } from '@/types/dashboard';

describe('GithubWrapped type compiler validation', () => {
  const profile: UserProfile = {
    username: 'riddhima',
    name: 'Riddhima Gupta',
    avatarUrl: 'https://example.com/avatar.png',
    bio: null,
    publicRepos: 12,
    followers: 100,
    following: 50,
    createdAt: '2024-01-01T00:00:00Z',
    developerScore: 85,
  };

  const wrappedData: WrappedStats = {
    totalContributions: 1200,
    topLanguage: 'TypeScript',
    highestDailyCount: 42,
    mostActiveDate: '2026-06-04',
    busiestMonth: '2026-06',
    weekendRatio: 28,
  };

  it('accepts valid UserProfile type shape', () => {
    expectTypeOf(profile).toMatchTypeOf<UserProfile>();
    expect(profile.username).toBe('riddhima');
  });

  it('accepts valid WrappedStats type shape', () => {
    expectTypeOf(wrappedData).toMatchTypeOf<WrappedStats>();
    expect(wrappedData.totalContributions).toBe(1200);
  });

  it('enforces GithubWrapped component prop contract', () => {
    expectTypeOf(GithubWrapped).parameter(0).toMatchTypeOf<{
      profile: UserProfile;
      wrappedData: WrappedStats;
    }>();
  });

  it('requires numeric contribution and ratio fields', () => {
    expectTypeOf(wrappedData.totalContributions).toEqualTypeOf<number>();
    expectTypeOf(wrappedData.highestDailyCount).toEqualTypeOf<number>();
    expectTypeOf(wrappedData.weekendRatio).toEqualTypeOf<number>();
  });

  it('requires string metadata fields for display rendering', () => {
    expectTypeOf(profile.username).toEqualTypeOf<string>();
    expectTypeOf(profile.name).toEqualTypeOf<string>();
    expectTypeOf(profile.avatarUrl).toEqualTypeOf<string>();
    expectTypeOf(wrappedData.topLanguage).toEqualTypeOf<string>();
    expectTypeOf(wrappedData.busiestMonth).toEqualTypeOf<string>();
  });
});
