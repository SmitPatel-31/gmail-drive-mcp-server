// calendarService.js - Google Calendar API operations with Meet integration
import { google } from 'googleapis';

export class CalendarService {
  constructor(auth) {
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async createMeetingWithLink(title, startTime, endTime, attendees = [], description = '') {
    try {
      const event = {
        summary: title,
        description: description,
        start: {
          dateTime: startTime,
          timeZone: 'America/New_York', // You can make this configurable
        },
        end: {
          dateTime: endTime,
          timeZone: 'America/New_York',
        },
        attendees: attendees.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`, // Unique ID for the request
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        guestsCanModify: false,
        guestsCanInviteOthers: true,
        guestsCanSeeOtherGuests: true,
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1, // Required for Meet links
        sendUpdates: 'all' // Send invites to attendees
      });

      const meetLink = response.data.conferenceData?.entryPoints?.find(
        entry => entry.entryPointType === 'video'
      )?.uri;

      return {
        success: true,
        data: {
          eventId: response.data.id,
          meetLink: meetLink,
          calendarLink: response.data.htmlLink,
          event: {
            title: response.data.summary,
            startTime: response.data.start.dateTime,
            endTime: response.data.end.dateTime,
            attendees: response.data.attendees || [],
            description: response.data.description
          },
          message: 'Meeting created successfully with Google Meet link'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to create meeting: ${error.message}`
      };
    }
  }

  async createQuickMeet(title, durationMinutes = 60, attendees = []) {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + (5 * 60 * 1000)); // Start in 5 minutes
      const endTime = new Date(startTime.getTime() + (durationMinutes * 60 * 1000));

      return await this.createMeetingWithLink(
        title,
        startTime.toISOString(),
        endTime.toISOString(),
        attendees,
        'Quick meeting created via MCP server'
      );

    } catch (error) {
      return {
        success: false,
        error: `Failed to create quick meeting: ${error.message}`
      };
    }
  }

  async createInstantMeet(title = 'Instant Meeting') {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + (2 * 60 * 1000)); // Start in 2 minutes
      const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // 1 hour duration

      return await this.createMeetingWithLink(
        title,
        startTime.toISOString(),
        endTime.toISOString(),
        [],
        'Instant meeting - join when ready'
      );

    } catch (error) {
      return {
        success: false,
        error: `Failed to create instant meeting: ${error.message}`
      };
    }
  }

  async getMeetingDetails(eventId) {
    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      const meetLink = response.data.conferenceData?.entryPoints?.find(
        entry => entry.entryPointType === 'video'
      )?.uri;

      return {
        success: true,
        data: {
          eventId: response.data.id,
          title: response.data.summary,
          startTime: response.data.start.dateTime,
          endTime: response.data.end.dateTime,
          meetLink: meetLink,
          attendees: response.data.attendees || [],
          description: response.data.description,
          status: response.data.status
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get meeting details: ${error.message}`
      };
    }
  }

  async updateMeeting(eventId, updates) {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        resource: updates
      });

      return {
        success: true,
        data: {
          eventId: response.data.id,
          message: 'Meeting updated successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to update meeting: ${error.message}`
      };
    }
  }

  async deleteMeeting(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });

      return {
        success: true,
        data: {
          eventId: eventId,
          message: 'Meeting deleted successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to delete meeting: ${error.message}`
      };
    }
  }

  async listUpcomingMeetings(maxResults = 10) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
        q: 'meet.google.com' // Only events with Meet links
      });

      const meetings = response.data.items.map(event => {
        const meetLink = event.conferenceData?.entryPoints?.find(
          entry => entry.entryPointType === 'video'
        )?.uri;

        return {
          eventId: event.id,
          title: event.summary,
          startTime: event.start.dateTime,
          endTime: event.end.dateTime,
          meetLink: meetLink,
          attendees: event.attendees || [],
          status: event.status
        };
      });

      return {
        success: true,
        data: {
          meetings: meetings,
          count: meetings.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to list meetings: ${error.message}`
      };
    }
  }
}