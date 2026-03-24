'use client';

import { useEffect } from 'react';
import { backgroundNotificationService } from '@/services/backgroundNotificationService';

export default function BackgroundNotificationInitializer() {
  useEffect(() => {
    // Initialize background notifications when app loads
    backgroundNotificationService.initialize();
    
    // Cleanup on unmount
    return () => {
      backgroundNotificationService.stop();
    };
  }, []);

  return null; // This component doesn't render anything
}
