# RTF – Realtime Financial Gateway
## Deployment Guide

### Quick Start

```bash
# 1. Clone and enter project
git clone <your-repo> rtf && cd rtf

# 2. Create and configure env
cp .env.example .env
# Edit .env: set SERP_API_KEY and ALLOWED_ORIGINS

# 3. Build and launch all services
docker compose up -d --build

# 4. Verify
curl http://localhost:7123/health
curl http://localhost:7123/api/market/indexes
```

---

### Environment Setup

Edit `.env` before first launch:

| Variable | Required | Example |
|---|---|---|
| `SERP_API_KEY` | ✅ | `abc123...` |
| `ALLOWED_ORIGINS` | ✅ | `https://yourwordpress.com` |
| `FETCH_INTERVAL` | ❌ | `30000` (ms) |
| `CACHE_TTL` | ❌ | `60` (seconds) |
| `REDIS_PASSWORD` | ❌ | leave blank for dev |

---

### Docker Commands

```bash
# Start in background
docker compose up -d --build

# View all logs
docker compose logs -f

# View only API logs
docker compose logs -f api

# Check container health
docker compose ps

# Rebuild only the API after code change
docker compose up -d --build api --no-deps

# Stop everything
docker compose down

# Stop and remove volumes (⚠ wipes Redis data)
docker compose down -v
```

---

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health + Redis/SSE status |
| `GET` | `/api/market/indexes` | Latest market index data (JSON) |
| `GET` | `/sse/indexes` | Live SSE stream of market updates |

#### Sample REST Response
```json
{
  "success": true,
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "data": [
    {
      "name": "Dow Jones Industrial Average",
      "price": "43,000.00",
      "price_movement": { "percentage": 0.45, "value": "193.50" }
    }
  ]
}
```

---

### WordPress Integration

1. Copy files from `wordpress-examples/` to your theme:
   - `js/rtf-finance.js`
   - `css/rtf-finance.css`

2. Add snippet from `functions-snippet.php` to your `functions.php`

3. Define your API base URL in `wp-config.php`:
   ```php
   define('RTF_API_BASE', 'https://api.yoursite.com');
   ```

4. Include the widget template anywhere in your theme:
   ```php
   <?php get_template_part('partials/rtf-market-widget'); ?>
   ```

---

### Production TLS (HTTPS)

Update `nginx/conf.d/api.conf` to add an SSL server block and mount
your certificates via a volume in `docker-compose.yml`:

```yaml
nginx:
  volumes:
    - ./certs:/etc/nginx/certs:ro
```

Or use Certbot with the `nginx` container and Let's Encrypt.

---

### Scaling

To run multiple API instances behind Nginx:

```bash
docker compose up -d --scale api=3
```

Nginx will round-robin across all instances. Redis is shared, so
the SSE manager needs to be upgraded to use Redis Pub/Sub for
cross-instance broadcast (add `redis-pubsub` to `sseManager.js`).

---

### Architecture Overview

```
WordPress Theme
    │
    ├── GET /api/market/indexes  (REST – initial load)
    └── GET /sse/indexes         (EventSource – live updates)
              │
           Nginx (port 7123)
              │
           Express API
              ├── Memory Cache (< 1ms)
              ├── Redis Cache  (< 5ms)
              └── SerpApi      (on cache miss only, every 30s)
```
