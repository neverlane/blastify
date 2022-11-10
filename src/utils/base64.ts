export const base64 = {
  encode: (str: string) => Buffer.from(str, 'utf-8').toString('base64'),
  decode: (b64: string) => Buffer.from(b64, 'base64').toString('utf-8')
};