import { createMCPResponse, createErrorResponse } from './tool-definations.js';

export class ToolHandlers {
  constructor(gmailService, driveService, calendarService, meetIntegration) {
    this.gmailService = gmailService;
    this.driveService = driveService;
    this.calendarService = calendarService;
    this.meetIntegration = meetIntegration;
  }

  async handleToolCall(name, args) {
    switch (name) {
      // Gmail Tools
      case 'search_emails':
        return await this.handleSearchEmails(args);
      case 'get_email_content':
        return await this.handleGetEmailContent(args);
      case 'send_email':
        return await this.handleSendEmail(args);
      case 'delete_email':
        return await this.handleDeleteEmail(args);
      case 'mark_email_read':
        return await this.handleMarkEmailRead(args);
      case 'mark_email_unread':
        return await this.handleMarkEmailUnread(args);
      case 'archive_email':
        return await this.handleArchiveEmail(args);
      case 'star_email':
        return await this.handleStarEmail(args);
      case 'get_labels':
        return await this.handleGetLabels(args);
      case 'create_label':
        return await this.handleCreateLabel(args);
      case 'analyze_email_patterns':
        return await this.handleAnalyzeEmailPatterns(args);
      
      // Google Drive Tools
      case 'search_drive_files':
        return await this.handleSearchDriveFiles(args);
      case 'get_file_content':
        return await this.handleGetFileContent(args);
      case 'create_file':
        return await this.handleCreateFile(args);
      case 'update_file':
        return await this.handleUpdateFile(args);
      case 'delete_file':
        return await this.handleDeleteFile(args);
      case 'create_folder':
        return await this.handleCreateFolder(args);
      case 'copy_file':
        return await this.handleCopyFile(args);
      case 'move_file':
        return await this.handleMoveFile(args);
      case 'share_file':
        return await this.handleShareFile(args);
      case 'get_file_permissions':
        return await this.handleGetFilePermissions(args);
      
      // Google Meet & Calendar Tools
      case 'create_meeting':
        return await this.handleCreateMeeting(args);
      case 'create_quick_meet':
        return await this.handleCreateQuickMeet(args);
      case 'create_instant_meet':
        return await this.handleCreateInstantMeet(args);
      case 'create_meet_and_send':
        return await this.handleCreateMeetAndSend(args);
      case 'create_quick_meet_and_send':
        return await this.handleCreateQuickMeetAndSend(args);
      case 'create_instant_meet_and_share':
        return await this.handleCreateInstantMeetAndShare(args);
      case 'send_meet_reminder':
        return await this.handleSendMeetReminder(args);
      case 'get_meeting_details':
        return await this.handleGetMeetingDetails(args);
      case 'list_upcoming_meetings':
        return await this.handleListUpcomingMeetings(args);
      
      default:
        return createErrorResponse(`Unknown tool: ${name}`);
    }
  }

  // Gmail Handlers
  async handleSearchEmails(args) {
    const result = await this.gmailService.searchEmails(args.query, args.maxResults);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleGetEmailContent(args) {
    const result = await this.gmailService.getEmailContent(args.emailId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleSendEmail(args) {
    const result = await this.gmailService.sendEmail(args.to, args.subject, args.body);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleDeleteEmail(args) {
    const result = await this.gmailService.deleteEmail(args.emailId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleMarkEmailRead(args) {
    const result = await this.gmailService.markAsRead(args.emailId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleMarkEmailUnread(args) {
    const result = await this.gmailService.markAsUnread(args.emailId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleArchiveEmail(args) {
    const result = await this.gmailService.archiveEmail(args.emailId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleStarEmail(args) {
    const result = await this.gmailService.starEmail(args.emailId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleGetLabels(args) {
    const result = await this.gmailService.getLabels();
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleCreateLabel(args) {
    const result = await this.gmailService.createLabel(args.name, args.messageListVisibility, args.labelListVisibility);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleAnalyzeEmailPatterns(args) {
    const result = await this.gmailService.analyzeEmailPatterns(args.days);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  // Google Drive Handlers
  async handleSearchDriveFiles(args) {
    const result = await this.driveService.searchFiles(args.query, args.maxResults);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleGetFileContent(args) {
    const result = await this.driveService.getFileContent(args.fileId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleCreateFile(args) {
    const result = await this.driveService.createFile(args.name, args.content, args.mimeType, args.parentId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleUpdateFile(args) {
    const result = await this.driveService.updateFile(args.fileId, args.content, args.mimeType);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleDeleteFile(args) {
    const result = await this.driveService.deleteFile(args.fileId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleCreateFolder(args) {
    const result = await this.driveService.createFolder(args.name, args.parentId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleCopyFile(args) {
    const result = await this.driveService.copyFile(args.fileId, args.name, args.parentId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleMoveFile(args) {
    const result = await this.driveService.moveFile(args.fileId, args.newParentId, args.removeParents);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleShareFile(args) {
    const result = await this.driveService.shareFile(args.fileId, args.email, args.role, args.type);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleGetFilePermissions(args) {
    const result = await this.driveService.getFilePermissions(args.fileId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  // Google Meet & Calendar Handlers
  async handleCreateMeeting(args) {
    const result = await this.calendarService.createMeetingWithLink(
      args.title,
      args.startTime,
      args.endTime,
      args.attendees,
      args.description
    );
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleCreateQuickMeet(args) {
    const result = await this.calendarService.createQuickMeet(
      args.title,
      args.durationMinutes,
      args.attendees
    );
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleCreateInstantMeet(args) {
    const result = await this.calendarService.createInstantMeet(args.title);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleCreateMeetAndSend(args) {
    const emailData = {
      to: args.to,
      subject: args.subject,
      customMessage: args.customMessage
    };

    const meetingData = {
      title: args.meetingTitle,
      startTime: args.startTime,
      endTime: args.endTime,
      attendees: [args.to, ...args.attendees],
      description: args.customMessage
    };

    const result = await this.meetIntegration.createAndSendMeetLink(emailData, meetingData);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleCreateQuickMeetAndSend(args) {
    const result = await this.meetIntegration.createQuickMeetAndSend(
      args.to,
      args.subject,
      args.durationMinutes,
      args.customMessage
    );
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleCreateInstantMeetAndShare(args) {
    const result = await this.meetIntegration.createInstantMeetAndShare(
      args.recipients,
      args.subject,
      args.customMessage
    );
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleSendMeetReminder(args) {
    const result = await this.meetIntegration.sendMeetReminder(args.eventId, args.reminderMessage);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleGetMeetingDetails(args) {
    const result = await this.calendarService.getMeetingDetails(args.eventId);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }

  async handleListUpcomingMeetings(args) {
    const result = await this.calendarService.listUpcomingMeetings(args.maxResults);
    return result.success ? createMCPResponse(result.data) : createErrorResponse(result.error);
  }
}