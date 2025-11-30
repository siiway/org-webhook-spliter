# Contributing Tips

Package Manager: **pnpm**

```bash
pnpm dev # dev
pnpm start # same as `pnpm dev`
pnpm types # re-generate types (`worker-configuration.d.ts`)
pnpm deploy # deploy to Cloudflare Workers platform
```

## Environment

Create `config.local.yaml` (first-used) or `config.local.json`:

```yaml
secret: 'xxxxx'
repo-config:
  siiway/icons:
    private:
      # ...
    public:
      # ...
org-config:
  siiway:
    # ...
```

```jsonc
{
  "secret": "xxx",
  "repo-config": {
    "siiway/icons": [
      // ...
    ]
  },
  "org-config": {
    // ...
  }
}
```

Then run:

```bash
python3 tools/gen-env.py
```

to generate `.dev.vars` automatically.

> [!IMPORTANT]
> Needs **Python 3.7+** with **`PyYAML`** lib installed.

<!-- in `.env` or `.dev.vars`.

> https://developers.cloudflare.com/workers/wrangler/environments/#secrets-in-local-development -->

## Secrets Tip

If you're using Git Connection to update automatically, use `wrangler secret` to put config to prevent overriding:

```bash
wrangler secret put SECRET
# Then input your secret value, and press Enter
```

```bash
# Or read the value from file:
echo ./org.local.yaml | wrangler secret put ORG_CONFIG
```
