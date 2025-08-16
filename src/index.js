const Runner = require('../lib/runner');

// Export the Runner class for programmatic use
module.exports = Runner;

// If this file is run directly, show usage info
if (require.main === module) {
  const chalk = require('chalk');

  console.log(chalk.blue('My NPM Runner'));
  console.log(chalk.gray('A flexible task runner for Node.js projects'));
  console.log();
  console.log('Usage:');
  console.log('  ' + chalk.cyan('my-runner run <task>') + '    Run a specific task');
  console.log('  ' + chalk.cyan('my-runner list') + '         List all available tasks');
  console.log('  ' + chalk.cyan('my-runner init') + '         Initialize configuration');
  console.log('  ' + chalk.cyan('my-runner watch <task>') + '  Watch files and run task on changes');
  console.log();
  console.log('For more information, run: ' + chalk.cyan('my-runner --help'));
}