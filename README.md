# Email-MCP 服务
[![GitHub stars](https://img.shields.io/github/stars/caijianying/email-mcp.svg?style=badge&label=Stars&logo=github)](https://github.com/caijianying/email-mcp)
[![AUR](https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg)](https://github.com/caijianying/email-mcp/blob/main/LICENSE)
[![](https://img.shields.io/badge/Author-小白菜-orange.svg)](https://caijianying.github.io)
[![](https://img.shields.io/badge/version-V1.0.0-brightgreen.svg)](https://github.com/caijianying/email-mcp)



这是一个基于 MCP 协议的邮件发送服务，允许 AI 助手通过标准化接口发送电子邮件。

## 项目概述

本服务器理论上适用于所有支持 MCP 协议的 AI 助手和客户端，虽然目前只测试了接入 Spring-AI 的 Java 服务。

> 注意：目前仅支持本地运行环境

## 安装步骤

1. 克隆本仓库
   ```bash
   git clone [仓库地址]
   cd email-mcp
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 构建项目
   ```bash
   npm run build
   ```

## 配置与运行

克隆仓库本地运行，请使用如下配置：

```json
{
  "mcpServers": {
    "email-mcp-server": {
      "command": "node",
      "args": [
        "yourpath\\email-mcp\\build\\server.js",
        "--verbose"
      ],
      "env": {}
    }
  }
}
```

> 注意：请将 `yourpath` 替换为您实际的项目路径

## 使用指南

### 发送邮件

与 AI 助手交互时，只需提供以下必填参数即可发送邮件：

- SMTP服务器主机名（如：smtp.exmail.qq.com）
- 端口号（如：465）
- 发件邮箱（如：xxx@xx.com）
- 发件密码（如：*****）
- 收件人（如：xxx@qq.com）
- 邮件主题
- 邮件正文

示例：
```
SMTP服务器主机名是smtp.exmail.qq.com，端口是465，发件邮箱是xxx@xx.com，发件密码是*****,收件人是xxx@qq.com,正文是你好,好久不见,主题是测试
```

## 开发与贡献

有问题欢迎提 issue，大家共同进步！

## 许可证

本项目采用 Apache 许可证。详情请参阅 LICENSE 文件。
