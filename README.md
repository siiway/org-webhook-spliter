# org-webhook-spliter

Language / 语言: **中文** | [English](./README.en.md)

一个 Cloudflare Worker, 用于拆分组织 Webhook 到不同目标, 防止组织内部隐私信息泄漏

## 功能

- [x] [按组织下 **公开 / 私有仓库** 进行拆分](#org_config)
- [x] [按 **预定义仓库列表** 进行拆分](#repo_config)
- [x] [Secret 鉴权 *(路径验证)*](#secret)
- [x] 使用 yaml / json 配置文件
- [X] 自定义 header (目前只支持全局设置, 因为~~不想动~~ 以后要重置成 workflow 版来彻底防止 429)
- [x] 给每个 hook 设置名称 (防止返回中泄漏 url) & headers
- [ ] 给每个 hook 单独配置 secret

## 部署

点击下面的按钮部署:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/siiway/org-webhook-spliter)

## Secrets 列表

### `SECRET`

如果此变量值不为 `/disabled` 或 `disabled`, 则只允许路径名为此变量值的请求

如设置 SECRET 为 `abcd` 或 `/abcd`, 则访问 `/abcd` 可正常转发请求, 其他路径 (`/` 除外) 返回 `Wrong Secret!` 并拒绝转发请求

### `REPO_CONFIG`

基于仓库的配置 **(优先级高于 `ORG_CONFIG`)**

格式:

```jsonc
{
    "siiway/.github": [
        "https://discord.com/api/webhooks/1422516241670738041/xxx/github"
        // 还可添加更多目标 url
    ],
    // "siiway/internal": [...] // 还可添加更多仓库
}
```


### `ORG_CONFIG`

基于组织的配置

格式:

```jsonc
{
    "siiway": { // 组织登录名 (github.com/siiway -> siiway)
        "private": [ // 私有仓库通知
            {
                "name": "dc-webhook",
                "url": "https://discord.com/api/webhooks/1422185291191418900/xxx/github"
            },
            // 还可添加更多目标 url
        ],
        "public": [ // 公开仓库通知
            {
                "name": "dc-webhook-pub",
                "url": "https://discord.com/api/webhooks/1199938889469657118/xxx/github",
                "headers": {
                    "Authorization": "Bot My.Bot.Token" // 你或许可以传递授权标头来绕过基于 ip 的速率限制?
                }
            }
        ],
        "others": [ // 不与具体仓库关联的通知
            {
                "url": "https://discord.com/api/webhooks/1422185291191418900/xxx/github" // 如果你觉得在返回中显示这个 url 不危险
            }
        ]
    },
    // "sleepy-project": {
        // 还可添加更多组织
    // }
}
```

### `HEADERS`

请求头设置

格式:

```jsonc
{
    "Authorization": "Bearer TOKEN",
    "Content-Type": "application/json",
    "X-Delete-Me": null, // 设置为 null 来删除已有 header
    // ...
}
```

> [!TIP]
> 也支持使用 YAML 配置 <br/>
> 详见: [`types/config.d.ts`](./types/config.d.ts)
