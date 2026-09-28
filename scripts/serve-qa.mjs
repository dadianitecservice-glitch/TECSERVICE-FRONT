import { createServer } from 'node:http'
import { readFile, realpath, stat } from 'node:fs/promises'
import { extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

// Local diagnostics only. Nothing here is copied into dist or production HTML.
export const METRICS_TAG = '[TECSERVICE_LOCAL_QA_METRICS]'
export const metricsScript = `<script data-local-qa-metrics>
(() => {
  const observed = { fcp: null, lcp: null, cls: 0, longTasks: 0, longTaskMs: 0 };
  let sessionStart = 0, lastShift = 0, sessionScore = 0;
  const observers = [];
  function observe(type, accept) {
    try {
      const observer = new PerformanceObserver(list => list.getEntries().forEach(accept));
      observer.observe({ type, buffered: true }); observers.push(observer);
    } catch (_) {}
  }
  observe('paint', e => { if (e.name === 'first-contentful-paint') observed.fcp = e.startTime; });
  observe('largest-contentful-paint', e => { observed.lcp = e.startTime; });
  observe('layout-shift', e => {
    if (e.hadRecentInput) return;
    if (e.startTime - lastShift > 1000 || e.startTime - sessionStart > 5000) {
      sessionStart = e.startTime; sessionScore = 0;
    }
    sessionScore += e.value; lastShift = e.startTime;
    observed.cls = Math.max(observed.cls, sessionScore);
  });
  observe('longtask', e => { observed.longTasks++; observed.longTaskMs += e.duration; });
  function report() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const round = value => Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
    console.info('${METRICS_TAG}', JSON.stringify({
      scope: 'loopback, unthrottled, cache state not controlled; not Lighthouse or field Core Web Vitals',
      route: location.pathname, capturedAtMs: round(performance.now()),
      fcpMs: round(observed.fcp), lcpMs: round(observed.lcp), cls: observed.cls,
      longTaskCount: observed.longTasks, longTaskMs: round(observed.longTaskMs),
      navigation: navigation ? {
        ttfbMs: round(navigation.responseStart - navigation.requestStart),
        domContentLoadedMs: round(navigation.domContentLoadedEventEnd),
        loadMs: round(navigation.loadEventEnd), transferBytes: navigation.transferSize,
        encodedBytes: navigation.encodedBodySize, decodedBytes: navigation.decodedBodySize
      } : null,
      resources: {
        count: resources.length,
        transferBytes: resources.reduce((sum, e) => sum + e.transferSize, 0),
        encodedBytes: resources.reduce((sum, e) => sum + e.encodedBodySize, 0),
        decodedBytes: resources.reduce((sum, e) => sum + e.decodedBodySize, 0)
      }
    }));
  }
  if (document.readyState === 'complete') setTimeout(report, 1500);
  else addEventListener('load', () => setTimeout(report, 1500), { once: true });
  addEventListener('tecservice:qa-report', report);
})();
</script>`

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
}

export function isWithin(root, candidate) {
  const rel = relative(root, candidate)
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`))
}

export function decodeRequestPath(requestTarget) {
  // Validate the raw path before URL normalization could remove traversal segments.
  if (!requestTarget?.startsWith('/') || requestTarget.startsWith('//')) return null
  let path
  try { path = decodeURIComponent(requestTarget.split(/[?#]/, 1)[0]) } catch { return null }
  if (/[\0\\:]/.test(path) || path.split('/').some(part => part === '..' || part.startsWith('.'))) return null
  return path
}

async function safeFile(root, path) {
  const candidate = resolve(root, `.${path}`)
  if (!isWithin(root, candidate)) return null
  try {
    let canonical = await realpath(candidate)
    if (!isWithin(root, canonical)) return null
    if ((await stat(canonical)).isDirectory()) canonical = await realpath(resolve(canonical, 'index.html'))
    if (!isWithin(root, canonical) || !(await stat(canonical)).isFile()) return null
    return canonical
  } catch (error) {
    if (['ENOENT', 'ENOTDIR', 'EACCES'].includes(error.code)) return null
    throw error
  }
}

export async function createQaHandler({ directory = 'dist', injectMetrics = true } = {}) {
  const root = await realpath(resolve(directory))
  return async (request, response) => {
    const send = (status, body, type = 'text/plain; charset=utf-8', cache = 'no-store') => {
      let buffer = Buffer.isBuffer(body) ? body : Buffer.from(body)
      const headers = { 'Content-Type': type, 'Cache-Control': cache, 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', Vary: 'Accept-Encoding' }
      if (/\bgzip\b(?!\s*;\s*q=0(?:\D|$))/.test(request.headers['accept-encoding'] ?? '') && /^(text\/|application\/(json|xml)|image\/svg)/.test(type)) {
        buffer = gzipSync(buffer)
        headers['Content-Encoding'] = 'gzip'
      }
      headers['Content-Length'] = buffer.length
      response.writeHead(status, headers)
      response.end(request.method === 'HEAD' ? undefined : buffer)
    }
    try {
      const path = decodeRequestPath(request.url)
      if (!path) return send(400, 'Invalid path')
      if (path === '/api' || path.startsWith('/api/')) {
        return send(path === '/api/auth/me' ? 401 : 503, JSON.stringify({ error: 'Local QA server: API integration is disabled.' }), mimeTypes['.json'])
      }
      if (!['GET', 'HEAD'].includes(request.method)) return send(405, 'Read-only local QA server')
      let file = await safeFile(root, path)
      let status = 200
      if (!file) {
        status = 404
        file = await safeFile(root, path === '/en' || path.startsWith('/en/') ? '/en/404.html' : '/404.html')
      }
      if (!file) return send(404, 'Not found')
      const extension = extname(file).toLowerCase()
      let body = await readFile(file)
      if (extension === '.html' && injectMetrics) {
        body = Buffer.from(body.toString('utf8').replace(/<head\b[^>]*>/i, match => match + metricsScript))
      }
      send(status, body, mimeTypes[extension] ?? 'application/octet-stream', status === 200 && extension !== '.html' ? 'public, max-age=3600' : 'no-store')
    } catch (error) {
      console.error('Local QA request failed:', error.message)
      if (!response.headersSent) send(500, 'Local QA server error')
      else response.end()
    }
  }
}

export async function createQaServer(options = {}) {
  return createServer(await createQaHandler(options))
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.argv[2] ?? 4176)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid QA port')
  const server = await createQaServer({ directory: process.argv[3] ?? 'dist' })
  server.listen(port, '127.0.0.1', () => {
    console.log(`Local production QA: http://127.0.0.1:${port}`)
    console.log(`Metrics: ${METRICS_TAG}; loopback/unthrottled only, not Lighthouse or field CWV.`)
  })
}
