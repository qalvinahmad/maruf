// test-email-service.js
// Script untuk test email service dan OTP system

import { sendCustomOTPEmail, testEmailConnection } from './lib/emailService.js';

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Test 1: Connection Test
  console.log('1️⃣ Testing email connection...');
  try {
    const connectionResult = await testEmailConnection();
    if (connectionResult.success) {
      console.log('✅ Email connection successful');
    } else {
      console.log('❌ Email connection failed:', connectionResult.error);
      return;
    }
  } catch (error) {
    console.log('❌ Connection test error:', error.message);
    return;
  }

  // Test 2: Send Test OTP Email
  console.log('\n2️⃣ Testing OTP email sending...');
  try {
    const testEmail = 'test@example.com'; // Ganti dengan email test Anda
    const testOTP = '1234';
    
    const emailResult = await sendCustomOTPEmail(testEmail, testOTP, 'test');
    
    if (emailResult.success) {
      console.log('✅ Test OTP email sent successfully');
      console.log('📧 Message ID:', emailResult.messageId);
    } else {
      console.log('❌ Failed to send test email:', emailResult.error);
    }
  } catch (error) {
    console.log('❌ Email sending error:', error.message);
  }

  // Test 3: API Endpoint Test
  console.log('\n3️⃣ Testing API endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/send-otp-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        otpCode: '5678',
        purpose: 'test_api',
        websiteUrl: 'https://almakruf.com'
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API endpoint test successful');
      console.log('📊 Result:', result);
    } else {
      console.log('❌ API endpoint test failed:', response.status);
    }
  } catch (error) {
    console.log('❌ API test error:', error.message);
    console.log('ℹ️  Make sure your Next.js dev server is running on localhost:3000');
  }

  console.log('\n🏁 Email service testing completed!');
}

// Run tests
testEmailService().catch(console.error);

// Instructions for manual testing
console.log(`
📋 MANUAL TESTING INSTRUCTIONS:

1. Setup Gmail App Password:
   - Enable 2FA on your Gmail account
   - Generate App Password: Account → Security → 2-Step Verification → App passwords
   - Add to .env.local: EMAIL_USER=your-email@gmail.com & EMAIL_PASS=your-16-char-password

2. Update test email:
   - Change 'test@example.com' to your actual email address in this script

3. Run this test:
   - node test-email-service.js

4. Test in your app:
   - Start Next.js: npm run dev
   - Go to DashboardSettingsTeacher
   - Try activating 2FA to test real OTP flow

5. Check email:
   - Look for email from your configured sender
   - Email should show Mahraj Learning template, not password reset template
   - 4-digit OTP should be clearly displayed

Expected Results:
✅ Email connection successful
✅ Custom HTML template email received  
✅ OTP code displayed correctly
✅ No more "password reset" template
✅ All brand elements (logo, colors, styling) present
`);
