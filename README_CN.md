# Cloudflare Worker 翻译后端

<p align="center">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white" alt="Cloudflare Workers">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

[English README](README.md)

> [!IMPORTANT]
> **公益免费 API 端点:** `https://translate.api.tokisaki.top/translate` (欢迎使用)

这是一个基于 Cloudflare Workers 构建的轻量级、高性能翻译后端。它通过分层架构集成了多个大语言模型（LLM），确保翻译的高可用性和高质量。

## 🌟 特性

- **分层翻译架构**：
  1. **Groq (Llama 3.3 70B)**：首选方案，速度极快且质量高。
  2. **硅基流动 (DeepSeek-R1)**：备选方案，强大的国产大模型。
  3. **Cloudflare Workers AI (m2m100)**：兜底方案，确保服务永不掉线。
- **智能 Token 截断**：自动检测并截断超长文本（默认 1000 tokens），防止恶意消耗。
- **原生速率限制**：集成 Cloudflare Rate Limiting API，基于 IP 进行精准限流。
- **防垃圾过滤**：自动识别纯符号或非人类语言，直接返回原词，节省 API 消耗。
- **KOReader 深度集成**：提供专用的 Lua 脚本，完美适配 KOReader 翻译功能。

## 📂 项目结构

- `src/worker.ts`: Worker 入口，处理请求路由。
- `src/services/translateService.ts`: 核心翻译逻辑，处理分层调用和 Token 截断。
- `src/services/llmService.ts`: 封装 Groq 和硅基流动的 API 调用。
- `src/config.ts`: 项目配置文件。
- `src/koreader/`: 包含适配 KOReader 的 Lua 脚本。

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/Tokisaki-Galaxy/translate-api
cd translate-api
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置密钥
你需要设置以下 Cloudflare Secrets：
```bash
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put SILICONFLOW_API_KEY
```

### 4. 本地开发
```bash
npm run start
```

### 5. 部署
```bash
npm run deploy
```

## 🛠 API 使用

### 翻译接口
- **Endpoint:** `POST /translate`
- **Body:**
  ```json
  {
    "text": "Hello, world!",
    "targetLanguage": "zh"
  }
  ```
- **Response:**
  ```json
  {
    "translatedText": "你好，世界！",
    "modelUsed": "Groq (llama-3.3-70b-versatile)"
  }
  ```

## 📖 KOReader 集成

[点击这里](https://github.com/Tokisaki-Galaxy/kindle-koreader-custom-translator)

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 协议。
