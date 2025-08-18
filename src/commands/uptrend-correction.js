import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import yf from "yahoo-finance2"
import { SMA, EMA } from 'technicalindicators'

class UptrendCorrectionCommand {
  constructor() {
    this.command = new Command("uptend-correction") // change command name here if needed
      .description("Say hello")
      .action(() => { this.run(); });

  }

  async run() {
    const tickerFile = fs.readFileSync("./data/ticker.csv", "utf8");
    const tickers = tickerFile.split(", ")

    let uptrendCorrections = [];

    const startDate = this.getStartDate(500);

    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i].replaceAll("'", "");

      try {
        const history = await yf.historical(
          ticker,
          { period1: startDate, interval: '1d' }
        );

        // if (!history || history.length < 200) {
        //   console.log(chalk.bgRed(`${ticker}: Not enough data to calculate EMA200`));
        // }

        const closes = history.map(day => day.close);

        const close = closes.slice(-1)[0];

        const priceSMA20 = SMA.calculate({ period: 20, values: closes }).slice(-1)[0];
        const priceSMA50 = SMA.calculate({ period: 50, values: closes }).slice(-1)[0];
        const priceSMA200 = SMA.calculate({ period: 200, values: closes }).slice(-1)[0];
        const priceEMA13 = EMA.calculate({ period: 13, values: closes }).slice(-1)[0];

        const volumes = history.map(day => day.volume);
        const volume = volumes.slice(-1)[0];

        const volumeSMA5 = SMA.calculate({ period: 5, values: volumes }).slice(-1)[0];
        const volumeSMA20 = SMA.calculate({ period: 20, values: volumes }).slice(-1)[0];

        const isUptrendCorrection = priceSMA20 > priceSMA50 //sma20 > sma50
          && priceSMA50 > priceSMA200 //and sma50>sma200
          && close > priceSMA200 //and close > sma200
          && close < priceSMA20 //and close < sma20
          && close < priceEMA13 //and close < ema13
          && volumeSMA5 > 1000000 //and sma("volume",5)> 1000000
          && volumeSMA20 > 1000000; //and sma("volume",20)> 1000000

        if(isUptrendCorrection){
          uptrendCorrections.push({
            ticker,
            close,
            volume,
            priceSMA20: Math.round(priceSMA20),
            priceSMA50: Math.round(priceSMA50),
            priceSMA200: Math.round(priceSMA200),
            priceEMA13: Math.round(priceEMA13),
            strVolume: this.formatNumber(volume),
            volumeSMA5: this.formatNumber(volumeSMA5),
            volumeSMA20: this.formatNumber(volumeSMA20),
          });
        }

      } catch (error) {
        console.log(chalk.red(error));
      }
    }

    console.log("\n");
    uptrendCorrections = uptrendCorrections.sort((a, b) => b.volume - a.volume);
    console.table(uptrendCorrections);
  }

  formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"; // Billion
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"; // Million
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"; // Thousand
    return num.toString();
  }

  getStartDate(daysBack = 500){
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    return date.toISOString().split("T")[0];
  }


  getCommand() {
    return this.command;
  }
}

// Export an instance of the class
export default new UptrendCorrectionCommand().getCommand();
