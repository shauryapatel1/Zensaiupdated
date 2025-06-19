@@ .. @@
 import { useNavigate } from 'react-router-dom';
 import LottieAvatar from '../LottieAvatar';
+import { safeStorage, ErrorCode, createAppError, getUserFriendlyErrorMessage } from '../../types/errors';
 
 // Import memoized components
@@ .. @@
   const loadUserPreferences = () => {
     // Load preferences from localStorage
-    try {
-      const savedNotifications = localStorage.getItem('zensai-notifications');
-      setNotifications(savedNotifications !== 'false'); // Default to true
-    } catch (err) {
-      console.error('Error loading preferences:', err);
-      // Default to enabled if localStorage fails
-      setNotifications(true);
-    }
+    const savedNotifications = safeStorage.getItem('zensai-notifications', 'true');
+    setNotifications(savedNotifications !== 'false'); // Default to true
   };
 
@@ .. @@
   const handleToggleNotifications = useCallback((enabled: boolean) => {
     setNotifications(enabled);
-    try {
-      localStorage.setItem('zensai-notifications', enabled.toString());
-    } catch (err) {
-      console.error('Error saving notification preference:', err);
-    }
+    safeStorage.setItem('zensai-notifications', enabled.toString());
     setSuccess(enabled ? 'Notifications enabled' : 'Notifications disabled');
     setTimeout(() => setSuccess(''), 2000);
   }, []);