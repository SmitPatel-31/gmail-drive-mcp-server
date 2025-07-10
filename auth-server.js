// auth.js - Authentication management
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AuthManager {
  constructor() {
    this.auth = null;
    this.isAuthenticated = false;
    this.credentialsPath = path.join(__dirname, 'credentials.json');
    this.tokenPath = path.join(__dirname, 'token.json');
  }

  async initialize() {
    if (this.isAuthenticated) {
      return { success: true, auth: this.auth };
    }

    try {
      const credentials = await this.loadCredentials();
      if (!credentials) {
        return { success: false, error: 'Failed to load credentials' };
      }

      const clientConfig = this.getClientConfig(credentials);
      if (!clientConfig) {
        return { success: false, error: 'Invalid credentials format' };
      }

      this.auth = this.createOAuth2Client(clientConfig);

      const token = await this.loadToken();
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      this.auth.setCredentials(token);

      const testResult = await this.testAuthentication();
      if (!testResult.success) {
        const refreshResult = await this.refreshToken(token);
        if (!refreshResult.success) {
          return { success: false, error: 'Authentication failed' };
        }
      }

      this.isAuthenticated = true;
      return { success: true, auth: this.auth };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loadCredentials() {
    try {
      if (!fs.existsSync(this.credentialsPath)) {
        return null;
      }

      const credentialsData = fs.readFileSync(this.credentialsPath, 'utf8');
      return JSON.parse(credentialsData);
    } catch (error) {
      return null;
    }
  }

  getClientConfig(credentials) {
    if (credentials.web) {
      return credentials.web;
    } else if (credentials.installed) {
      return credentials.installed;
    }
    return null;
  }

  createOAuth2Client(clientConfig) {
    const { client_secret, client_id, redirect_uris } = clientConfig;
    
    if (!client_id || !client_secret) {
      throw new Error('Missing client credentials');
    }

    const redirectUri = redirect_uris ? redirect_uris[0] : 'http://localhost:3000/oauth2callback';
    return new google.auth.OAuth2(client_id, client_secret, redirectUri);
  }

  async loadToken() {
    try {
      if (!fs.existsSync(this.tokenPath)) {
        return null;
      }

      const tokenData = fs.readFileSync(this.tokenPath, 'utf8');
      const token = JSON.parse(tokenData);
      
      if (!token.access_token) {
        return null;
      }

      return token;
    } catch (error) {
      return null;
    }
  }

  async testAuthentication() {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.auth });
      await gmail.users.getProfile({ userId: 'me' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async refreshToken(token) {
    try {
      if (!token.refresh_token) {
        return { success: false, error: 'No refresh token available' };
      }

      const { credentials } = await this.auth.refreshAccessToken();
      this.auth.setCredentials(credentials);

      // Save refreshed token
      fs.writeFileSync(this.tokenPath, JSON.stringify(credentials));

      // Test again
      const testResult = await this.testAuthentication();
      return testResult;

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getAuth() {
    return this.auth;
  }

  isReady() {
    return this.isAuthenticated;
  }
}