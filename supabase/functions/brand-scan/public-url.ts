function isPublicAddress(address: string): boolean {
  const value = address.toLowerCase();
  if (value.includes(':')) return /^[23][0-9a-f]{3}:/.test(value) && !value.startsWith('2001:db8:');
  const parts = value.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a,b] = parts;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) || (a === 198 && (b === 18 || b === 19 || b === 51)) || (a === 203 && b === 0));
}

export async function validatePublicUrl(raw: string, timeoutMs = 5000): Promise<string> {
  const url = new URL(raw);
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !host.includes('.') || host.includes(':') || /^\d+(?:\.\d+)*$/.test(host) || /\.(?:localhost|local|internal|test|invalid|example)$/.test(host)) throw new Error('Unsupported scan URL');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let answers: PromiseSettledResult<string[]>[];
  try {
    answers = await Promise.race([
      Promise.allSettled([Deno.resolveDns(host,'A'),Deno.resolveDns(host,'AAAA')]),
      new Promise<never>((_,reject) => { timer = setTimeout(() => reject(new Error('DNS validation timed out')), timeoutMs); }),
    ]);
  } finally { if (timer !== undefined) clearTimeout(timer); }
  if (answers.some(answer => answer.status === 'rejected')) throw new Error('DNS validation incomplete');
  const addresses = answers.flatMap(answer => answer.status === 'fulfilled' ? answer.value : []);
  if (!addresses.length || !addresses.every(isPublicAddress)) throw new Error('Scan target must resolve to public addresses');
  url.hash = '';
  return url.toString();
}

export async function readLimitedText(response: Response, maximum: number): Promise<string> {
  if (Number(response.headers.get('content-length')) > maximum) throw new Error('Scan response too large');
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0, text = '';
  try {
    for (;;) {
      const {done,value} = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > maximum) { await reader.cancel(); throw new Error('Scan response too large'); }
      text += decoder.decode(value,{stream:true});
    }
    return text + decoder.decode();
  } finally { reader.releaseLock(); }
}