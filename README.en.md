# org-webhook-spliter

Language / 语言: [中文](./README.md) | **English**

A Cloudflare Worker to split organization webhooks to different targets, preventing data leak

## Functions

- [x] [Split by **Public / Private Repositories** in an organization]
- [ ] Split by **Single Repository**
- [ ] Secret Validation *(path verify)*

## Deploy

Click the button below:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/siiway/org-webhook-spliter)

## Variables

### `SECRET`

If not set to `/disabled` or `disabled`, will only allow requests made to this path

### `REPO_CONFIG`

Forwarding config for single repo (**Priority is higher than `ORG_CONFIG`**)

Format:

```jsonc
{
    "siiway/.github": [
        "https://discord.com/api/webhooks/1422516241670738041/xxx/github",
        // "https://another.target"
    ],
    // "siiway/internal": ["https://target.url"]
}
```

### `ORG_CONFIG`

基于组织的配置

格式:

```jsonc
{
    "siiway": { // Org login name (github.com/siiway -> siiway)
        "private": [ // Notifications for private repos
            "https://discord.com/api/webhooks/1422185291191418900/xxx/github",
            // "https://target.url"
        ],
        "public": [ // Notifications for public repos
            "https://discord.com/api/webhooks/1199938889469657118/xxx/github"
        ],
        "others": [ // Notifications that are not associated with a repo
            "https://discord.com/api/webhooks/1422185291191418900/xxx/github"
        ]
    },
    // "sleepy-project": {
        // ...
    // }
}
```
