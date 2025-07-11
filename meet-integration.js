// meetIntegration.js - Integration service for Meet + Gmail workflows
export class MeetIntegration {
  constructor(gmailService, calendarService) {
    this.gmailService = gmailService;
    this.calendarService = calendarService;
  }

  async createAndSendMeetLink(emailData, meetingData) {
    try {
      // Create the meeting with Google Meet link
      const meetingResult = await this.calendarService.createMeetingWithLink(
        meetingData.title,
        meetingData.startTime,
        meetingData.endTime,
        meetingData.attendees,
        meetingData.description
      );

      if (!meetingResult.success) {
        return {
          success: false,
          error: `Failed to create meeting: ${meetingResult.error}`
        };
      }

      // Format the email with meeting details
      const emailBody = this.formatMeetingEmail(meetingResult.data, emailData.customMessage);

      // Send the email
      const emailResult = await this.gmailService.sendEmail(
        emailData.to,
        emailData.subject,
        emailBody
      );

      if (!emailResult.success) {
        return {
          success: false,
          error: `Meeting created but failed to send email: ${emailResult.error}`,
          meetingData: meetingResult.data
        };
      }

      return {
        success: true,
        data: {
          meeting: meetingResult.data,
          email: emailResult.data,
          message: 'Meeting created and email sent successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Meet integration failed: ${error.message}`
      };
    }
  }

  async createQuickMeetAndSend(to, subject, durationMinutes = 60, customMessage = '') {
    try {
      // Create instant meeting
      const meetingResult = await this.calendarService.createQuickMeet(
        subject,
        durationMinutes,
        [to]
      );

      if (!meetingResult.success) {
        return meetingResult;
      }

      // Send email with meeting link
      const emailBody = this.formatQuickMeetEmail(meetingResult.data, customMessage);

      const emailResult = await this.gmailService.sendEmail(
        to,
        subject,
        emailBody
      );

      if (!emailResult.success) {
        return {
          success: false,
          error: `Meeting created but failed to send email: ${emailResult.error}`,
          meetingData: meetingResult.data
        };
      }

      return {
        success: true,
        data: {
          meeting: meetingResult.data,
          email: emailResult.data,
          message: 'Quick meeting created and invitation sent'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Quick meet creation failed: ${error.message}`
      };
    }
  }

  async createInstantMeetAndShare(recipients, subject = 'Join me for a quick meeting', customMessage = '') {
    try {
      // Create instant meeting
      const meetingResult = await this.calendarService.createInstantMeet(subject);

      if (!meetingResult.success) {
        return meetingResult;
      }

      // Send to multiple recipients
      const emailResults = [];
      for (const recipient of recipients) {
        const emailBody = this.formatInstantMeetEmail(meetingResult.data, customMessage);
        
        const emailResult = await this.gmailService.sendEmail(
          recipient,
          subject,
          emailBody
        );

        emailResults.push({
          recipient: recipient,
          success: emailResult.success,
          error: emailResult.error
        });
      }

      return {
        success: true,
        data: {
          meeting: meetingResult.data,
          emailResults: emailResults,
          message: 'Instant meeting created and invitations sent'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Instant meet sharing failed: ${error.message}`
      };
    }
  }

  formatMeetingEmail(meetingData, customMessage = '') {
    const startTime = new Date(meetingData.event.startTime);
    const endTime = new Date(meetingData.event.endTime);
    
    return `
${customMessage ? customMessage + '\n\n' : ''}Meeting Details:
📅 ${meetingData.event.title}
🕐 ${startTime.toLocaleString()} - ${endTime.toLocaleString()}

🎥 Join Google Meet:
${meetingData.meetLink}

📋 Calendar Event:
${meetingData.calendarLink}

${meetingData.event.description ? '\nDescription:\n' + meetingData.event.description : ''}

---
This meeting was created automatically via MCP server.
`.trim();
  }

  formatQuickMeetEmail(meetingData, customMessage = '') {
    const startTime = new Date(meetingData.event.startTime);
    
    return `
${customMessage ? customMessage + '\n\n' : ''}Hi! I've set up a quick meeting for us.

📅 ${meetingData.event.title}
🕐 Starting at: ${startTime.toLocaleString()}

🎥 Join the meeting:
${meetingData.meetLink}

The meeting starts in a few minutes. See you there!

---
Quick meeting created via MCP server.
`.trim();
  }

  formatInstantMeetEmail(meetingData, customMessage = '') {
    return `
${customMessage ? customMessage + '\n\n' : ''}Join me for a quick meeting right now!

🎥 Click here to join:
${meetingData.meetLink}

📅 Meeting: ${meetingData.event.title}

I'll be waiting in the meeting room. Join when you're ready!

---
Instant meeting created via MCP server.
`.trim();
  }

  async sendMeetReminder(eventId, reminderMessage = '') {
    try {
      // Get meeting details
      const meetingResult = await this.calendarService.getMeetingDetails(eventId);
      
      if (!meetingResult.success) {
        return meetingResult;
      }

      const meeting = meetingResult.data;
      const startTime = new Date(meeting.startTime);
      const now = new Date();
      const timeUntilMeeting = Math.round((startTime - now) / (1000 * 60)); // minutes

      // Send reminder to all attendees
      const emailResults = [];
      for (const attendee of meeting.attendees) {
        const emailBody = `
${reminderMessage ? reminderMessage + '\n\n' : ''}Reminder: Meeting starting ${timeUntilMeeting > 0 ? `in ${timeUntilMeeting} minutes` : 'now'}!

📅 ${meeting.title}
🕐 ${startTime.toLocaleString()}

🎥 Join Google Meet:
${meeting.meetLink}

See you there!

---
Reminder sent via MCP server.
`.trim();

        const emailResult = await this.gmailService.sendEmail(
          attendee.email,
          `Reminder: ${meeting.title}`,
          emailBody
        );

        emailResults.push({
          recipient: attendee.email,
          success: emailResult.success,
          error: emailResult.error
        });
      }

      return {
        success: true,
        data: {
          meeting: meeting,
          emailResults: emailResults,
          message: 'Meeting reminders sent'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to send reminder: ${error.message}`
      };
    }
  }
}