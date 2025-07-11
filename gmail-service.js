// gmailService.js - Gmail API operations
import { google } from 'googleapis';

export class GmailService {
  constructor(auth) {
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async searchEmails(query, maxResults = 10) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults,
      });

      const messages = response.data.messages || [];
      const emailDetails = [];

      for (const message of messages) {
        const email = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        const headers = email.data.payload.headers;
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const date = headers.find(h => h.name === 'Date')?.value || 'Unknown';

        emailDetails.push({
          id: message.id,
          from,
          subject,
          date,
          snippet: email.data.snippet,
        });
      }

      return {
        success: true,
        data: {
          totalResults: response.data.resultSizeEstimate,
          emails: emailDetails,
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Gmail search failed: ${error.message}`
      };
    }
  }

  async getEmailContent(emailId) {
    try {
      const email = await this.gmail.users.messages.get({
        userId: 'me',
        id: emailId,
        format: 'full',
      });

      const headers = email.data.payload.headers;
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const date = headers.find(h => h.name === 'Date')?.value || 'Unknown';

      // Extract body (simplified - handle multipart messages properly in production)
      let body = '';
      if (email.data.payload.body?.data) {
        body = Buffer.from(email.data.payload.body.data, 'base64').toString();
      } else if (email.data.payload.parts) {
        const textPart = email.data.payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
        }
      }

      return {
        success: true,
        data: {
          id: emailId,
          from,
          subject,
          date,
          body,
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get email content: ${error.message}`
      };
    }
  }

  async analyzeEmailPatterns(days = 30) {
    try {
      const query = `newer_than:${days}d`;
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 1000,
      });

      const messages = response.data.messages || [];
      const senders = {};
      const hourlyPattern = new Array(24).fill(0);

      for (const message of messages.slice(0, 100)) { // Limit for demo
        const email = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Date'],
        });

        const headers = email.data.payload.headers;
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
        const date = headers.find(h => h.name === 'Date')?.value;

        // Count senders
        senders[from] = (senders[from] || 0) + 1;

        // Analyze time patterns
        if (date) {
          const hour = new Date(date).getHours();
          hourlyPattern[hour]++;
        }
      }

      const topSenders = Object.entries(senders)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([sender, count]) => ({ sender, count }));

      return {
        success: true,
        data: {
          totalEmails: messages.length,
          analyzedEmails: Math.min(100, messages.length),
          topSenders,
          hourlyPattern,
          busiestHour: hourlyPattern.indexOf(Math.max(...hourlyPattern)),
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Email analysis failed: ${error.message}`
      };
    }
  }

  async sendEmail(to, subject, body, attachments = []) {
    try {
      // Create email message
      const messageParts = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=utf-8',
        '',
        body
      ];

      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return {
        success: true,
        data: {
          messageId: response.data.id,
          threadId: response.data.threadId,
          message: 'Email sent successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to send email: ${error.message}`
      };
    }
  }

  async deleteEmail(emailId) {
    try {
      await this.gmail.users.messages.delete({
        userId: 'me',
        id: emailId,
      });

      return {
        success: true,
        data: {
          messageId: emailId,
          message: 'Email deleted successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to delete email: ${error.message}`
      };
    }
  }

  async markAsRead(emailId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: emailId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });

      return {
        success: true,
        data: {
          messageId: emailId,
          message: 'Email marked as read'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to mark email as read: ${error.message}`
      };
    }
  }

  async markAsUnread(emailId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: emailId,
        requestBody: {
          addLabelIds: ['UNREAD']
        }
      });

      return {
        success: true,
        data: {
          messageId: emailId,
          message: 'Email marked as unread'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to mark email as unread: ${error.message}`
      };
    }
  }

  async archiveEmail(emailId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: emailId,
        requestBody: {
          removeLabelIds: ['INBOX']
        }
      });

      return {
        success: true,
        data: {
          messageId: emailId,
          message: 'Email archived successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to archive email: ${error.message}`
      };
    }
  }

  async starEmail(emailId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: emailId,
        requestBody: {
          addLabelIds: ['STARRED']
        }
      });

      return {
        success: true,
        data: {
          messageId: emailId,
          message: 'Email starred successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to star email: ${error.message}`
      };
    }
  }

  async getLabels() {
    try {
      const response = await this.gmail.users.labels.list({
        userId: 'me'
      });

      return {
        success: true,
        data: {
          labels: response.data.labels
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get labels: ${error.message}`
      };
    }
  }

  async createLabel(name, messageListVisibility = 'show', labelListVisibility = 'labelShow') {
    try {
      const response = await this.gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: name,
          messageListVisibility: messageListVisibility,
          labelListVisibility: labelListVisibility
        }
      });

      return {
        success: true,
        data: {
          label: response.data,
          message: 'Label created successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to create label: ${error.message}`
      };
    }
  }
}