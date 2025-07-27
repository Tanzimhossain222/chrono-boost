// Chrome Extension API types
declare namespace chrome {
  namespace notifications {
    interface NotificationOptions {
      type: string;
      iconUrl: string;
      title: string;
      message: string;
      priority?: number;
    }
    
    function create(notificationId?: string, options?: NotificationOptions): void;
    function create(options: NotificationOptions): void;
  }
}