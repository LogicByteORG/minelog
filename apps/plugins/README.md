# minelog plugins

Server side uploaders for minelog.org. One shared core, one thin adapter per platform.

## Modules

| Module | Covers | Java | Status |
| --- | --- | --- | --- |
| `minelog-core` | Shared upload, delete, insights and file rules. No platform imports. | 8 | v1 |
| `platform-bukkit` | Spigot, Paper, Purpur and Folia from a single jar. Baseline 1.8.9. | 8 | v1 |
| `platform-bungee` | BungeeCord and Waterfall from a single jar. Baseline 1.8.9. | 8 | v1 |
| `platform-velocity` | Velocity 3.x proxy. | 17 | v1 |
| `platform-forge` | Forge mod loader. | - | v2 skeleton |
| `platform-fabric` | Fabric and Quilt from one mapping. | - | v2 skeleton |
| `platform-neoforge` | NeoForge mod loader. | - | v2 skeleton |
| `platform-quilt` | Quilt specific entry point, only if Fabric parity breaks. | - | v2 skeleton |

Paper, Purpur and Folia need no separate module. They run the Bukkit jar.
Waterfall runs the Bungee jar.

## Commands

All platforms share the same shape:

- `/minelog share` uploads `logs/latest.log`.
- `/minelog share <name>` uploads one file from `logs/`, for example `/minelog share 2026-10-01-1.log`.
- `/minelog delete <id>` deletes a recent upload with its stored token.
- Alias: `/mlog`.

Only `*.log` files inside `logs/` are accepted in v1. Paths, folders and
`*.log.gz` files are refused with a short message. This keeps a player from
reading files outside the log directory.

After an upload the sender gets a page link, a raw link, and the problem count
when the API reports one. Players get a clickable link. Console also gets a
plain link on its own line so panels without chat clicks can still copy it.

## Build

You need JDK 21 to compile. The legacy modules still target Java 8 bytecode,
so they run on 1.8.9 servers.

```bash
cd apps/plugins
./gradlew build
```

Jars land in each `platform-*/build/libs/`.

## Config

Every platform writes the same keys:

```yaml
api-base: "https://api.minelog.org"
site-base: "https://minelog.org"
timeout-seconds: 15
source-name: "minelog-bukkit"
```

Permissions: `minelog.share`, `minelog.delete`, `minelog.admin`.

## Releases

Releases are cut from a tag and published by CI, no manual uploads.

1. Bump `modVersion` in `gradle.properties` and add a `## X.Y.Z` section
   to `CHANGELOG.md`. The version also flows into `plugin.yml`,
   `bungee.yml` and the Velocity metadata from this one value.
2. Merge to `main` through a PR, then push tag `plugins-vX.Y.Z`
   (`plugins-v1.1.0-beta.1` for a beta, `-alpha.N` for an alpha).
3. The `plugins-release` workflow checks the tag against `modVersion`,
   builds with `clean build`, creates a GitHub Release titled
   `minelog plugins vX.Y.Z` with the CHANGELOG section as notes and the
   three jars attached, then uploads the same three jars to the
   `minelog` Modrinth project with loaders, game versions and channel
   filled in. Tag suffix decides the channel on both sides.

Secrets: `MODRINTH_TOKEN` (repository secret), `MODRINTH_PROJECT_ID`
(repository variable, defaults to `minelog`).
