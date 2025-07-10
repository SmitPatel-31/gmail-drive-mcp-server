// auth.js - Fixed version
import { google } from 'googleapis';
import fs from 'fs';
import readline from 'readline';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];

async function authorize() {
  try {
    // Check if credentials file exists
    if (!fs.existsSync('credentials.json')) {
      console.error('credentials.json not found!');
      return;
    }

    // Load credentials
    const credentialsData = fs.readFileSync('credentials.json', 'utf8');
    const credentials = JSON.parse(credentialsData);
    
    // Handle both web and installed application types
    let clientConfig;
    if (credentials.web) {
      clientConfig = credentials.web;
      console.log('web application credentials');
    } else if (credentials.installed) {
      clientConfig = credentials.installed;
      console.log('Using installed application credentials');
    } else {
      console.error('Invalid credentials format!');
      
      return;
    }
    
    const { client_secret, client_id, redirect_uris } = clientConfig;
    
    if (!client_id || !client_secret) {
      console.error('Missing client_id or client_secret in credentials');
      return;
    }
    
    // Use appropriate redirect URI
    const redirectUri = redirect_uris ? redirect_uris[0] : 'http://localhost:3000/oauth2callback';
    console.log('Using redirect URI:', redirectUri);
    
    const oAuth2Client = new google.auth.OAuth2(
      client_id, 
      client_secret, 
      redirectUri
    );

    // Check if we have previously stored a token
    try {
      const tokenData = fs.readFileSync('token.json', 'utf8');
      const token = JSON.parse(tokenData);
      
      oAuth2Client.setCredentials(token);
      
      // Test the token
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
      await gmail.users.getProfile({ userId: 'me' });
      
      console.log('token is valid!');
      return;
      
    } catch (error) {
      console.log('No token found.Starting OAuth flow...');
    }

    // Generate auth URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent' // Force consent screen to get refresh token
    });

    console.log('\nURL:');
    console.log(authUrl);

    // Get auth code from user
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise((resolve) => {
      rl.question('\n Enter the authorization code from the browser: ', (code) => {
        rl.close();
        resolve(code.trim());
      });
    });

    if (!code) {
      console.error('No authorization code provided');
      return;
    }

    // Exchange code for token
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      // Store token
      fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
      
      console.log('Token stored successfully!');
      
      // Test the authentication
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      console.log('Connected to Gmail:', profile.data.emailAddress);
      
    } catch (error) {
      console.error('Failed to exchange authorization code:', error.message);
      
      if (error.message.includes('redirect_uri_mismatch')) {
        console.log('\n Redirect URI mismatch!');
        console.log('   ', redirectUri);
      }
    }

  } catch (error) {
    console.error('Authentication failed:', error.message);
  }
}

authorize();