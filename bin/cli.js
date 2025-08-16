#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const Runner = require('../lib/runner');
const { version } = require('../package.json');

const program = new Command();
const runner = new Runner();

program
  .name('omss')
  .description('A screeneer for screening potential Indonesian stocks based on technical analysis')
  .version(version);

// Run command
program
  .command('run <task>')
  .description('Run a specific task')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-c, --config <file>', 'Specify config file', 'runner.config.js')
  .action(async (task, options) => {
    try {
      await runner.run(task, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .alias('ls')
  .description('List all available tasks')
  .action(() => {
    runner.listTasks();
  });

// Init command
program
  .command('init')
  .description('Initialize runner configuration')
  .action(async () => {
    try {
      await runner.init();
      console.log(chalk.green('✓ Runner configuration initialized!'));
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Watch command
program
  .command('watch <task>')
  .description('Watch files and run task on changes')
  .option('-p, --pattern <pattern>', 'File pattern to watch', '**/*')
  .action(async (task, options) => {
    try {
      await runner.watch(task, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Handle unknown commands
program
  .command('*', { noHelp: true })
  .action((cmd) => {
    console.error(chalk.red(`Unknown command: ${cmd}`));
    console.log('Run ' + chalk.cyan('my-runner --help') + ' for available commands');
    process.exit(1);
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}