#!/bin/bash
# init-omss.sh

echo "🚀 Initializing Oh My Stock Screener..."

# Create project structure
mkdir -p ./{bin,lib,src,test,scripts,reports,data}

# Initialize pnpm
pnpm init

# Create .pnpmrc with workspace root check disabled
echo "ignore-workspace-root-check=true" > .pnpmrc

# Install dependencies (now works without -w flag)
echo "📦 Installing dependencies..."
pnpm add commander chalk fs-extra glob inquirer yahoo-finance2 node-cron axios cheerio technicalindicators
pnpm add -D nodemon jest eslint prettier

# Create workspace file (optional)
cat > pnpm-workspace.yaml << EOF
packages:
  - '.'
  - 'packages/*'
  - 'plugins/*'
EOF

# Create other files
touch bin/cli.js lib/runner.js src/index.js test/runner.test.js .gitignore

# Make CLI executable
chmod +x bin/cli.js

echo "✅ Oh My Stock Screener project created successfully!"