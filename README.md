# ⚔️ WWMPC — World Wide Military Power Comparison

A single-file, client-side web application for **real-time global military power comparison**. Select any two countries (or the EU as a combined bloc) and get an instant side-by-side analysis of their military capabilities, defence budgets, nuclear arsenals, and spending trends — all pulled from live public data sources with no backend required.

---

## Features

### Country Selection
- **55 countries + EU** selectable via dropdown, covering all major military powers from the US and China down to Armenia and Peru.
- Countries with a declared nuclear arsenal are marked with ☢ in the dropdown.
- A **swap button (⇄)** instantly reverses the two sides.
- Default comparison: 🇺🇸 United States vs 🇨🇳 China.

### Live Status Bar
Real-time indicators (green / yellow / red dots) show the fetch status of each data source:
- GlobalFirepower scrape
- World Bank API
- Breaking Defense RSS
- The War Zone RSS
- Air & Space Forces Magazine RSS
- A "Cached data" notice when serving from `localStorage`.

### Scoreboard
Head-to-head comparison card displaying, for each country:
- **GlobalFirepower Power Index** (lower = stronger)
- GFP global rank
- Active military personnel
- Total aircraft / fighters
- Naval assets / aircraft carriers / submarines
- Main battle tanks
- Defence budget

### Multi-Domain Analysis (Charts)
Two Chart.js charts rendered side-by-side:

| Chart | Description |
|---|---|
| **Capability Radar** | 6-axis spider chart covering Air Power, Naval Power, Land Forces, Personnel, Budget, and Nuclear capability — normalised for visual comparison. |
| **Force Comparison** | Horizontal bar chart comparing raw force numbers: fighters, naval vessels, submarines, tanks, and personnel. |

### Military Budget — World Bank Live API
- Fetches the **MS.MIL.XPND.CD** indicator from the World Bank Open Data API for each country.
- Displays a **multi-year line chart** of actual expenditure in USD.
- EU is handled as a special aggregate (sums all 27 member states via parallel requests).
- Data is cached in `localStorage` to avoid redundant API calls; cache age is displayed in the status bar.
- Auto-refreshes every **30 minutes**.

### Nuclear Status
- Detailed cards for all **9 declared/estimated nuclear states** (USA, Russia, China, UK, France, India, Pakistan, Israel, North Korea).
- Each card shows: total warhead count, deployed warheads, delivery systems breakdown (land / sea / air), and a short status description.
- Data sourced from the **FAS Nuclear Notebook 2025** and **SIPRI Nuclear Forces** database.
- If neither selected country has nuclear weapons, the section shows a "non-nuclear" notice.

### Live Defense News (RSS Feeds)
Three live news columns fetched from:
- **Breaking Defense**
- **The War Zone** (The Drive)
- **Air & Space Forces Magazine**

Each feed uses a **5-proxy cascade** to overcome CORS restrictions when opening the file locally:
1. codetabs.com proxy
2. thingproxy.freeboard.io
3. allorigins.win (raw)
4. allorigins.win (JSON wrapper)
5. rss2json.com

Results are cached in `localStorage` for **24 hours**. A **trend analysis** scans all RSS headlines for mentions of the currently selected countries and summarises the geopolitical context at the bottom of the news section.

### Military Spending Projection
- Applies **linear regression** to the World Bank historical budget data.
- Extrapolates a **10-year forecast** shown as dashed lines on a time-series chart.
- Shaded area marks the projected period.
- If the two trend lines intersect in the future, a **crossover year annotation** is displayed.

---

## Data Sources

