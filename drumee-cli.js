#!/usr/bin/env node

const commands = {
  user:         './bin/user',
  org:          './bin/organization',
  organization: './bin/organization',
  media:        './bin/media-watcher',
  domain:       './bin/index',
};

const sub = process.argv[2];

if (!sub || !commands[sub]) {
  const names = [...new Set(Object.keys(commands))];
  console.error(`Usage: drumee-cli <command> [options]`);
  console.error(`Commands: ${names.join(', ')}`);
  process.exit(1);
}

// Remove the sub-command so the target script's argparse sees clean argv.
process.argv.splice(2, 1);
require(commands[sub]);
