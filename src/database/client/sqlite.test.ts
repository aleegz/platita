import { normalizeBackupBytesForDeserialize } from './sqlite';

function createSqliteBytes() {
  const bytes = new Uint8Array(32);

  bytes.set([
    0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66,
    0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00,
  ]);
  bytes[18] = 2;
  bytes[19] = 2;

  return bytes;
}

describe('normalizeBackupBytesForDeserialize', () => {
  it('returns a copy unchanged when the byte array is too short', () => {
    const source = new Uint8Array([1, 2, 3]);

    const result = normalizeBackupBytesForDeserialize(source);

    expect(result).toEqual(source);
    expect(result).not.toBe(source);
  });

  it('returns a copy unchanged when the sqlite header is missing', () => {
    const source = new Uint8Array(32);
    source[18] = 2;
    source[19] = 2;

    const result = normalizeBackupBytesForDeserialize(source);

    expect(result).toEqual(source);
    expect(result).not.toBe(source);
  });

  it('forces sqlite read/write versions back to rollback mode for valid backups', () => {
    const source = createSqliteBytes();

    const result = normalizeBackupBytesForDeserialize(source);

    expect(result[18]).toBe(1);
    expect(result[19]).toBe(1);
    expect(source[18]).toBe(2);
    expect(source[19]).toBe(2);
  });
});
