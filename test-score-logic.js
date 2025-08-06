// Test skor calculation logic

function testScoreCalculation() {
  console.log('🧪 Testing Score Calculation Logic');
  
  // Simulate 5 questions, all correct
  const totalQuestions = 5;
  let score = 0;
  
  // Simulate answering questions
  for (let i = 0; i < totalQuestions; i++) {
    const isCorrect = true; // All answers correct
    let currentScore = score;
    
    if (isCorrect) {
      currentScore = score + 1;
      score = currentScore; // Update score
    }
    
    console.log(`Question ${i + 1}: Correct=${isCorrect}, Score=${currentScore}/${totalQuestions}`);
    
    // If last question, calculate final score
    if (i === totalQuestions - 1) {
      const finalScore = (currentScore / totalQuestions) * 100;
      console.log(`\n🎯 Final Score: ${finalScore}% (${currentScore}/${totalQuestions})`);
      
      if (finalScore === 100) {
        console.log('✅ Expected: 100% - PASS');
      } else {
        console.log(`❌ Expected: 100%, Got: ${finalScore}% - FAIL`);
      }
    }
  }
}

testScoreCalculation();
