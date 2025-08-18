# Indonesia Stock Screener CLI

A specialized npm task runner for screening potential Indonesian stocks based on technical analysis. This tool runs automated screening sessions to identify promising investment opportunities in the Indonesia Stock Exchange (IDX).

## Features

- 📊 **Technical Analysis Screening** - Automated technical analysis of Indonesian stocks
- ⏰ **Scheduled Execution** - Runs screening tasks at the end of each trading session
- 🇮🇩 **IDX Focus** - Specifically designed for Indonesia Stock Exchange data
- 🎯 **Smart Filtering** - Advanced algorithms to identify potential stock opportunities
- 📈 **Multiple Indicators** - RSI, MACD, Moving Averages, Volume Analysis, and more
- 🔄 **Automated Workflows** - Complete screening pipeline from data fetch to report generation
- 📱 **Report Generation** - Detailed screening reports with technical insights
- 🛠️ **Flexible Configuration** - Customize screening criteria and parameters

## Installation

### Global Installation

```bash
npm install -g indonesia-stock-screener
```

### Local Installation

```bash
npm install --save-dev indonesia-stock-screener
```

## Quick Start

1. **Initialize your screener with configuration:**

   ```bash
   stock-screener init
   ```

2. **List available screening tasks:**

   ```bash
   stock-screener list
   ```

3. **Run a screening session:**

   ```bash
   stock-screener run daily-screen
   ```

4. **Schedule automatic screening:**
   ```bash
   stock-screener schedule --time "15:30" --task daily-screen
   ```

## Configuration

Create a `screener.config.js` file in your project root:

```javascript
module.exports = {
  // Screening configuration
  screening: {
    market: "IDX", // Indonesia Stock Exchange
    timezone: "Asia/Jakarta",
    sessionEnd: "15:00", // IDX closing time
    dataSource: "yahoo-finance", // or 'investing.com', 'idx-api'
  },

  // Technical analysis parameters
  indicators: {
    rsi: { period: 14, oversold: 30, overbought: 70 },
    macd: { fast: 12, slow: 26, signal: 9 },
    sma: { periods: [20, 50, 200] },
    volume: { avgPeriod: 20, surgeThreshold: 2 },
  },

  // Screening criteria
  filters: {
    marketCap: { min: 1000000000 }, // Min 1B IDR
    volume: { minAvg: 100000 }, // Min average daily volume
    price: { min: 100, max: 50000 }, // Price range in IDR
    sector: ["Technology", "Banking", "Consumer"], // Target sectors
  },

  tasks: {
    "daily-screen": {
      description: "Daily stock screening after market close",
      sequence: [
        "fetch-data",
        "technical-analysis",
        "filter-stocks",
        "generate-report",
      ],
    },

    "momentum-scan": {
      description: "Scan for momentum stocks",
      function: async (options) => {
        // Custom momentum screening logic
        return await runMomentumScan(options);
      },
    },
  },
};
```

## Screening Tasks

### Data Fetching Tasks

Fetch real-time and historical stock data:

```javascript
{
  'fetch-data': {
    description: 'Fetch latest IDX stock data',
    command: 'node scripts/fetch-idx-data.js',
    env: { DATA_SOURCE: 'yahoo-finance' }
  }
}
```

### Technical Analysis Tasks

Run technical analysis on stock data:

```javascript
{
  'technical-analysis': {
    description: 'Perform technical analysis',
    function: async (options) => {
      const { calculateRSI, calculateMACD, calculateSMA } = require('./lib/indicators');

      console.log('Running technical analysis...');
      const stocks = await loadStockData();

      for (const stock of stocks) {
        stock.indicators = {
          rsi: calculateRSI(stock.prices, 14),
          macd: calculateMACD(stock.prices),
          sma20: calculateSMA(stock.prices, 20),
        };
      }

      await saveAnalysisResults(stocks);
      return true;
    }
  }
}
```

### Filtering Tasks

Apply screening criteria:

```javascript
{
  'filter-stocks': {
    description: 'Filter stocks based on criteria',
    function: async (options) => {
      const stocks = await loadAnalysisResults();
      const filtered = stocks.filter(stock => {
        return stock.indicators.rsi < 30 && // Oversold
               stock.volume > stock.avgVolume * 1.5 && // Volume surge
               stock.price > stock.sma20; // Above support
      });

      await saveFilteredStocks(filtered);
      console.log(`Found ${filtered.length} potential stocks`);
      return true;
    }
  }
}
```

### Report Generation Tasks

Generate detailed reports:

```javascript
{
  'generate-report': {
    description: 'Generate screening report',
    function: async (options) => {
      const stocks = await loadFilteredStocks();
      const report = generateHtmlReport(stocks, {
        title: 'Daily Indonesia Stock Screening Report',
        date: new Date().toLocaleDateString('id-ID'),
        indicators: ['RSI', 'MACD', 'Volume', 'Price Action']
      });

      await fs.writeFile('./reports/daily-report.html', report);
      console.log('Report saved to ./reports/daily-report.html');
      return true;
    }
  }
}
```

