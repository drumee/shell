# @drumee/shell

Administration utilities for a running [Drumee](https://drumee.com) server,
exposed as the `drumee-cli` command.

```console
npm i @drumee/shell
```

## Usage

```console
drumee-cli <command> [options]
```

| Command | What it manages |
|---|---|
| `user` | User accounts |
| `org` / `organization` | Organisations |
| `media` | The media watcher |
| `domain` | Domain configuration |

Each sub-command parses its own options — run it without arguments to see them.
Argument definitions live in `args/`, the implementations in `bin/`, and the
dispatcher is `drumee-cli.js`.

## Care

These commands operate on a live Drumee instance and its database. Read what a
command does before running it against anything you cannot restore.

## Built on

[`@drumee/server-core`](https://github.com/drumee/server-core) and
[`@drumee/server-essentials`](https://github.com/drumee/server-essentials).

## Contributing

See the org [CONTRIBUTING guide](https://github.com/drumee/.github/blob/main/CONTRIBUTING.md).
Questions: [Discussions](https://github.com/orgs/drumee/discussions).

## License

AGPL-3.0 — see [LICENSE](LICENSE).
