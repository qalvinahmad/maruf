## 🔧 Teacher Logout Test Guide

### Test Steps

#### 1. Set Mock Auth Data
Visit: `http://localhost:3001/debug-auth`
Click: "✅ Set Mock Teacher Auth"

#### 2. Go to Dashboard
Visit: `http://localhost:3001/dashboard/teacher/DashboardStats`
Dashboard should load with teacher header

#### 3. Test Logout
Click "Keluar" button in the header
Expected result: Should redirect to `/authentication/teacher/loginTeacher`

#### 4. Verify Complete Logout
After logout, try visiting dashboard again:
`http://localhost:3001/dashboard/teacher/DashboardStats`
Expected result: Should redirect back to login page

### Console Commands for Testing

#### Set Auth Data:
```javascript
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('isTeacher', 'true');
localStorage.setItem('teacherEmail', 'test@teacher.com');
localStorage.setItem('teacherName', 'Test Teacher');
localStorage.setItem('teacherId', '123');
localStorage.setItem('userId', '456');
localStorage.setItem('teacherInstitution', 'Test School');
```

#### Check Auth Data:
```javascript
console.log('Auth Status:', {
  isLoggedIn: localStorage.getItem('isLoggedIn'),
  isTeacher: localStorage.getItem('isTeacher'),
  teacherEmail: localStorage.getItem('teacherEmail'),
  teacherName: localStorage.getItem('teacherName')
});
```

#### Manual Logout:
```javascript
localStorage.clear();
sessionStorage.clear();
window.location.href = '/authentication/teacher/loginTeacher';
```

### Expected Flow
1. **With Auth**: Dashboard loads → Click logout → Redirect to login page
2. **After Logout**: Try dashboard → Auto redirect to login page
3. **Login Page**: Shows login form (email, password, kode guru)

### Verification Points
- [ ] Header shows "Teacher" instead of "Administrator"
- [ ] Logout button has hover effect (red background)
- [ ] Logout clears all localStorage
- [ ] Logout redirects to teacher login page
- [ ] After logout, dashboard is protected