## CLI Commands

### `stock-screener run <task>`

Run a specific screening task:

```bash
stock-screener run daily-screen --verbose
stock-screener run momentum-scan --config custom.screener.js
```

### `stock-screener schedule`

Schedule automatic screening:

```bash
stock-screener schedule --task daily-screen --time "15:30"
stock-screener schedule --task weekly-review --cron "0 16 * * 5"
```

### `stock-screener list`

List all available screening tasks:

```bash
stock-screener list
# or
stock-screener ls
```

### `stock-screener init`

Initialize screener configuration:

```bash
stock-screener init --template basic
stock-screener init --template advanced
```

### `stock-screener report`

Generate or view reports:

```bash
stock-screener report --latest
stock-screener report --date 2024-03-15
stock-screener report --export csv
```

## Programmatic Usage

You can also use the screener programmatically in your Node.js applications:

```javascript
const StockScreener = require("indonesia-stock-screener");

const screener = new StockScreener();

// Run a screening task
await screener.run("daily-screen", { verbose: true });

// Get screening results
const results = await screener.getResults("daily-screen");
console.log(`Found ${results.length} potential stocks`);

// Custom screening
const customResults = await screener.screen({
  indicators: { rsi: { period: 14, threshold: 30 } },
  filters: { volume: { minIncrease: 1.5 } },
});
```

## Scheduling Configuration

Configure automatic screening to run at market close:

```javascript
module.exports = {
  schedule: {
    timezone: "Asia/Jakarta",
    tasks: [
      {
        name: "daily-screen",
        cron: "0 15 * * 1-5", // Every weekday at 3:00 PM (market close)
        enabled: true,
      },
      {
        name: "weekly-summary",
        cron: "0 16 * * 5", // Every Friday at 4:00 PM
        enabled: true,
      },
    ],
  },

  // Market configuration
  market: {
    name: "IDX",
    currency: "IDR",
    tradingDays: [1, 2, 3, 4, 5], // Monday to Friday
    tradingHours: {
      session1: { start: "09:00", end: "12:00" },
      session2: { start: "13:30", end: "15:00" },
    },
  },

  // Data sources
  dataSources: {
    primary: "yahoo-finance",
    fallback: ["investing.com", "idx-api"],
    apiKeys: {
      alphavantage: process.env.ALPHA_VANTAGE_API_KEY,
    },
  },
};
```

## Technical Indicators

The screener supports various technical analysis indicators:

### RSI (Relative Strength Index)

```javascript
{
  rsi: {
    period: 14,
    oversold: 30,  // Buy signal threshold
    overbought: 70 // Sell signal threshold
  }
}
```

### MACD (Moving Average Convergence Divergence)

```javascript
{
  macd: {
    fast: 12,   // Fast EMA period
    slow: 26,   // Slow EMA period
    signal: 9   // Signal line EMA period
  }
}
```

### Moving Averages

```javascript
{
  sma: { periods: [20, 50, 200] }, // Simple Moving Average
  ema: { periods: [12, 26] },      // Exponential Moving Average
}
```

### Volume Analysis

```javascript
{
  volume: {
    avgPeriod: 20,        // Average volume calculation period
    surgeThreshold: 1.5,  // Volume surge multiplier
    dryUpThreshold: 0.5   // Volume dry-up threshold
  }
}
```

## Examples

### Basic Daily Screening Workflow

```javascript
module.exports = {
  tasks: {
    "daily-screen": {
      description: "Complete daily screening workflow",
      sequence: [
        "fetch-market-data",
        "calculate-indicators",
        "apply-filters",
        "rank-stocks",
        "generate-report",
        "send-notifications",
      ],
    },

    "momentum-breakout": {
      description: "Find momentum breakout stocks",
      function: async (options) => {
        const stocks = await getStockData();
        return stocks.filter((stock) => {
          const rsi = stock.indicators.rsi;
          const volume = stock.volume / stock.avgVolume;
          const priceBreakout = stock.price > stock.resistance;

          return rsi > 50 && volume > 2 && priceBreakout;
        });
      },
    },

    "value-stocks": {
      description: "Screen for undervalued stocks",
      parallel: ["calculate-pe", "calculate-pb", "calculate-div-yield"],
      then: "filter-value-stocks",
    },
  },
};
```

### Sector-Specific Screening

```javascript
{
  'banking-screen': {
    description: 'Screen banking sector stocks',
    function: async () => {
      return await screenSector('Banking', {
        indicators: ['RSI', 'Price/Book', 'ROE'],
        filters: {
          pe: { max: 15 },
          pb: { max: 1.5 },
          roe: { min: 0.15 }
        }
      });
    }
  },

  'tech-momentum': {
    description: 'Technology sector momentum scan',
    function: async () => {
      return await screenSector('Technology', {
        indicators: ['RSI', 'MACD', 'Volume'],
        filters: {
          rsi: { min: 50, max: 70 },
          macd: 'bullish_crossover',
          volume: { surge: 2.0 }
        }
      });
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © OhMyMooon

## Changelog

### v1.0.0

- Initial release
