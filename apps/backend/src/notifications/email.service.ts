import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NotificationType } from "@event-finance-manager/database";

// Dynamic import for nodemailer
let nodemailer: any;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  console.warn("nodemailer not installed. Email notifications will not work.");
}

interface EmailOptions {
  to: string;
  name: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: any = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!nodemailer) {
      this.logger.warn("nodemailer not installed. Email notifications will be disabled.");
      return;
    }

    const smtpHost = this.configService.get<string>("SMTP_HOST");
    const smtpPort = this.configService.get<number>("SMTP_PORT", 587);
    const smtpUser = this.configService.get<string>("SMTP_USER");
    const smtpPass = this.configService.get<string>("SMTP_PASSWORD");
    const smtpFrom = this.configService.get<string>("SMTP_FROM") || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn(
        "SMTP configuration is incomplete. Email notifications will be disabled.",
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    this.logger.log("Email transporter initialized");
  }

  async sendNotificationEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.warn("Email transporter not initialized. Skipping email send.");
      return;
    }

    try {
      const htmlContent = this.generateEmailTemplate(options);
      const textContent = this.generateTextContent(options);

      await this.transporter.sendMail({
        from: this.configService.get<string>("SMTP_FROM") || this.configService.get<string>("SMTP_USER"),
        to: options.to,
        subject: options.title,
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  private generateEmailTemplate(options: EmailOptions): string {
    const { type, title, message, metadata } = options;
    const colorMap = {
      Info: "#2196F3",
      Warning: "#FF9800",
      Error: "#F44336",
      Success: "#4CAF50",
    };

    const color = colorMap[type] || "#2196F3";
    const eventName = metadata?.eventName || "";
    const eventId = metadata?.eventId || "";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: ${color}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">${title}</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px;">
    <p style="font-size: 16px; margin-bottom: 20px;">${message}</p>
    ${eventName ? `<p><strong>Event:</strong> ${eventName}</p>` : ""}
    ${metadata?.variancePercentage !== undefined
        ? `<p><strong>Variance:</strong> ${Math.abs(metadata.variancePercentage).toFixed(2)}%</p>`
        : ""}
    ${eventId
        ? `<p style="margin-top: 20px;"><a href="${this.configService.get<string>("FRONTEND_URL", "http://localhost:5173")}/events/${eventId}" style="background-color: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Event</a></p>`
        : ""}
  </div>
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>This is an automated notification from Event Finance Manager.</p>
  </div>
</body>
</html>
    `.trim();
  }

  private generateTextContent(options: EmailOptions): string {
    const { title, message, metadata } = options;
    let text = `${title}\n\n${message}\n\n`;

    if (metadata?.eventName) {
      text += `Event: ${metadata.eventName}\n`;
    }
    if (metadata?.variancePercentage !== undefined) {
      text += `Variance: ${Math.abs(metadata.variancePercentage).toFixed(2)}%\n`;
    }
    if (metadata?.eventId) {
      text += `\nView Event: ${this.configService.get<string>("FRONTEND_URL", "http://localhost:5173")}/events/${metadata.eventId}\n`;
    }

    return text;
  }
}

