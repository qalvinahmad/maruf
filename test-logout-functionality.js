console.log('🧪 Testing Teacher Logout Functionality');

// Step 1: Set mock auth data
function setMockAuth() {
  console.log('📝 Setting mock teacher auth data...');
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('isTeacher', 'true');
  localStorage.setItem('teacherEmail', 'test@teacher.com');
  localStorage.setItem('teacherName', 'Test Teacher');
  localStorage.setItem('teacherId', '123');
  localStorage.setItem('userId', '456');
  localStorage.setItem('teacherInstitution', 'Test School');
  console.log('✅ Auth data set successfully');
}

// Step 2: Check auth status
function checkAuthStatus() {
  const authData = {
    isLoggedIn: localStorage.getItem('isLoggedIn'),
    isTeacher: localStorage.getItem('isTeacher'),
    teacherEmail: localStorage.getItem('teacherEmail'),
    teacherName: localStorage.getItem('teacherName'),
    teacherId: localStorage.getItem('teacherId')
  };
  console.log('📊 Current auth status:', authData);
  return authData;
}

// Step 3: Simulate logout
function simulateLogout() {
  console.log('🚪 Simulating logout...');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('isTeacher');
  localStorage.removeItem('teacherEmail');
  localStorage.removeItem('teacherName');
  localStorage.removeItem('teacherId');
  localStorage.removeItem('userId');
  localStorage.removeItem('teacherInstitution');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  sessionStorage.clear();
  console.log('✅ All auth data cleared');
}

// Step 4: Test dashboard access
function testDashboardAccess() {
  console.log('🔒 Testing dashboard access...');
  window.location.href = '/dashboard/teacher/DashboardStats';
}

// Step 5: Test login redirect
function testLoginRedirect() {
  console.log('🔄 Testing login redirect...');
  window.location.href = '/authentication/teacher/loginTeacher';
}

// Make functions available globally
window.testLogout = {
  setMockAuth,
  checkAuthStatus,
  simulateLogout,
  testDashboardAccess,
  testLoginRedirect
};

console.log('🎯 Test functions ready! Use:');
console.log('testLogout.setMockAuth() - Set auth data');
console.log('testLogout.checkAuthStatus() - Check current auth');
console.log('testLogout.simulateLogout() - Clear all auth data');
console.log('testLogout.testDashboardAccess() - Try accessing dashboard');
console.log('testLogout.testLoginRedirect() - Go to login page');

// Auto-run basic test
console.log('\n🔄 Running basic auth check...');
checkAuthStatus();
