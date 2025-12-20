# Client-Side Role-Based Redirection

## Overview
Implemented client-side checks to redirect users based on their role when they visit public pages like the home page or login page while already logged in.

## What Was Changed

### 1. **Home Page (`src/app/page.tsx`)**

#### Changes Made:
- Added `useEffect` hook to check for active session
- Imported `user` from `useAuth()` hook
- Added redirect logic based on user role

#### Implementation:
```typescript
const { user, isLoading } = useAuth()

// Client-side redirect based on user role if session exists
useEffect(() => {
  if (!isLoading && user) {
    // User is logged in, redirect based on role
    if (user.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (user.role === 'FIELD_WORKER') {
      router.push('/user/workflow')
    }
  }
}, [user, isLoading, router])
```

#### Behavior:
- **Not logged in**: Shows the landing page with login button
- **Logged in as ADMIN**: Redirects to `/admin/dashboard`
- **Logged in as FIELD_WORKER**: Redirects to `/user/workflow`

---

### 2. **Login Page (`src/components/login-form.tsx`)**

#### Changes Made:
- Added `useEffect` hook to check for active session
- Imported `useRouter` from Next.js navigation
- Got `user` and `authLoading` from `useAuth()` hook
- Added redirect logic for already logged-in users

#### Implementation:
```typescript
const router = useRouter()
const { login, user, isLoading: authLoading } = useAuth()

// Redirect if already logged in
useEffect(() => {
  if (!authLoading && user) {
    if (user.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (user.role === 'FIELD_WORKER') {
      router.push('/user/workflow')
    }
  }
}, [user, authLoading, router])
```

#### Behavior:
- **Not logged in**: Shows the login form
- **Already logged in as ADMIN**: Redirects to `/admin/dashboard`
- **Already logged in as FIELD_WORKER**: Redirects to `/user/workflow`

---

## How It Works

### Flow Diagram:

```
User visits / or /login
         |
         v
    Check session
         |
    +---------+---------+
    |                   |
 No session        Has session
    |                   |
    v                   v
Show page      Check user.role
                       |
              +--------+--------+
              |                 |
           ADMIN          FIELD_WORKER
              |                 |
              v                 v
      /admin/dashboard    /user/workflow
```

### Loading States:
- While `isLoading` or `authLoading` is true, shows "Loading..." message
- Once auth check completes, either shows the page or redirects

### Dependencies:
- Uses the `useAuth()` hook from `@/lib/auth-context`
- Relies on `useRouter()` from Next.js for navigation
- Uses `useEffect()` to trigger redirects when session state changes

---

## Benefits

✅ **Prevents Confusion**: Users can't accidentally access login/home while logged in  
✅ **Better UX**: Automatic redirection feels seamless  
✅ **Role-Based**: Each role gets sent to their appropriate dashboard  
✅ **Client-Side**: Fast, no server round-trip needed  
✅ **Secure**: Works alongside existing auth system  

---

## Testing

### Test Cases:

1. **Not logged in, visit `/`**
   - ✅ Should show landing page

2. **Not logged in, visit `/login`**
   - ✅ Should show login form

3. **Logged in as ADMIN, visit `/`**
   - ✅ Should redirect to `/admin/dashboard`

4. **Logged in as ADMIN, visit `/login`**
   - ✅ Should redirect to `/admin/dashboard`

5. **Logged in as FIELD_WORKER, visit `/`**
   - ✅ Should redirect to `/user/workflow`

6. **Logged in as FIELD_WORKER, visit `/login`**
   - ✅ Should redirect to `/user/workflow`

---

## Notes

- The redirects happen on the client-side using React hooks
- This complements any server-side middleware you might add later
- The redirect only triggers when:
  1. Auth loading is complete (`!isLoading` / `!authLoading`)
  2. A valid user session exists (`user` is truthy)
- Using `router.push()` for smooth client-side navigation
