# Profile Data Persistence Test

## Test Steps to Verify Student Profile Information Persistence

### Step 1: Student Profile Update Test
1. **Login as a Student**
   - Go to your app and login with student credentials
   - Navigate to your profile (click on profile icon in header)

2. **Fill Out Complete Profile Information**
   - Full Name: Enter your complete name
   - Email: Enter your email address  
   - Phone: Enter your phone number
   - University: Enter your university name
   - Course: Enter your course/major
   - Year: Select your year of study
   - Bio: Add a description about yourself
   - Skills: Add relevant skills (programming languages, etc.)

3. **Save Profile**
   - Click "Save Changes" button
   - You should see "Profile updated successfully!" message

### Step 2: Re-login Test
1. **Logout and Login Again**
   - Logout from the app
   - Login again with same student credentials
   - Go to your profile view
   - **Verify**: All the information you entered should still be there

### Step 3: Company Dashboard Test
1. **Login as Company**
   - Logout from student account
   - Login with company/admin credentials
   - Navigate to Company Dashboard

2. **Submit an Idea as Student** (if needed)
   - First make sure there's a problem posted by the company
   - Login as student and submit an idea for that problem

3. **View Ideas in Company Dashboard**
   - Login back as company
   - Click "View Ideas" for the problem
   - **Verify**: The student profile card should show all the information:
     - Student name (not just username)
     - Email address
     - Phone number
     - University
     - Course
     - Year
     - Bio and skills

### Step 4: Refresh Test
1. **Update Profile Again**
   - Login as student and modify some profile fields
   - Save changes

2. **Check Company View**
   - Login as company
   - View the ideas again
   - Click the "Refresh Ideas" button
   - **Verify**: Updated profile information should appear

## What Should Work
- ✅ Backend User model has all necessary fields (name, email, phone, university, course, year, bio, skills)
- ✅ Profile update route properly saves all fields to database
- ✅ Idea routes populate complete student profile data
- ✅ Company dashboard displays comprehensive student information
- ✅ Profile information persists after re-login

## If Information Doesn't Persist
1. Check browser console for any error messages
2. Check if profile update API call is successful (Network tab in DevTools)
3. Use the "Refresh Ideas" button in company dashboard
4. Try the test in an incognito/private browser window

## Backend API Endpoints Involved
- `PUT /api/users/profile` - Updates student profile
- `GET /api/users/profile` - Gets current user profile  
- `GET /api/ideas/problem/:id` - Gets ideas with populated student data

The system is designed to persist all profile information and display it properly in the company dashboard when viewing student ideas.
