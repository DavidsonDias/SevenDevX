import { HTTPParser } from 'npm:http-parser-js@0.5.10';
import { Buffer } from 'node:buffer';
import { resolvePublicTarget } from '../brand-scan/public-url.ts';

/** Connect to a validated IP; start TLS using the original hostname for SNI/certificate verification. */
export async function integrationFetch(raw: string | URL | Request, init: RequestInit = {}): Promise<Response> {
  if (raw instanceof Request) throw new Error('Request objects are not supported');
  raw = String(raw);
  const userAgent = 'SevenDevX-Integrations/1.0', maximum = 1000000, timeoutMs = 12000;
  const method = (init.method || 'GET').toUpperCase();
  if (!['GET','POST','PUT','PATCH','DELETE'].includes(method)) throw new Error('Unsupported integration method');
  const content = init.body == null ? new Uint8Array() : typeof init.body === 'string' || init.body instanceof URLSearchParams ? new TextEncoder().encode(String(init.body)) : init.body instanceof Uint8Array ? init.body : null;
  if (!content || content.length > 262144) throw new Error('Integration payload too large or unsupported');
  if (['GET'].includes(method) && content.length) throw new Error('GET request cannot contain a body');
  const requestHeaders = new Headers(init.headers);
  for (const h of ['host','connection','content-length','transfer-encoding','accept-encoding','proxy-authorization','proxy-connection','trailer','upgrade','expect']) requestHeaders.delete(h);
  if (/[\r\n]/.test(userAgent) || !Number.isInteger(maximum) || maximum < 1 || maximum > 1000000 || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15000) throw new Error('Invalid scan transport options');
  const target = await resolvePublicTarget(raw);
  const url = new URL(target.url);
  const ip = target.addresses[0];
  let connection: Deno.Conn | undefined;
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const normalize = (address: string) => address.includes(':') ? new URL(`http://[${address}]/`).hostname : address;
  const task = async () => {
    connection = await Deno.connect({ hostname: ip, port: 443 });
    if (timedOut) { connection.close(); throw new Error('Scan connection timed out'); }
    if (normalize((connection.remoteAddr as Deno.NetAddr).hostname) !== normalize(ip)) throw new Error('Scan peer differs from validated IP');
    const tls = await Deno.startTls(connection as Deno.TcpConn, { hostname: url.hostname, alpnProtocols: ['http/1.1'] });
    connection = tls;
    if (timedOut) { connection.close(); throw new Error('Scan connection timed out'); }
    await tls.handshake();
    if (normalize((tls.remoteAddr as Deno.NetAddr).hostname) !== normalize(ip)) throw new Error('TLS peer differs from validated IP');
    requestHeaders.set('Host',url.hostname); requestHeaders.set('User-Agent',userAgent); requestHeaders.set('Accept-Encoding','identity'); requestHeaders.set('Connection','close');
    if(content.length || method!=='GET') requestHeaders.set('Content-Length',String(content.length));
    const head = new TextEncoder().encode(method+' '+url.pathname+url.search+' HTTP/1.1\r\n'+Array.from(requestHeaders,([k,v])=>k+': '+v).join('\r\n')+'\r\n\r\n');
    const request = new Uint8Array(head.length+content.length); request.set(head); request.set(content,head.length);
    let written = 0;
    while (written < request.length) {
      const count = await tls.write(request.subarray(written));
      if (count <= 0) throw new Error('Scan request write failed');
      written += count;
    }
    const parser = new HTTPParser(HTTPParser.RESPONSE);
    parser.maxHeaderSize = 16384;
    let status = 0, size = 0, wireSize = 0, complete = false;
    let headers: Headers | undefined;
    const chunks: Uint8Array[] = [];
    parser[HTTPParser.kOnHeadersComplete] = info => {
      if (headers || info.upgrade || info.statusCode < 200 || info.statusCode > 599) throw new Error('Invalid integration response');
      status = info.statusCode;
      headers = new Headers();
      for (let i = 0; i < info.headers.length; i += 2) headers.append(info.headers[i], info.headers[i + 1]);
      const length = headers.get('content-length');
      const transfer = headers.get('transfer-encoding');
      if (length && (!/^\d+$/.test(length) || Number(length) > maximum)) throw new Error('Scan response too large or invalid length');
      if (transfer && (length || transfer.toLowerCase() !== 'chunked')) throw new Error('Unsupported scan response framing');
      if (headers.has('content-encoding') && headers.get('content-encoding')!.toLowerCase() !== 'identity') throw new Error('Compressed scan response refused');
    };
    parser[HTTPParser.kOnBody] = (chunk, offset, length) => {
      size += length;
      if (size > maximum) throw new Error('Scan response too large');
      chunks.push(Uint8Array.from(chunk.subarray(offset, offset + length)));
    };
    parser[HTTPParser.kOnMessageComplete] = () => { complete = true; };
    const buffer = new Uint8Array(8192);
    try {
      while (!complete) {
        const count = await tls.read(buffer);
        if (count === null) {
          const error = parser.finish();
          if (error instanceof Error) throw error;
          break;
        }
        if (count === 0) throw new Error('Empty scan socket read');
        wireSize += count;
        if (wireSize > maximum + 65536) throw new Error('Scan wire response too large');
        const result = parser.execute(Buffer.from(buffer.subarray(0, count)));
        if (result instanceof Error) throw result;
      }
      if (!complete || !headers) throw new Error('Incomplete scan response');
      const body = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
      headers.delete('transfer-encoding');
      headers.delete('set-cookie');
      headers.set('content-length', String(size));
      return new Response(status === 204 || status === 205 ? null : body, { status, headers });
    } finally { parser.close(); }
  };
  try {
    return await Promise.race([task(), new Promise<never>((_, reject) => {
      timer = setTimeout(() => { timedOut = true; try { connection?.close(); } catch { /* already closed */ } reject(new Error('Scan connection timed out')); }, timeoutMs);
    })]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    try { connection?.close(); } catch { /* already closed */ }
  }
}
