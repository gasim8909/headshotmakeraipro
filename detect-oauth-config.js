// A simple script to detect OAuth configuration issues
const fetch = require('node-fetch');

// Get Supabase URL from arguments or environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SUPABASE_URL) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is not set');
  console.log('Please set this in your .env.local file');
  process.exit(1);
}

async function checkOAuthSettings() {
  try {
    console.log(`Checking OAuth settings for: ${SUPABASE_URL}`);
    console.log('--------------------------------------------------');
    
    // Make a request to the public settings endpoint
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Error retrieving settings: ${response.status} ${response.statusText}`);
      return;
    }
    
    const settings = await response.json();
    
    // Check for external providers
    console.log('OAuth Providers Status:');
    
    const externalProviders = settings?.external || {};
    const hasGoogleConfig = !!externalProviders.google?.enabled;
    
    if (Object.keys(externalProviders).length === 0) {
      console.log('❌ No OAuth providers are configured');
    } else {
      Object.keys(externalProviders).forEach(provider => {
        const status = externalProviders[provider]?.enabled ? '✅' : '❌';
        console.log(`${status} ${provider[0].toUpperCase() + provider.slice(1)}`);
      });
    }
    
    // Specific Google OAuth advice
    if (!hasGoogleConfig) {
      console.log('\n❌ Google OAuth is not configured or enabled');
      console.log('\nTo configure Google OAuth in Supabase:');
      console.log('1. Login to your Supabase dashboard');
      console.log('2. Navigate to Authentication > Providers');
      console.log('3. Enable Google and fill in your Google OAuth credentials');
      console.log('4. Ensure the redirect URL is set to:');
      console.log(`   ${SUPABASE_URL}/auth/v1/callback`);
      console.log('\nYou\'ll need to create OAuth credentials in Google Cloud Console:');
      console.log('1. Go to https://console.cloud.google.com/');
      console.log('2. Create a project or select an existing one');
      console.log('3. Navigate to APIs & Services > Credentials');
      console.log('4. Click "Create Credentials" > "OAuth client ID"');
      console.log('5. Add the Supabase callback URL to authorized redirect URIs');
    } else {
      console.log('\n✅ Google OAuth appears to be configured correctly');
    }
    
    console.log('\nRedirect URL format check:');
    if (settings?.redirect_urls && Array.isArray(settings.redirect_urls)) {
      if (settings.redirect_urls.length === 0) {
        console.log('❌ No redirect URLs are configured');
      } else {
        settings.redirect_urls.forEach(url => {
          console.log(`- ${url}`);
        });
        
        // Check for localhost
        const hasLocalhost = settings.redirect_urls.some(url => url.includes('localhost'));
        if (hasLocalhost) {
          console.log('✅ Localhost redirect URLs are configured');
        } else if (process.env.NODE_ENV !== 'production') {
          console.log('❌ No localhost redirect URLs found, which may cause issues in development');
        }
      }
    } else {
      console.log('❓ Could not determine redirect URL configuration');
    }
    
  } catch (error) {
    console.error('Error checking OAuth configuration:', error.message);
  }
}

checkOAuthSettings();
