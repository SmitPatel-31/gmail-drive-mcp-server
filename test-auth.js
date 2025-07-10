// test-auth.js
import { google } from 'googleapis';
import fs from 'fs';

async function testAuthentication() {
  try {
    console.log('Testing Gmail & Drive authentication...');
    
    // Load credentials
    if (!fs.existsSync('credentials.json')) {
      console.error('❌ credentials.json not found');
      return;
    }
    
    if (!fs.existsSync('token.json')) {
      console.error('❌ token.json not found');
      console.log('Run: node complete-auth.js');
      return;
    }
    
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const token = JSON.parse(fs.readFileSync('token.json'));
    
    console.log('✅ Files loaded successfully');
    
    // Create auth client
    const { client_secret, client_id ,redirect_uris} = credentials.web;
    const auth = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    
    auth.setCredentials(token);
    
    // Test Gmail API
    console.log('\n📧 Testing Gmail API...');
    const gmail = google.gmail({ version: 'v1', auth });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    
    console.log(`✅ Gmail: ${profile.data.emailAddress}`);
    console.log(`📊 Total messages: ${profile.data.messagesTotal}`);
    console.log(`📩 Unread messages: ${profile.data.messagesTotal - profile.data.threadsTotal}`);
    
    // Test Drive API
    console.log('\n💾 Testing Drive API...');
    const drive = google.drive({ version: 'v3', auth });
    const files = await drive.files.list({
      pageSize: 5,
      fields: 'files(id, name, mimeType)'
    });
    
    console.log(`✅ Drive: Found ${files.data.files.length} files`);
    files.data.files.forEach(file => {
      console.log(`📁 ${file.name} (${file.mimeType})`);
    });
    
    // Test a simple email search
    console.log('\n🔍 Testing email search...');
    const messages = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 3,
      q: 'in:inbox'
    });
    
    console.log(`✅ Found ${messages.data.messages?.length || 0} inbox messages`);
    
    console.log('\n🎉 All tests passed! Authentication is working.');
    console.log('Your MCP server should work now.');
    
  } catch (error) {
    console.error('\n❌ Authentication test failed:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\nToken expired. Run: node complete-auth.js');
    } else if (error.message.includes('insufficient authentication')) {
      console.log('\nAuthentication scope issue. Run: node complete-auth.js');
    } else if (error.message.includes('Unauthorized')) {
      console.log('\nToken invalid. Run: node complete-auth.js');
    }
  }
}

testAuthentication();