#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Command } from 'commander';
import { z } from "zod";
import { EmailService } from './tools/emailService';

// 日志工具函数 - 使用stderr进行日志输出
function log(message: any) {
  process.stderr.write(`[${new Date().toISOString()}] ${message}\n`);
}

// 创建服务器实例函数
function createServerInstance() {
  log('创建MCP服务器实例...');

  // 创建MCP服务器实例
  const server = new McpServer({
    name: 'email-mcp',
    version: '1.0.0'
  }, {
    capabilities: {
      toolCallProcessing: true,
      messageHandling: true,
      supportsStreaming: false
    }
  });

  const param = {
    host: z.string().describe('SMTP服务器主机名'),
    port: z.number().int().positive().describe('SMTP服务器端口号'),
    subject: z.string().describe('邮件主题'),
    to: z.string().email("无效的邮箱地址").describe('收件人邮箱地址'),
    body: z.string().min(1, "邮件正文不能为空").describe('邮件正文'),
    from: z.string().email("无效的邮箱地址").describe('发件人邮箱地址'),
    fromPassword: z.string().min(1, "发件人邮箱密码不能为空").describe('发件人邮箱密码')
  }
  server.tool('mcp_email_send', "发送邮件", param, async (param) => {
    log(JSON.stringify(param))
    // 调用EmailService发送邮件
    const emailService = new EmailService();
    const result = await emailService.sendEmail(param);
    log(JSON.stringify(result))
    return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
  })

  return server;
}

// 解析命令行参数
const program = new Command();
program
  .option('-v, --verbose', '启用详细日志', false)
  .option('--version', '显示版本信息');

program.parse(process.argv);
const options = program.opts();

// 如果请求显示版本信息
if (options.version) {
  process.stdout.write('email-mcp v1.0.0\n');
  process.exit(0);
}

// 启动服务器
async function startServer() {
  try {
    log("Email MCP Server 启动中...");

    // 创建服务器实例
    const server = createServerInstance();

    // 创建stdio传输层 - 这会自动处理stdout/stderr的正确使用
    const transport = new StdioServerTransport();

    // 连接服务器和传输层
    await server.connect(transport);

    log("=== 服务器启动成功 ===");

  } catch (error) {
    log(`服务器启动失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// 注册全局错误处理
process.on('uncaughtException', (error) => {
  log(`[致命错误] 未捕获的异常: ${error.message}`);
  // 不立即退出，让剩余的响应完成
  setTimeout(() => process.exit(1), 100);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`[错误] 未处理的Promise拒绝: ${reason}`);
});

// 优雅处理进程信号
process.on('SIGINT', () => {
  log('接收到中断信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('接收到终止信号，正在关闭服务器...');
  process.exit(0);
})

// 启动服务器
startServer().catch(error => {
  log(`启动过程出错: ${error.message}`);
  process.exit(1);
});
