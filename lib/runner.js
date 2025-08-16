const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');
const glob = require('glob');

class Runner {
  constructor() {
    this.configFile = 'runner.config.js';
    this.config = {};
    this.tasks = {};
    this.loadConfig();
  }

  // Load configuration
  loadConfig() {
    const configPath = path.resolve(process.cwd(), this.configFile);

    if (fs.existsSync(configPath)) {
      try {
        delete require.cache[require.resolve(configPath)];
        this.config = require(configPath);
        this.tasks = this.config.tasks || {};
      } catch (error) {
        console.warn(chalk.yellow('Warning: Could not load config file'), error.message);
      }
    }
  }

  // Initialize configuration
  async init() {
    const configTemplate = `module.exports = {
  // Global configuration
  options: {
    verbose: false,
    parallel: false,
  },

  // Task definitions
  tasks: {
    // Basic command task
    build: {
      description: 'Build the project',
      command: 'npm run build',
    },

    // Sequential tasks
    deploy: {
      description: 'Deploy the application',
      sequence: ['build', 'test', 'upload'],
    },

    // Parallel tasks
    test: {
      description: 'Run all tests',
      parallel: ['test:unit', 'test:integration'],
    },

    'test:unit': {
      description: 'Run unit tests',
      command: 'npm test -- --unit',
    },

    'test:integration': {
      description: 'Run integration tests',
      command: 'npm test -- --integration',
    },

    // Custom function task
    upload: {
      description: 'Upload build artifacts',
      function: async (options) => {
        console.log('Uploading artifacts...');
        // Custom upload logic here
        return true;
      },
    },

    // File operations
    clean: {
      description: 'Clean build directory',
      files: {
        delete: ['dist/**', 'build/**'],
      },
    },

    // Environment-specific tasks
    'dev:start': {
      description: 'Start development server',
      command: 'npm run dev',
      env: {
        NODE_ENV: 'development',
      },
    },
  },

  // Watch configuration
  watch: {
    patterns: ['src/**/*.js', 'lib/**/*.js'],
    ignore: ['node_modules/**', 'dist/**'],
  },
};`;

    await fs.writeFile(this.configFile, configTemplate);
    this.loadConfig();
  }

  // List all available tasks
  listTasks() {
    console.log(chalk.blue('Available tasks:'));
    console.log();

    if (Object.keys(this.tasks).length === 0) {
      console.log(chalk.yellow('No tasks configured. Run'), chalk.cyan('my-runner init'), chalk.yellow('to create a configuration file.'));
      return;
    }

    Object.entries(this.tasks).forEach(([name, task]) => {
      const description = task.description || 'No description';
      console.log(chalk.green('  ' + name) + ' - ' + chalk.gray(description));
    });
    console.log();
  }

  // Run a specific task
  async run(taskName, options = {}) {
    if (!this.tasks[taskName]) {
      throw new Error(`Task "${taskName}" not found`);
    }

    const task = this.tasks[taskName];
    const verbose = options.verbose || this.config.options?.verbose;

    if (verbose) {
      console.log(chalk.blue(`Running task: ${taskName}`));
    }

    // Handle different task types
    if (task.command) {
      return this.runCommand(task.command, task.env, verbose);
    } else if (task.sequence) {
      return this.runSequence(task.sequence, options);
    } else if (task.parallel) {
      return this.runParallel(task.parallel, options);
    } else if (task.function) {
      return this.runFunction(task.function, options);
    } else if (task.files) {
      return this.runFileOperations(task.files, verbose);
    } else {
      throw new Error(`Invalid task configuration for "${taskName}"`);
    }
  }

  // Run a shell command
  runCommand(command, env = {}, verbose = false) {
    return new Promise((resolve, reject) => {
      if (verbose) {
        console.log(chalk.gray(`Executing: ${command}`));
      }

      const child = spawn(command, [], {
        shell: true,
        stdio: verbose ? 'inherit' : 'pipe',
        env: { ...process.env, ...env },
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  // Run tasks in sequence
  async runSequence(tasks, options) {
    for (const taskName of tasks) {
      await this.run(taskName, options);
    }
  }

  // Run tasks in parallel
  async runParallel(tasks, options) {
    const promises = tasks.map(taskName => this.run(taskName, options));
    await Promise.all(promises);
  }

  // Run a custom function
  async runFunction(fn, options) {
    return await fn(options);
  }

  // Run file operations
  async runFileOperations(operations, verbose = false) {
    if (operations.delete) {
      for (const pattern of operations.delete) {
        const files = glob.sync(pattern);
        for (const file of files) {
          if (verbose) {
            console.log(chalk.gray(`Deleting: ${file}`));
          }
          await fs.remove(file);
        }
      }
    }

    if (operations.copy) {
      for (const [src, dest] of Object.entries(operations.copy)) {
        if (verbose) {
          console.log(chalk.gray(`Copying: ${src} -> ${dest}`));
        }
        await fs.copy(src, dest);
      }
    }
  }

  // Watch files and run task on changes
  async watch(taskName, options) {
    const chokidar = require('chokidar');
    const patterns = this.config.watch?.patterns || ['**/*'];
    const ignored = this.config.watch?.ignore || ['node_modules/**'];

    console.log(chalk.blue(`Watching for changes...`));
    console.log(chalk.gray(`Patterns: ${patterns.join(', ')}`));

    const watcher = chokidar.watch(patterns, {
      ignored: ignored,
      ignoreInitial: true,
    });

    watcher.on('change', async (filePath) => {
      console.log(chalk.yellow(`File changed: ${filePath}`));
      try {
        await this.run(taskName, options);
        console.log(chalk.green(`✓ Task "${taskName}" completed`));
      } catch (error) {
        console.error(chalk.red(`✗ Task "${taskName}" failed:`), error.message);
      }
    });

    // Keep the process running
    process.on('SIGINT', () => {
      console.log(chalk.blue('\nStopping watcher...'));
      watcher.close();
      process.exit(0);
    });
  }
}

module.exports = Runner;