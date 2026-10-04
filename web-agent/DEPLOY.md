# 部署到公网

当前网页可以作为本机应用使用。要给其他地点的同事访问，可部署为 Render Web Service。Render 从 Git 仓库构建并给服务分配 HTTPS 网址；公开访问要求 Node 服务监听 `0.0.0.0` 并使用平台提供的 `PORT`。

## 先准备代码

1. 将整个项目仓库推送到你有权限的 GitHub 仓库，至少包括 `web-agent/` 和 `.codex/skills/teaching-design/`。
2. 确认 `web-agent/.env` 没有提交。`.gitignore` 已忽略它；只提交 `.env.example`。
3. 本项目不使用外部 npm 依赖，启动脚本为 `npm start`。

## 在 Render 创建服务

1. 在 Render 选择 **New → Web Service**，连接包含本项目的 GitHub 仓库。
2. 设置：
   - Runtime：Node
   - Root Directory：留空（仓库根目录）
   - Build Command：`cd web-agent && npm install`
   - Start Command：`cd web-agent && npm start`
3. 在服务的 Environment 环境变量设置中添加：
   - `HOST`：`0.0.0.0`
   - `OPENAI_API_KEY`：你的 API key（使用平台的 Secret 输入，不要写入代码或提交到 Git）
   - `OPENAI_MODEL`：`gpt-6-astra`，或你账号已开通的模型
   - 不必手动设置 `PORT`，由托管平台提供。
4. 创建服务并等待部署完成。Render 会显示可访问的 `https://…onrender.com` 地址；之后可再绑定自有域名。

以后把修改推送到已连接分支，Render 会按服务设置自动重新部署。费用和免费计划限制以 Render 控制台当时显示为准。

## 分享前要补的保护

当前版本**没有登录、访问密码或请求频率限制**。若直接公开网址，任何拿到网址的人都可能提交教案并消耗你的 API 用量。因此在发给同事前，应先加访问控制和调用限额；只有自己测试时，可以先部署为受限服务或暂不分享网址。

另外，上传的教案会从浏览器经托管服务发送给配置的模型 API。请求使用 `store: false`，但这不代表零数据保留；输入前请移除不必要的学生身份信息，并按学校的数据要求确认是否适合使用该服务。
