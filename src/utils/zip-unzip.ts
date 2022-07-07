import { deflate, inflate } from 'pako';

export const runZip = <T>(obj: T) => {
  const bytes = deflate(JSON.stringify(obj), { level: 9 });
  return `\\x${Buffer.from(bytes).toString('hex')}`;
};

export const runUnzip = async (
  buffer: Uint8Array,
): Promise<Record<string, unknown>[]> => {
  const string = inflate(buffer, { to: 'string' });
  const obj = JSON.parse(string);
  return typeof obj === 'string' ? JSON.parse(obj) : obj;
};
