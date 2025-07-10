export const toolDefinitions = [
  // Gmail Tools
  {
    name: 'search_emails',
    description: 'Search Gmail emails with query',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Gmail search query (e.g., "from:john@company.com")',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_email_content',
    description: 'Get full content of a specific email',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: {
          type: 'string',
          description: 'Gmail message ID',
        },
      },
      required: ['emailId'],
    },
  },
  {
    name: 'send_email',
    description: 'Send an email via Gmail',
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient email address',
        },
        subject: {
          type: 'string',
          description: 'Email subject',
        },
        body: {
          type: 'string',
          description: 'Email body content',
        },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'delete_email',
    description: 'Delete a specific email',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: {
          type: 'string',
          description: 'Gmail message ID to delete',
        },
      },
      required: ['emailId'],
    },
  },
  {
    name: 'mark_email_read',
    description: 'Mark an email as read',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: {
          type: 'string',
          description: 'Gmail message ID',
        },
      },
      required: ['emailId'],
    },
  },
  {
    name: 'mark_email_unread',
    description: 'Mark an email as unread',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: {
          type: 'string',
          description: 'Gmail message ID',
        },
      },
      required: ['emailId'],
    },
  },
  {
    name: 'archive_email',
    description: 'Archive an email (remove from inbox)',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: {
          type: 'string',
          description: 'Gmail message ID',
        },
      },
      required: ['emailId'],
    },
  },
  {
    name: 'star_email',
    description: 'Star an email',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: {
          type: 'string',
          description: 'Gmail message ID',
        },
      },
      required: ['emailId'],
    },
  },
  {
    name: 'get_labels',
    description: 'Get all Gmail labels',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_label',
    description: 'Create a new Gmail label',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Label name',
        },
        messageListVisibility: {
          type: 'string',
          description: 'Message list visibility (show/hide)',
          default: 'show',
        },
        labelListVisibility: {
          type: 'string',
          description: 'Label list visibility (labelShow/labelHide)',
          default: 'labelShow',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'analyze_email_patterns',
    description: 'Analyze email patterns and statistics',
    inputSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to analyze',
          default: 30,
        },
      },
    },
  },
  
  // Google Drive Tools
  {
    name: 'search_drive_files',
    description: 'Search Google Drive files',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Drive search query (e.g., "name contains \'report\'")',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_file_content',
    description: 'Get content of a Google Drive file',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'Google Drive file ID',
        },
      },
      required: ['fileId'],
    },
  },
  {
    name: 'create_file',
    description: 'Create a new file in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'File name',
        },
        content: {
          type: 'string',
          description: 'File content',
        },
        mimeType: {
          type: 'string',
          description: 'MIME type of the file',
          default: 'text/plain',
        },
        parentId: {
          type: 'string',
          description: 'Parent folder ID (optional)',
        },
      },
      required: ['name', 'content'],
    },
  },
  {
    name: 'update_file',
    description: 'Update content of an existing file',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'Google Drive file ID',
        },
        content: {
          type: 'string',
          description: 'New file content',
        },
        mimeType: {
          type: 'string',
          description: 'MIME type of the file',
          default: 'text/plain',
        },
      },
      required: ['fileId', 'content'],
    },
  },
  {
    name: 'delete_file',
    description: 'Delete a file from Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'Google Drive file ID',
        },
      },
      required: ['fileId'],
    },
  },
  {
    name: 'create_folder',
    description: 'Create a new folder in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Folder name',
        },
        parentId: {
          type: 'string',
          description: 'Parent folder ID (optional)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'copy_file',
    description: 'Copy a file in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'Source file ID',
        },
        name: {
          type: 'string',
          description: 'Name for the copied file',
        },
        parentId: {
          type: 'string',
          description: 'Parent folder ID (optional)',
        },
      },
      required: ['fileId', 'name'],
    },
  },
  {
    name: 'move_file',
    description: 'Move a file to a different folder',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'File ID to move',
        },
        newParentId: {
          type: 'string',
          description: 'New parent folder ID',
        },
        removeParents: {
          type: 'string',
          description: 'Parent IDs to remove (optional)',
        },
      },
      required: ['fileId', 'newParentId'],
    },
  },
  {
    name: 'share_file',
    description: 'Share a file with someone',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'File ID to share',
        },
        email: {
          type: 'string',
          description: 'Email address to share with',
        },
        role: {
          type: 'string',
          description: 'Permission role (reader/writer/owner)',
          default: 'reader',
        },
        type: {
          type: 'string',
          description: 'Permission type (user/group/domain/anyone)',
          default: 'user',
        },
      },
      required: ['fileId', 'email'],
    },
  },
  {
    name: 'get_file_permissions',
    description: 'Get permissions for a file',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'File ID',
        },
      },
      required: ['fileId'],
    },
  },
  
  // Google Meet & Calendar Tools
  {
    name: 'create_meeting',
    description: 'Create a Google Meet meeting and get the link',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Meeting title',
        },
        startTime: {
          type: 'string',
          description: 'Start time in ISO format (e.g., "2024-01-15T14:00:00.000Z")',
        },
        endTime: {
          type: 'string',
          description: 'End time in ISO format (e.g., "2024-01-15T15:00:00.000Z")',
        },
        attendees: {
          type: 'array',
          description: 'Array of attendee email addresses',
          items: {
            type: 'string'
          },
          default: []
        },
        description: {
          type: 'string',
          description: 'Meeting description',
          default: ''
        }
      },
      required: ['title', 'startTime', 'endTime'],
    },
  },
  {
    name: 'create_quick_meet',
    description: 'Create a quick Google Meet starting in 5 minutes',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Meeting title',
        },
        durationMinutes: {
          type: 'number',
          description: 'Meeting duration in minutes',
          default: 60
        },
        attendees: {
          type: 'array',
          description: 'Array of attendee email addresses',
          items: {
            type: 'string'
          },
          default: []
        }
      },
      required: ['title'],
    },
  },
  {
    name: 'create_instant_meet',
    description: 'Create an instant Google Meet starting in 2 minutes',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Meeting title',
          default: 'Instant Meeting'
        }
      },
    },
  },
  {
    name: 'create_meet_and_send',
    description: 'Create a Google Meet and send invitation email',
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient email address',
        },
        subject: {
          type: 'string',
          description: 'Email subject',
        },
        meetingTitle: {
          type: 'string',
          description: 'Meeting title',
        },
        startTime: {
          type: 'string',
          description: 'Start time in ISO format',
        },
        endTime: {
          type: 'string',
          description: 'End time in ISO format',
        },
        customMessage: {
          type: 'string',
          description: 'Custom message to include in email',
          default: ''
        },
        attendees: {
          type: 'array',
          description: 'Additional attendee email addresses',
          items: {
            type: 'string'
          },
          default: []
        }
      },
      required: ['to', 'subject', 'meetingTitle', 'startTime', 'endTime'],
    },
  },
  {
    name: 'create_quick_meet_and_send',
    description: 'Create a quick Google Meet and send invitation email',
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient email address',
        },
        subject: {
          type: 'string',
          description: 'Email subject and meeting title',
        },
        durationMinutes: {
          type: 'number',
          description: 'Meeting duration in minutes',
          default: 60
        },
        customMessage: {
          type: 'string',
          description: 'Custom message to include in email',
          default: ''
        }
      },
      required: ['to', 'subject'],
    },
  },
  {
    name: 'create_instant_meet_and_share',
    description: 'Create an instant Google Meet and share with multiple people',
    inputSchema: {
      type: 'object',
      properties: {
        recipients: {
          type: 'array',
          description: 'Array of recipient email addresses',
          items: {
            type: 'string'
          }
        },
        subject: {
          type: 'string',
          description: 'Email subject and meeting title',
          default: 'Join me for a quick meeting'
        },
        customMessage: {
          type: 'string',
          description: 'Custom message to include in email',
          default: ''
        }
      },
      required: ['recipients'],
    },
  },
  {
    name: 'send_meet_reminder',
    description: 'Send meeting reminder emails to attendees',
    inputSchema: {
      type: 'object',
      properties: {
        eventId: {
          type: 'string',
          description: 'Google Calendar event ID',
        },
        reminderMessage: {
          type: 'string',
          description: 'Custom reminder message',
          default: ''
        }
      },
      required: ['eventId'],
    },
  },
  {
    name: 'get_meeting_details',
    description: 'Get details of a Google Meet meeting',
    inputSchema: {
      type: 'object',
      properties: {
        eventId: {
          type: 'string',
          description: 'Google Calendar event ID',
        }
      },
      required: ['eventId'],
    },
  },
  {
    name: 'list_upcoming_meetings',
    description: 'List upcoming Google Meet meetings',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: {
          type: 'number',
          description: 'Maximum number of meetings to return',
          default: 10
        }
      },
    },
  },
];

export const createMCPResponse = (data) => ({
  content: [{
    type: 'text',
    text: JSON.stringify(data, null, 2),
  }],
});

export const createErrorResponse = (error) => ({
  content: [{
    type: 'text',
    text: error,
  }],
});