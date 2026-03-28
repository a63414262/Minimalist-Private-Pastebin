# 📝 极简私有剪贴板 (Minimalist Private Pastebin)

基于 Cloudflare Workers 和 KV 存储构建的轻量级、无服务器（Serverless）私有剪贴板。专为开发者和自动化脚本设计，支持阅后即焚、纯文本展示和 API 快速接入。

## ✨ 核心特性

* **🔒 私有化部署**：支持开启全局密码保护，仅限拥有密码的用户上传文本。
* **🛠️ 极简配置**：抛弃繁琐的环境变量，核心管理密钥直接硬编码在脚本顶部，开箱即用，直观安全。
* **🔗 多样化链接**：支持生成 6 位短链接、22 位高强度长链接，以及自定义专属后缀。
* **⏳ 阅后即焚**：利用 Cloudflare KV 的 TTL 特性，支持设置 1 分钟到 1 周的自动销毁时间。
* **🤖 纯净输出**：分享出去的链接默认返回 `text/plain` 纯文本格式，极度适合 `curl` 抓取或自动化脚本读取，无任何 HTML 标签干扰。
* **📋 一键复制**：前端创建成功后自带一键复制链接功能。

## 🚀 部署指南

本项目完全免费托管在 Cloudflare 上。

### 1. 创建 KV 数据库
1. 登录 Cloudflare 控制台，进入 **Workers & Pages** -> **KV**。
2. 创建一个新的命名空间，名称必须严格填写为：`PASTEBIN_KV`。

### 2. 创建并绑定 Worker
1. 在 **Workers & Pages** 中创建一个新的 Worker。
2. 进入该 Worker 的 **Settings (设置)** -> **Variables (变量)** -> **KV Namespace Bindings**。
3. 点击 **Add binding**：
   * Variable name (变量名称): `PASTEBIN_KV`
   * KV namespace (命名空间): 选择你刚刚创建的 `PASTEBIN_KV`。

### 3. 修改配置并部署
复制 `index.js` 中的完整代码到 Worker 的编辑器中。在代码最顶部，按需修改你的专属配置：

```javascript
// ==================== 基础配置 ====================
// 是否开启“访问必须输入密码”功能？(true: 开启私有模式, false: 关闭)
const ENABLE_PASSWORD_PROTECTION = true; 

// 你的专属访问和管理密钥 (强烈建议修改为你的复杂密码)
const ADMIN_TOKEN = "your_secret_token_here"; 
// ==================================================
