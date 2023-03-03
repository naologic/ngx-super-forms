/**
 * Generate a random string
 */
function generateRandomHash(len = 5, adds: string|string[]|null = null, sepp = '-'): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  if (typeof adds === 'string' && !Array.isArray(adds)) {
    adds = [adds] as string[];
  }
  if (Array.isArray(adds)) {
    return `${adds.join(sepp)}${text}`.toLowerCase();
  }

  return text.toLowerCase();
}


export {
  generateRandomHash
}
