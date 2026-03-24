// Service Worker for background notifications
const CACHE_NAME = 'productivity-dashboard-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([]);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('Checking for notifications in background...');
    
    // Check for notifications
    const response = await fetch('/api/notifications?unreadOnly=true');
    const notifications = await response.json();
    
    if (notifications.length > 0) {
      console.log(`Found ${notifications.length} new notifications`);
      
      // Show desktop notification
      notifications.forEach(notification => {
        self.registration.showNotification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'productivity-dashboard',
          requireInteraction: false,
          data: {
            url: '/dashboard'
          }
        });
      });
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Handle push notifications (if implemented later)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'You have a new notification!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'productivity-dashboard',
    requireInteraction: false,
    data: {
      url: '/dashboard'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Productivity Dashboard', options)
  );
});
