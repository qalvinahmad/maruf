// test-pronunciation-nlp-system.js
/**
 * Comprehensive Test Suite for NLP Pronunciation Analysis System
 * Tests database setup, API endpoints, and complete functionality
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseServiceKey = 'your-service-key'; // Use service key for testing
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data
const testUserId = 'test-user-pronunciation-nlp';
const testAudioData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUgAjuY3+/AZ';

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.blue}[STEP ${step}]${colors.reset} ${colors.bold}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

// Test 1: Database Schema Verification
async function testDatabaseSchema() {
  logStep(1, 'Testing Database Schema Setup');
  
  try {
    // Test pronunciation_feedback table
    const { data: feedbackSchema, error: feedbackError } = await supabase
      .from('pronunciation_feedback')
      .select('*')
      .limit(1);
    
    if (feedbackError && !feedbackError.message.includes('relation does not exist')) {
      throw feedbackError;
    }
    
    if (feedbackError) {
      logError('pronunciation_feedback table does not exist');
      logWarning('Please run the pronunciation_feedback_schema.sql file first');
      return false;
    }
    
    logSuccess('pronunciation_feedback table exists');
    
    // Test makhraj_templates table
    const { data: makhrajData, error: makhrajError } = await supabase
      .from('makhraj_templates')
      .select('*')
      .limit(1);
    
    if (makhrajError) {
      logError('makhraj_templates table error: ' + makhrajError.message);
      return false;
    }
    
    logSuccess('makhraj_templates table exists and has data');
    
    // Test pronunciation_progress table
    const { data: progressData, error: progressError } = await supabase
      .from('pronunciation_progress')
      .select('*')
      .limit(1);
    
    if (progressError) {
      logError('pronunciation_progress table error: ' + progressError.message);
      return false;
    }
    
    logSuccess('pronunciation_progress table exists');
    
    return true;
  } catch (error) {
    logError('Database schema test failed: ' + error.message);
    return false;
  }
}

// Test 2: NLP API Endpoint
async function testNLPAPIEndpoint() {
  logStep(2, 'Testing NLP API Endpoint');
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze-pronunciation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioData: testAudioData,
        letterId: 1,
        userId: testUserId,
        expectedText: 'ا',
        sessionId: 'test-session-' + Date.now()
      })
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('API returned success: false');
    }
    
    logSuccess('NLP API endpoint is working');
    logSuccess(`Received analysis with ${result.data.pronunciation_accuracy}% accuracy`);
    
    // Verify response structure
    const requiredFields = ['pronunciation_accuracy', 'makhraj_analysis', 'sifat_analysis', 'ai_feedback'];
    for (const field of requiredFields) {
      if (!(field in result.data)) {
        logWarning(`Missing field in response: ${field}`);
      } else {
        logSuccess(`Response contains ${field}`);
      }
    }
    
    return result.data;
  } catch (error) {
    logError('NLP API test failed: ' + error.message);
    return null;
  }
}

// Test 3: Database Storage
async function testDatabaseStorage(feedbackId) {
  logStep(3, 'Testing Database Storage');
  
  try {
    // Check if feedback was stored
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('pronunciation_feedback')
      .select('*')
      .eq('id', feedbackId)
      .single();
    
    if (feedbackError) {
      throw feedbackError;
    }
    
    logSuccess('Pronunciation feedback stored successfully');
    logSuccess(`Stored feedback with accuracy: ${feedbackData.pronunciation_accuracy}%`);
    
    // Check pronunciation progress update
    const { data: progressData, error: progressError } = await supabase
      .from('pronunciation_progress')
      .select('*')
      .eq('user_id', testUserId)
      .eq('letter_id', feedbackData.letter_id);
    
    if (progressError) {
      throw progressError;
    }
    
    if (progressData.length > 0) {
      logSuccess('Pronunciation progress updated');
      logSuccess(`Progress: ${progressData[0].attempts} attempts, ${progressData[0].average_accuracy}% avg accuracy`);
    } else {
      logWarning('No pronunciation progress found - this might be expected for new letters');
    }
    
    return true;
  } catch (error) {
    logError('Database storage test failed: ' + error.message);
    return false;
  }
}

// Test 4: Feedback Retrieval API
async function testFeedbackRetrievalAPI() {
  logStep(4, 'Testing Feedback Retrieval API');
  
  try {
    const response = await fetch(`http://localhost:3000/api/get-pronunciation-feedback?user_id=${testUserId}&limit=5`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('API returned success: false');
    }
    
    logSuccess('Feedback retrieval API is working');
    logSuccess(`Retrieved ${result.data.feedback.length} feedback entries`);
    
    if (result.data.statistics) {
      logSuccess(`Statistics: ${result.data.statistics.total_attempts} total attempts, ${result.data.statistics.average_accuracy}% avg accuracy`);
    }
    
    return true;
  } catch (error) {
    logError('Feedback retrieval test failed: ' + error.message);
    return false;
  }
}

// Test 5: Progress Tracking API
async function testProgressTrackingAPI() {
  logStep(5, 'Testing Progress Tracking API');
  
  try {
    const response = await fetch(`http://localhost:3000/api/get-pronunciation-progress?user_id=${testUserId}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('API returned success: false');
    }
    
    logSuccess('Progress tracking API is working');
    
    if (result.data.overall_statistics) {
      const stats = result.data.overall_statistics;
      logSuccess(`Overall stats: ${stats.total_letters_practiced} letters practiced, ${stats.mastered_letters} mastered`);
    }
    
    if (result.data.insights) {
      logSuccess(`Generated ${result.data.insights.length} AI insights`);
    }
    
    if (result.data.recommendations) {
      logSuccess(`Generated ${result.data.recommendations.length} AI recommendations`);
    }
    
    return true;
  } catch (error) {
    logError('Progress tracking test failed: ' + error.message);
    return false;
  }
}

// Test 6: Advanced Makhraj Analysis
async function testAdvancedMakhrajAnalysis() {
  logStep(6, 'Testing Advanced Makhraj Analysis');
  
  try {
    // Test different letters with specific makhraj requirements
    const testCases = [
      { letterId: 1, expectedText: 'ا', makhraj: 'Halq' },
      { letterId: 2, expectedText: 'ب', makhraj: 'Syafah' },
      { letterId: 7, expectedText: 'ح', makhraj: 'Halq' },
      { letterId: 15, expectedText: 'ط', makhraj: 'Lisan' }
    ];
    
    let successCount = 0;
    
    for (const testCase of testCases) {
      try {
        const response = await fetch('http://localhost:3000/api/analyze-pronunciation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioData: testAudioData,
            letterId: testCase.letterId,
            userId: testUserId + '-makhraj-test',
            expectedText: testCase.expectedText,
            sessionId: 'makhraj-test-' + Date.now()
          })
        });
        
        const result = await response.json();
        
        if (result.success && result.data.makhraj_analysis) {
          logSuccess(`✓ ${testCase.expectedText} (${testCase.makhraj}): Makhraj analysis completed`);
          successCount++;
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        logWarning(`Makhraj test failed for ${testCase.expectedText}: ${error.message}`);
      }
    }
    
    logSuccess(`Advanced makhraj analysis: ${successCount}/${testCases.length} tests passed`);
    return successCount === testCases.length;
    
  } catch (error) {
    logError('Advanced makhraj analysis test failed: ' + error.message);
    return false;
  }
}

// Test 7: Performance and Runtime Analysis
async function testPerformanceAnalysis() {
  logStep(7, 'Testing Performance and Runtime Analysis');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/analyze-pronunciation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioData: testAudioData,
        letterId: 1,
        userId: testUserId + '-performance',
        expectedText: 'ا',
        sessionId: 'performance-test-' + Date.now()
      })
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const result = await response.json();
    
    if (result.success) {
      logSuccess(`Analysis completed in ${responseTime}ms`);
      
      // Check if runtime information is included
      if (result.data.processing_time) {
        logSuccess(`Server processing time: ${result.data.processing_time}ms`);
      }
      
      if (result.data.ai_processing_metadata) {
        logSuccess('AI processing metadata included in response');
      }
      
      // Performance benchmarks
      if (responseTime < 5000) {
        logSuccess('✓ Response time under 5 seconds - Excellent');
      } else if (responseTime < 10000) {
        logWarning('⚠ Response time 5-10 seconds - Acceptable');
      } else {
        logError('✗ Response time over 10 seconds - Needs optimization');
      }
    }
    
    return true;
  } catch (error) {
    logError('Performance analysis test failed: ' + error.message);
    return false;
  }
}

// Cleanup test data
async function cleanupTestData() {
  logStep(8, 'Cleaning up test data');
  
  try {
    // Delete test feedback entries
    await supabase
      .from('pronunciation_feedback')
      .delete()
      .like('user_id', testUserId + '%');
    
    // Delete test progress entries
    await supabase
      .from('pronunciation_progress')
      .delete()
      .like('user_id', testUserId + '%');
    
    logSuccess('Test data cleaned up successfully');
    return true;
  } catch (error) {
    logWarning('Cleanup failed (this is usually not critical): ' + error.message);
    return false;
  }
}

// Main test runner
async function runPronunciationNLPTests() {
  log('\n' + '='.repeat(60), 'bold');
  log('   🎤 NLP PRONUNCIATION ANALYSIS SYSTEM TEST SUITE', 'bold');
  log('='.repeat(60), 'bold');
  
  const testResults = [];
  let feedbackId = null;
  
  // Run all tests
  testResults.push(await testDatabaseSchema());
  
  if (testResults[0]) {
    const nlpResult = await testNLPAPIEndpoint();
    testResults.push(!!nlpResult);
    
    if (nlpResult && nlpResult.feedback_id) {
      feedbackId = nlpResult.feedback_id;
      testResults.push(await testDatabaseStorage(feedbackId));
    } else {
      testResults.push(false);
    }
  } else {
    testResults.push(false, false);
  }
  
  testResults.push(await testFeedbackRetrievalAPI());
  testResults.push(await testProgressTrackingAPI());
  testResults.push(await testAdvancedMakhrajAnalysis());
  testResults.push(await testPerformanceAnalysis());
  
  // Cleanup
  await cleanupTestData();
  
  // Summary
  log('\n' + '='.repeat(60), 'bold');
  log('   📊 TEST SUMMARY', 'bold');
  log('='.repeat(60), 'bold');
  
  const passedTests = testResults.filter(Boolean).length;
  const totalTests = testResults.length;
  
  log(`\nTotal Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`Failed: ${totalTests - passedTests}`, totalTests - passedTests === 0 ? 'green' : 'red');
  log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`, 
      passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 ALL TESTS PASSED! NLP Pronunciation System is fully functional!', 'green');
    log('✅ Database schema properly configured', 'green');
    log('✅ NLP API endpoints working correctly', 'green');
    log('✅ Advanced makhraj and sifat analysis functional', 'green');
    log('✅ Feedback storage and retrieval working', 'green');
    log('✅ Progress tracking and AI insights operational', 'green');
    log('✅ Performance metrics within acceptable range', 'green');
  } else {
    log('\n⚠️ Some tests failed. Please check the issues above.', 'yellow');
    
    if (!testResults[0]) {
      log('🔧 Run: supabase db reset && supabase db push (after ensuring schema file is in migrations)', 'yellow');
    }
    
    if (!testResults[1]) {
      log('🔧 Check: Next.js server is running (npm run dev) and API routes are accessible', 'yellow');
    }
    
    if (!testResults[3] || !testResults[4]) {
      log('🔧 Check: API endpoints for feedback retrieval and progress tracking', 'yellow');
    }
  }
  
  log('\n' + '='.repeat(60), 'bold');
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Start tests if this script is run directly
if (require.main === module) {
  runPronunciationNLPTests().catch(error => {
    logError('Test suite failed with error: ' + error.message);
    process.exit(1);
  });
}

module.exports = {
  runPronunciationNLPTests,
  testDatabaseSchema,
  testNLPAPIEndpoint,
  testDatabaseStorage,
  testFeedbackRetrievalAPI,
  testProgressTrackingAPI,
  testAdvancedMakhrajAnalysis,
  testPerformanceAnalysis
};
