import { Command } from "commander";
import chalk from "chalk";
import UptrendCorrectionCommand from "./commands/uptrend-correction.js";
import FourCandleCorrection from "./commands/four-candle-correction.js"

export async function main(argv) {
  const pkgModule = await import("../package.json", { with: { type: "json" } });
  const version = pkgModule.default.version;

  try {
    const program = new Command();

    program
      .name("omss")
      .description("Oh My Stock Screener CLI")
      .version(version, "-v, --version", "output the current version");

    program.addCommand(UptrendCorrectionCommand);
    program.addCommand(FourCandleCorrection);

    program.parse(argv);
  } catch (err) {
    console.error(chalk.red("CLI failed:"), err.message);
    process.exit(1);
  }
}