| Source | Data |
|---|---|
| [GlobalFirepower 2026](https://www.globalfirepower.com/) | Power Index, force counts, budget, rank |
| [World Bank Open Data — MS.MIL.XPND.CD](https://data.worldbank.org/indicator/MS.MIL.XPND.CD) | Historical military expenditure (USD) |
| [FAS Nuclear Notebook 2025](https://fas.org/initiative/status-world-nuclear-forces/) | Warhead counts, deployment status |
| [SIPRI Military Expenditure Database 2025](https://www.sipri.org/databases/milex) | Budget cross-reference |
| [SIPRI Yearbook 2025](https://www.sipri.org/publications/yearbooks) | Strategic assessments |
| [IISS Military Balance 2026](https://www.iiss.org/publications/the-military-balance) | Order-of-battle reference |
| [Arms Control Association](https://www.armscontrol.org/) | Nuclear policy context |
| Breaking Defense / The War Zone / Air & Space Forces | Live RSS defence news |

Static fallback data (GFP 2026 reference) is embedded in the file and used whenever live scraping fails, ensuring the dashboard always renders even in fully offline or restricted environments.

---

## Architecture

```
INDEX.html  (single self-contained file, ~1 800 lines)
│
├── <head>
│   ├── Chart.js 4 – loaded from jsDelivr → cdnjs → unpkg (CDN cascade fallback)
│   └── CSS – dark-theme design system with CSS custom properties
│
└── <body>
    ├── Header     – country pickers, live clock (UTC), refresh button
    ├── Status bar – per-source fetch indicators
    ├── Scoreboard – side-by-side GFP stats cards
    ├── Charts     – Capability Radar + Force Comparison (Chart.js)
    ├── Budget     – World Bank multi-year line chart
    ├── Nuclear    – FAS/SIPRI reference cards
    ├── News       – 3-column live RSS feeds
    ├── Projection – 10-year regression forecast chart
    └── Footer     – data source links + disclaimer

JavaScript sections (in-page <script>):
  0. COUNTRIES  – 55-country database with GFP slugs and World Bank codes
  1. NUCLEAR    – static nuclear reference data (FAS / SIPRI / ACA)
  2. UTILITY    – fetch helpers, localStorage cache, timeout wrappers
  3. STATE      – selected countries, chart instances, RSS item buffer
  4. CLOCK      – UTC ticker + header date
  5. DROPDOWNS  – country picker build + change handlers
  6. CHART WAIT – polls until Chart.js CDN has loaded
  7. GFP        – proxy-based HTML scraper + regex parser + static fallback
  8. SCOREBOARD – renders the comparison cards from GFP data
  9. CHARTS     – radar + forces Chart.js builds with normalization logic
 10. NUCLEAR    – renders nuclear status cards
 11. WORLD BANK – live API fetch, EU aggregation, budget line chart
 12. RSS        – 5-proxy cascade XML parser, render and cache logic
 13. TREND      – analyses RSS headlines for country mentions
 14. ORCHESTRATOR – `loadComparison()` coordinates all async data loads
 15. INIT       – DOMContentLoaded bootstrap
```

---

## Getting Started

No build step, no dependencies to install.

```bash
# Clone the repo
git clone https://github.com/your-username/wwmpc.git
cd wwmpc

# Open in browser
start INDEX.html          # Windows
open INDEX.html           # macOS
xdg-open INDEX.html       # Linux
```

Or serve it over HTTP to avoid `file://` CORS restrictions (recommended for better live-data fetching):

```bash
npx serve .               # Node.js
python -m http.server     # Python 3
```

Then open `http://localhost:3000` (or the port shown).

---

## Caching Strategy

| Cache key pattern | TTL | Contents |
|---|---|---|
| `gfp_v5_<code>` | 72 hours | GlobalFirepower scraped data |
| `mil_rss_v5_<id>` | 24 hours | RSS feed items |
| World Bank data | Session (in-memory) | Multi-year budget arrays |

All cache is stored in `localStorage`. The status bar shows a yellow "Cached data" indicator and the approximate cache age in hours whenever stale data is being served.

---

## Disclaimer

> Independent, non-partisan analysis. Budget figures reflect official declarations; actual expenditure may differ per SIPRI/IISS estimates. Nuclear warhead counts are estimates based on open-source intelligence and may not reflect classified totals.
