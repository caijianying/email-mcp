#!/usr/bin/env node

/**
 * 测试客户端 - 用于测试Email MCP Server的stdio通信功能
 */

const { spawn } = require('child_process');
const process = require('process');

// 测试请求列表
const testRequests = [
  {
    jsonrpc: '2.0',
    id: '1',
    method: 'initialize',
    params: { clientInfo: { name: 'test-client', version: '1.0.0' } }
  },
  {
    jsonrpc: '2.0',
    id: '2',
    method: 'ping'
  },
  {
    jsonrpc: '2.0',
    id: '3',
    method: 'getCapabilities'
  },
  {
    jsonrpc: '2.0',
    id: '4',
    method: 'process',
    params: { 
      email: {
        subject: '测试邮件',
        body: '这是一封测试邮件内容',
        from: 'test@example.com',
        to: 'recipient@example.com'
      }
    }
  },
  {
    jsonrpc: '2.0',
    id: '5',
    method: 'forward',
    params: { messageId: 'test-msg-001', target: 'secondary-processor' }
  },
  {
    jsonrpc: '2.0',
    id: '6',
    method: 'unknownMethod' // 测试未知方法
  }
];

console.log('=== Email MCP Server 测试客户端 ===');
console.log('启动服务器并发送测试请求...\n');

// 启动服务器进程
const server = spawn('node', ['src/server.js'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'inherit'] // 继承stderr以显示服务器日志
});

// 存储接收到的响应
const responses = [];
let currentRequestIndex = 0;
let isServerReady = false;
let timeoutId;

// 处理服务器输出
server.stdout.on('data', (data) => {
  const output = data.toString('utf8');
  console.log('\n[服务器输出]');
  
  // 检查是否包含JSON响应
  const lines = output.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      try {
        // 尝试解析为JSON（响应）
        const response = JSON.parse(trimmedLine);
        console.log('\x1b[32m[收到响应]\x1b[0m', JSON.stringify(response, null, 2));
        responses.push(response);
        
        // 发送下一个测试请求
        sendNextRequest();
      } catch (e) {
        // 非JSON响应（可能是日志）
        console.log(trimmedLine);
        
        // 检查是否是服务器就绪信息
        if (trimmedLine.includes('等待来自Spring AI的连接') && !isServerReady) {
          isServerReady = true;
          console.log('\n[客户端] 服务器已就绪，开始发送测试请求...\n');
          sendNextRequest();
        }
      }
    }
  }
});

// 发送下一个请求
function sendNextRequest() {
  clearTimeout(timeoutId);
  
  if (currentRequestIndex < testRequests.length) {
    const request = testRequests[currentRequestIndex];
    console.log(`\n\x1b[34m[发送请求 ${currentRequestIndex + 1}/${testRequests.length}]\x1b[0m`, request.method);
    
    const requestStr = JSON.stringify(request);
    server.stdin.write(`${requestStr}\n`);
    currentRequestIndex++;
    
    // 设置超时
    timeoutId = setTimeout(() => {
      console.log('\n\x1b[31m[错误]\x1b[0m 请求超时，终止测试');
      cleanupAndExit(1);
    }, 5000);
  } else {
    console.log('\n\x1b[32m=== 所有测试请求已发送 ===\x1b[0m');
    
    // 等待一会儿让最后一个响应完成
    setTimeout(() => {
      summarizeResults();
      cleanupAndExit(0);
    }, 2000);
  }
}

// 总结测试结果
function summarizeResults() {
  console.log('\n=== 测试结果总结 ===');
  console.log(`发送请求数: ${testRequests.length}`);
  console.log(`收到响应数: ${responses.length}`);
  
  const successResponses = responses.filter(r => r.result);
  const errorResponses = responses.filter(r => r.error);
  
  console.log(`成功响应: ${successResponses.length}`);
  console.log(`错误响应: ${errorResponses.length}`);
  
  if (errorResponses.length > 0) {
    console.log('\n错误详情:');
    errorResponses.forEach((err, index) => {
      console.log(`${index + 1}. 错误码: ${err.error.code}, 消息: ${err.error.message}`);
    });
  }
  
  console.log('\n=== 测试完成 ===');
}

// 清理并退出
function cleanupAndExit(code) {
  clearTimeout(timeoutId);
  server.kill('SIGINT');
  process.exit(code);
}

// 处理错误
server.on('error', (err) => {
  console.error('\n\x1b[31m[错误]\x1b[0m 启动服务器失败:', err);
  process.exit(1);
});

// 处理退出
server.on('exit', (code) => {
  console.log(`\n[服务器] 已退出，退出码: ${code}`);
});

// 处理SIGINT
process.on('SIGINT', () => {
  console.log('\n[客户端] 收到中断信号，清理资源...');
  cleanupAndExit(0);
});

// 初始超时
setTimeout(() => {
  if (!isServerReady) {
    console.log('\n\x1b[31m[错误]\x1b[0m 服务器未在指定时间内就绪');
    cleanupAndExit(1);
  }
}, 10000);