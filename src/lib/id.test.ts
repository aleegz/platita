import { randomUUID } from 'expo-crypto';

import { createEntityId } from './id';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(),
}));

const mockedRandomUUID = jest.mocked(randomUUID);

describe('createEntityId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds stable prefixed ids from expo-crypto UUIDs', () => {
    mockedRandomUUID.mockReturnValue('123e4567-e89b-12d3-a456-426614174000');

    expect(createEntityId('transaction')).toBe(
      'transaction_123e4567-e89b-12d3-a456-426614174000'
    );
    expect(mockedRandomUUID).toHaveBeenCalledTimes(1);
  });
});
