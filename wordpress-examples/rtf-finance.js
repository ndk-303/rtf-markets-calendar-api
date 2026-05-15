/**
 * RTF Financial Gateway – WordPress Integration
 * Place this file in your theme: /wp-content/themes/your-theme/js/rtf-finance.js
 *
 * Usage: wp_enqueue_script('rtf-finance', get_template_directory_uri() . '/js/rtf-finance.js', [], '1.0', true);
 *        wp_localize_script('rtf-finance', 'RTFConfig', ['apiBase' => 'https://api.yoursite.com']);
 */

const RTFFinance = (() => {
  'use strict';

  const API_BASE = window.RTFConfig?.apiBase ?? 'http://localhost:80';

  /* ── REST fetch ─────────────────────────────────────────────────────────── */

  const fetchIndexes = async () => {
    const res = await fetch(`${API_BASE}/api/market/indexes`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  /* ── DOM helpers ────────────────────────────────────────────────────────── */

  const formatChange = (value) => {
    const num = parseFloat(value);
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}`;
  };

  const getChangeClass = (value) =>
    parseFloat(value) >= 0 ? 'rtf-positive' : 'rtf-negative';

  const renderIndexCard = (index) => {
    const el = document.createElement('div');
    el.className = 'rtf-index-card';
    el.dataset.symbol = index.stock ?? '';
    el.innerHTML = `
      <span class="rtf-index-name">${index.name ?? '—'}</span>
      <span class="rtf-index-price">${index.price ?? '—'}</span>
      <span class="rtf-index-change ${getChangeClass(index.price_movement?.percentage ?? 0)}">
        ${formatChange(index.price_movement?.percentage ?? 0)}%
      </span>
    `;
    return el;
  };

  const updateWidget = (container, indexes) => {
    container.innerHTML = '';
    indexes.forEach((idx) => container.appendChild(renderIndexCard(idx)));
  };

  /* ── SSE subscription ───────────────────────────────────────────────────── */

  let eventSource = null;

  const subscribeSSE = (container) => {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource(`${API_BASE}/sse/indexes`);

    eventSource.addEventListener('market:indexes', (e) => {
      try {
        const payload = JSON.parse(e.data);
        updateWidget(container, payload.indexes ?? []);

        const ts = document.getElementById('rtf-updated-at');
        if (ts) ts.textContent = new Date(payload.fetchedAt).toLocaleTimeString();
      } catch (err) {
        console.error('[RTF] SSE parse error', err);
      }
    });

    eventSource.addEventListener('error', () => {
      console.warn('[RTF] SSE error – will auto-reconnect');
    });

    return eventSource;
  };

  const unsubscribe = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };

  /* ── Widget initializer ─────────────────────────────────────────────────── */

  const initWidget = async (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<span class="rtf-loading">Loading market data…</span>';

    try {
      const { data, updatedAt } = await fetchIndexes();
      updateWidget(container, data ?? []);

      const ts = document.getElementById('rtf-updated-at');
      if (ts) ts.textContent = new Date(updatedAt).toLocaleTimeString();

      subscribeSSE(container);
    } catch (err) {
      container.innerHTML = '<span class="rtf-error">Market data unavailable</span>';
      console.error('[RTF] Init error', err);

      setTimeout(() => initWidget(containerId), 10000);
    }
  };

  return { initWidget, fetchIndexes, subscribeSSE, unsubscribe };
})();

document.addEventListener('DOMContentLoaded', () => {
  RTFFinance.initWidget('rtf-market-widget');
});
