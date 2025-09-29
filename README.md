# org-webhook-spliter

一个小工具, 用于拆分组织 Webhook 到不同目标, 防止组织内部隐私信息泄漏

## 功能

- [x] 按 组织名 进行划分
- [x] 按 公开 / 私有仓库 进行拆分
- [ ] 按 预定义仓库列表 进行拆分
- [ ] Secret 鉴权
- [ ] ~~按 ??? 进行拆分~~

## 部署

点击下面的按钮部署:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/siiway/org-webhook-spliter)

## 变量列表

### `SECRET`

TODO

### `ORG_CONFIG`

基于组织的配置

格式:

```jsonc
// 注意: 每个组织的配置必须同时包含 private, public, others 三个目标 url 列表, 不可缺省
{
    "siiway": { // 组织登录名 (github.com/siiway -> siiway)
        "private": [ // 私有仓库通知
            "https://discord.com/api/webhooks/1422185291191418900/xxx/github",
            // "https://target.url" // 还可添加更多
        ],
        "public": [ // 公开仓库通知
            "https://discord.com/api/webhooks/1199938889469657118/xxx/github"
        ],
        "others": [ // 不与具体仓库关联的通知
            "https://discord.com/api/webhooks/1422185291191418900/xxx/github"
        ]
    },
    "sleepy-project": {
        // 也可添加更多组织
    }
}
```