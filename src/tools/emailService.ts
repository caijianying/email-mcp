#!/usr/bin/env node

import nodemailer from 'nodemailer';

export interface EmailSendParam {
  host: string;
  port: number;
  subject: string;
  to: string;
  body: string;
  from: string;
  fromPassword: string;
}

/**
 * 邮件发送服务类
 * 用于发送HTML格式的邮件
 */
export class EmailService {
    /**
     * 发送邮件方法
     * @param param 邮件发送参数
     * @returns Promise<{success: boolean, message: string}>
     */
    async sendEmail(param: EmailSendParam): Promise<{success: boolean, message: string}> {
        try {
            // 创建邮件传输器
            const transporter = nodemailer.createTransport({
                host: param.host,
                port: param.port,
                secure: true, // 使用SSL
                auth: {
                    user: param.from,
                    pass: param.fromPassword
                },
                tls: {
                    rejectUnauthorized: false // 允许使用自签名证书
                }
            });

            // 邮件选项
            const mailOptions = {
                from: param.from,
                to: param.to,
                subject: param.subject,
                html: param.body
            };

            // 发送邮件
            const info = await transporter.sendMail(mailOptions);
            
            console.log(`[${new Date().toISOString()}] 邮件发送成功！MessageID: ${info.messageId}`);
            
            return {
                success: true,
                message: `邮件发送成功，MessageID: ${info.messageId}`
            };

        } catch (error) {
            console.error(`[${new Date().toISOString()}] 邮件发送失败: ${error instanceof Error ? error.message : String(error)}`);
            
            return {
                success: false,
                message: `邮件发送失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}