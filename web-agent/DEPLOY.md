# 部署到 Render

本文说明如何将教学设计网页部署到 Render，并通过环境变量配置访问密码和智增增 API。

## GitHub 仓库结构

仓库至少应包含：

```text
.codex/skills/teaching-design/
web-agent/
  package.json
  server.mjs
  public/
```

不要提交 `web-agent/.env` 或真实 API Key。`.gitignore` 已忽略 `.env`。

## 创建 Render Web Service

在 Render 控制台选择 **New → Web Service**，连接 GitHub 仓库，并选择 `main` 分支。设置：

| 设置项 | 填写内容 |
| --- | --- |
| Runtime / Language | Node |
| Root Directory | `web-agent` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | 初次试用可选 Free |

本项目没有外部 npm 依赖，`npm install` 可以完成构建。Render 会提供 `PORT`，无需手动设置。

## 设置环境变量

在服务的 **Environment** 页面添加：

| Key | Value |
| --- | --- |
| `HOST` | `0.0.0.0` |
| `APP_PASSWORD` | 自行设置一条较长、未在其他网站使用过的访问密码 |
| `ZZZ_API_KEY` | 智增增 API Key，作为 Secret 保存 |
| `ZZZ_BASE_URL` | `https://api.zhizengzeng.com/v1` |
| `ZZZ_MODEL` | `gpt-4o-mini`，或你的智增增账户已开通的模型 |

请勿把 API Key 或访问密码写进代码、上传到 GitHub，或发在聊天中。公网服务配置了 API Key 却没有配置 `APP_PASSWORD` 时，服务器会拒绝启动。

保存环境变量后，Render 会重新部署。部署成功后，打开 Render 提供的 `https://…onrender.com` 地址，浏览器会提示输入访问密码。把这个密码只分享给可信的使用者。

## 免费方案说明

Render Free Web Service 可用于试用，但闲置约 15 分钟后会休眠；再次访问时可能需要等待服务唤醒。具体额度和限制以 Render 控制台显示为准。

## 隐私和费用

网页会将提交的教案和量规发送给配置的模型 API 进行诊断。请求使用 `store: false`，但这不等同于零数据保留。提交前请删除不必要的学生姓名、联系方式等个人信息，并遵守学校的数据要求。

智增增 API 用量按智增增账户规则计费。保护好 API Key 和访问密码，并定期检查 API 用量。当前访问保护使用一个共享密码，不含个人账号或调用频率限制；不要把访问地址和密码公开发布。

## 后续更新

将代码更改提交并推送到 GitHub 的 `main` 分支后，Render 会按服务设置自动重新部署。
