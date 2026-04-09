require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const axios      = require('axios');
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = 5002;
const SPRING_URL = process.env.SPRING_URL || 'http://localhost:8080';

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 60_000, max: 200, message: { error: 'Too many requests, slow down.' } });
app.use('/api/', limiter);

// ── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', upstream: SPRING_URL }));

// ── Proxy helper ─────────────────────────────────────────────
async function proxy(req, res) {
  try {
    const url    = `${SPRING_URL}${req.originalUrl}`;
    const config = {
      method:  req.method,
      url,
      params:  req.method === 'GET' ? undefined : undefined,
      data:    ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined,
      headers: { 'Content-Type': 'application/json' },
    };
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const data   = err.response?.data   || { message: err.message };
    res.status(status).json(data);
  }
}

// ── Complaints routes ────────────────────────────────────────
app.get   ('/api/complaints',       proxy);
app.get   ('/api/complaints/:id',   proxy);
app.post  ('/api/complaints',       proxy);
app.put   ('/api/complaints/:id',   proxy);
app.delete('/api/complaints/:id',   proxy);

// ── Analytics routes ─────────────────────────────────────────
app.get('/api/analytics/summary',               proxy);
app.get('/api/analytics/by-status',             proxy);
app.get('/api/analytics/by-category',           proxy);
app.get('/api/analytics/by-priority',           proxy);
app.get('/api/analytics/resolution-by-category',proxy);
app.get('/api/analytics/monthly-trend',         proxy);

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n  ✓ Node.js BFF running on http://localhost:${PORT}`);
  console.log(`  ✓ Proxying to Spring Boot at ${SPRING_URL}\n`);
});
