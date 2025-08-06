// quick-test-api.js - Test API endpoint secara cepat

async function testAPI() {
  console.log('🧪 Testing OTP API endpoint...\n');

  try {
    const response = await fetch('http://localhost:3002/api/send-otp-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: '111202013071@mhs.dinus.ac.id',
        otpCode: '1234',
        purpose: 'test_zoho',
        websiteUrl: 'https://almakruf.com'
      }),
    });

    console.log('📊 Response Status:', response.status);
    
    const result = await response.json();
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ API endpoint test successful!');
      console.log('📧 Email sent:', result.email_sent);
      console.log('🔧 Method used:', result.method_used);
      
      if (result.otp_code) {
        console.log('🔑 OTP Code (fallback):', result.otp_code);
      }
    } else {
      console.log('\n❌ API endpoint test failed');
    }

  } catch (error) {
    console.log('\n❌ API test error:', error.message);
    console.log('ℹ️  Make sure your Next.js dev server is running');
  }
}

// Jalankan test
testAPI();

console.log(`
📋 DEBUGGING STEPS:

1. ✅ File API sudah dibuat dengan export default function
2. ✅ Next.js server running di port 3001 
3. 🔄 Testing API endpoint response...

Jika masih error:
- Cek console log di terminal Next.js 
- Pastikan nodemailer terinstall: npm install nodemailer
- Setup .env.local dengan Gmail credentials
- Restart Next.js server: Ctrl+C → npm run dev

Expected Results:
✅ API responds with 200 status
✅ Email service attempts to send (even if credentials not set)
✅ Fallback methods work as expected
`);
