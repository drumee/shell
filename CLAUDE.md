# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@drumee/shell` is a collection of Node.js CLI admin scripts for managing a Drumee server instance. 
## Running the CLI scripts

Each root-level script is run directly with Node.js and requires a running MariaDB and Redis instance:

```bash
node user.js <command> [options]        # list | add | remove | update
node organization.js <command> [options] # list | add | remove | update
node index.js [--id <id>] [--age <sec>] [--yes]  # remove deprecated domains
node media-watcher.js <command>          # list | update
```

Examples:
```bash
node user.js list --email user@example.com
node user.js add --email user@example.com --firstname Jane --password secret
node user.js remove --email user@example.com   # requires root
node organization.js add --ident myorg         # requires root
node media-watcher.js update
```

## Development

```bash
npm run dev      # sync changes to dev server via drumee-server-devel
npm run release  # git push + npm publish + version bump
```

Configure the dev environment by editing `.dev-tools.rc/devel.sh` — set `DEST_DIR`, `DEST_HOST`, or `CONTAINER_NAME` to point at your local Docker container or remote server.


## Architecture

### CLI scripts (root level)

Each script follows the same pattern:
1. Parse arguments via `args/<name>.js` (argparse-based, run at `require` time — parses `process.argv` immediately)
2. Open a `Mariadb` connection to the `yp` (yellow pages) database using `process.env.USER`
3. Call `Cache.load(yp)` to initialize the system cache from the database
4. Optionally initialize `RedisStore` for real-time socket messaging
5. Dispatch on `args.command` and call into `lib/` classes

### `lib/` classes

- **`lib/index.js` (`Sandbox`)** — base class (extends `Logger`); holds the `yp` DB connection and the `iniFolders` utility
- **`lib/drumate.js` (`Drumate` extends `Sandbox`)** — user lifecycle: `create()`, `remove()`, `removeHubs()`, `createHub()`, `setWallpaper()`, `setupAvatar()`
- **`lib/organization.js` (`Organization` extends `Sandbox`)** — domain/org lifecycle: `createDomain()`, `createOwner()`, `AddMember()`, `remove()`, `updateContacts()`; emits `sandbox.progress` events over Redis
- **`lib/mfs.js` (`Mfs` extends `Logger`)** — media filesystem operations: `importFile()`, `importFolder()`, `importSymlinks()`, `createSymLink()`; downloads remote content to `/tmp` before inserting DB records
- **`lib/page.js` (`SandboxPage`)** — server-side page renderer for sandbox demo environments; reads `lib/templates/index.tpl` via lodash `template()`

### Key dependencies

- **`@drumee/server-essentials`**: `Mariadb`, `Cache`, `RedisStore`, `Messenger`, `Network`, `Attr`, `sysEnv`, `toArray`, `uniqueId`
- **`@drumee/server-core`**: `Entity`, `RuntimeEnv`, `Generator`
- All database operations go through stored procedures (e.g. `drumate_create`, `domain_create`, `organisation_create`, `entity_delete`) — direct SQL queries are used only for lookups

### Environment assumptions

- `process.env.USER` must be a valid MariaDB user with access to the `yp` database
- `sysEnv()` reads from the system Drumee config (`/etc/drumee/`) to get `mfs_dir`, `system_user`, `system_group`, `main_domain`
- Some operations (user `remove`, org `add/create`) require the process to run as `root`
