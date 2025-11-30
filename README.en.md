# org-webhook-spliter

Language / 语言: [中文](./README.md) | **English**

A Cloudflare Worker to split organization webhooks to different targets, preventing data leak

## Functions

- [x] [Split by **Public / Private Repositories** in an organization](#org_config)
- [x] [Split by **Single Repository**](#repo_config)
- [x] [Secret Validation *(path verify)*](#secret)

## Deploy

Click the button below:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/siiway/org-webhook-spliter)

## Secrets

### `SECRET`

If not set to `/disabled` or `disabled`, will only allow requests made to this path

### `REPO_CONFIG`

Forwarding config for single repo (**Priority is higher than `ORG_CONFIG`**)

Format:

```jsonc
{
    "siiway/.github": [
        {
            "url": "https://discord.com/api/webhooks/1422516241670738041/xxx/github"
        },
        // more target hook urls
    ],
    // "siiway/internal": [...] // more repos
}
```

### `ORG_CONFIG`

Forwarding config for organization

Format:

```jsonc
{
    "siiway": { // Org login name (github.com/siiway -> siiway)
        "private": [ // Notifications for private repos
            {
                "name": "dc-webhook",
                "url": "https://discord.com/api/webhooks/1422185291191418900/xxx/github"
            },
            // {"url": "https://target.url"}
        ],
        "public": [ // Notifications for public repos
            {
                "name": "dc-webhook-pub",
                "url": "https://discord.com/api/webhooks/1199938889469657118/xxx/github",
                "headers": {
                    "Authorization": "Bot My.Bot.Token" // to pass rate limit (that based by ip address)
                }
            }
        ],
        "others": [ // Notifications that are not associated with a repo
            {
                "url": "https://discord.com/api/webhooks/1422185291191418900/xxx/github" // if you think url leaking is doesn't matter for this hook
            }
        ]
    },
    // "sleepy-project": {
        // ...
    // }
}
```

### `HEADERS`

Request headers config

Format:

```jsonc
{
    "Authorization": "Bearer TOKEN",
    "Content-Type": "application/json",
    "X-Delete-Me": null, // Set to null to remove A existing header
    // ...
}
```

> [!TIP]
> Also supports YAML config.
