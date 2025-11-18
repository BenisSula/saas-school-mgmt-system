# Clear Browser Cache & Storage for Login Issues

## Quick Method (Chrome/Edge)

1. **Open DevTools** (F12 or Ctrl+Shift+I)
2. **Application Tab** → **Storage** section
3. **Clear site data** button (top right)
4. Check all boxes:
   - ✅ Local storage
   - ✅ Session storage
   - ✅ IndexedDB
   - ✅ Cookies
   - ✅ Cache storage
   - ✅ Service Workers
5. Click **Clear site data**
6. **Hard refresh**: Ctrl+Shift+R (or Ctrl+F5)

## Manual Method (Step by Step)

### 1. Clear Service Workers
- DevTools → **Application** tab
- **Service Workers** (left sidebar)
- Click **Unregister** for any registered workers
- Check **"Bypass for network"** if available

### 2. Clear Storage
- DevTools → **Application** tab
- **Storage** section:
  - **Local Storage** → Right-click → **Clear**
  - **Session Storage** → Right-click → **Clear**
  - **Cookies** → Right-click → **Clear**
  - **IndexedDB** → Right-click → **Delete database**

### 3. Clear Cache
- DevTools → **Application** tab
- **Cache Storage** → Right-click each cache → **Delete**
- Or: DevTools → **Network** tab → Check **"Disable cache"** → Hard refresh

### 4. Clear Form Autofill
- Chrome Settings → **Autofill** → **Passwords**
- Remove any saved passwords for your site
- Or: Address bar → Click lock icon → **Site settings** → **Clear data**

### 5. Disable Extensions Temporarily
- Chrome: `chrome://extensions/`
- Disable all extensions
- Restart browser
- Try login again

## Nuclear Option (Complete Reset)

1. **Close all browser tabs** for `localhost:5173`
2. **Clear browsing data**:
   - Chrome: Ctrl+Shift+Delete
   - Select **"All time"**
   - Check:
     - ✅ Cookies and other site data
     - ✅ Cached images and files
     - ✅ Hosted app data
   - Click **Clear data**
3. **Restart browser completely**
4. **Open fresh tab** → Navigate to `http://localhost:5173`

## Verify Cache is Cleared

Open DevTools Console and run:
```javascript
// Check storage
console.log('LocalStorage:', localStorage.length);
console.log('SessionStorage:', sessionStorage.length);

// Clear programmatically (if needed)
localStorage.clear();
sessionStorage.clear();

// Check cookies
console.log('Cookies:', document.cookie);
```

## After Clearing

1. **Restart frontend dev server** (if running)
2. **Hard refresh**: Ctrl+Shift+R
3. **Try login again** with correct credentials
4. **Check console** for any remaining errors

