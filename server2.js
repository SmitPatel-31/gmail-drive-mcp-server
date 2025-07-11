// server.js - Main MCP server using components
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';

import { AuthManager } from './auth-server.js';
import { GmailService } from './gmail-service.js';
import { DriveService } from './drive-service.js';
import { CalendarService } from './calendar-service.js';
import { MeetIntegration } from './meet-integration.js';
import { ToolHandlers } from './tool-handlers.js';
import { toolDefinitions, createErrorResponse } from './tool-definations.js';

class GmailDriveMCPServer {
  constructor() {
    this.server = new Server({
      name: 'gmail-drive-mcp-server',
      version: '2.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.authManager = new AuthManager();
    this.gmailService = null;
    this.driveService = null;
    this.calendarService = null;
    this.meetIntegration = null;
    this.toolHandlers = null;
    
    this.setupRequestHandlers();
  }

  async initializeServices() {
    if (this.authManager.isReady()) {
      return true;
    }

    const authResult = await this.authManager.initialize();
    if (!authResult.success) {
      return false;
    }

    // Initialize services with authenticated client
    this.gmailService = new GmailService(authResult.auth);
    this.driveService = new DriveService(authResult.auth);
    this.calendarService = new CalendarService(authResult.auth);
    this.meetIntegration = new MeetIntegration(this.gmailService, this.calendarService);
    this.toolHandlers = new ToolHandlers(
      this.gmailService, 
      this.driveService, 
      this.calendarService,
      this.meetIntegration
    );

    return true;
  }

  setupRequestHandlers() {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolDefinitions,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        
        // Initialize services if not already done
        const isInitialized = await this.initializeServices();
        if (!isInitialized) {
          return createErrorResponse(
            'Authentication failed.'
          );
        }

        // Delegate to tool handlers
        return await this.toolHandlers.handleToolCall(name, args);

      } catch (error) {
        return createErrorResponse(`Error: ${error.message}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Initialize services on startup
    await this.initializeServices();
  }
}

// Run the server
const server = new GmailDriveMCPServer();
server.run().catch(() => {
});