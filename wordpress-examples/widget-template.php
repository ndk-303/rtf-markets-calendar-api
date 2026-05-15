<!-- Market Indexes Widget
     Add this HTML wherever you want the widget to appear in your theme template.
     Example: page-home.php, index.php, sidebar.php
-->

<section class="rtf-market-section" aria-label="Live Market Indexes">
  <div class="rtf-market-header">
    <h2 class="rtf-market-title">Market Indexes</h2>
    <span class="rtf-live-badge">● LIVE</span>
    <span class="rtf-updated">
      Updated: <time id="rtf-updated-at">—</time>
    </span>
  </div>

  <!-- RTFFinance.initWidget() targets this container -->
  <div id="rtf-market-widget" class="rtf-market-grid" role="list">
    <span class="rtf-loading">Loading market data…</span>
  </div>
</section>
