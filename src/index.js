import { Command } from "commander";
import chalk from "chalk";
import UptrendCorrectionCommand from "./commands/uptrend-correction.js";

export async function main(argv) {
  const pkgModule = await import("../package.json", { assert: { type: "json" } });
  const version = pkgModule.default.version;

  try {
    const program = new Command();

    program
      .name("omss")
      .description("Oh My Stock Screener CLI")
      .version(version, "-v, --version", "output the current version");

    program.addCommand(UptrendCorrectionCommand);

    program.parse(argv);
  } catch (err) {
    console.error(chalk.red("CLI failed:"), err.message);
    process.exit(1);
  }
}
