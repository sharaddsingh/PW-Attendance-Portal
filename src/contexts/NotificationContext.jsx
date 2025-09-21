import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Helpers from '../utils/helpers';

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Notification positions
 */
export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_CENTER: 'top-center',
  BOTTOM_CENTER: 'bottom-center'
};

/**
 * Default notification configuration
 */
const DEFAULT_CONFIG = {
  position: NOTIFICATION_POSITIONS.TOP_RIGHT,
  autoClose: true,
  autoCloseTime: 5000, // 5 seconds
  maxNotifications: 5,
  showProgress: true
};

/**
 * Notification Context
 */
const NotificationContext = createContext({
  notifications: [],
  config: DEFAULT_CONFIG,
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
  updateConfig: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {}
});

/**
 * Notification Provider Component
 */
export const NotificationProvider = ({ children, config = {} }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationConfig, setNotificationConfig] = useState({
    ...DEFAULT_CONFIG,
    ...config
  });

  const addNotification = useCallback((notification) => {
    const id = Helpers.generateRandomId();
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      autoClose: notificationConfig.autoClose,
      autoCloseTime: notificationConfig.autoCloseTime,
      showProgress: notificationConfig.showProgress,
      createdAt: Date.now(),
      ...notification
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      if (updated.length > notificationConfig.maxNotifications) {
        return updated.slice(0, notificationConfig.maxNotifications);
      }
      return updated;
    });

    if (newNotification.autoClose && newNotification.autoCloseTime > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.autoCloseTime);
    }

    return id;
  }, [notificationConfig]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateConfig = useCallback((newConfig) => {
    setNotificationConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  }, []);

  const success = useCallback((message, options = {}) => {
    const notification = typeof message === 'string' ? { message, ...options } : { ...message, ...options };
    return addNotification({ type: NOTIFICATION_TYPES.SUCCESS, ...notification });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    const notification = typeof message === 'string' ? { message, ...options } : { ...message, ...options };
    return addNotification({ type: NOTIFICATION_TYPES.ERROR, autoClose: false, ...notification });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    const notification = typeof message === 'string' ? { message, ...options } : { ...message, ...options };
    return addNotification({ type: NOTIFICATION_TYPES.WARNING, autoCloseTime: 8000, ...notification });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    const notification = typeof message === 'string' ? { message, ...options } : { ...message, ...options };
    return addNotification({ type: NOTIFICATION_TYPES.INFO, ...notification });
  }, [addNotification]);

  const value = {
    notifications,
    config: notificationConfig,
    addNotification,
    removeNotification,
    clearNotifications,
    updateConfig,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use notification context
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};

/**
 * Simplified notification hook
 */
export const useNotify = () => {
  const { success, error, warning, info } = useNotifications();
  return { success, error, warning, info };
};

/**
 * Notification Item Component
 */
export const NotificationItem = ({ notification, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const { id, type, title, message, autoClose, autoCloseTime, showProgress, actions } = notification;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoClose && autoCloseTime > 0 && showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - 100 / (autoCloseTime / 100)));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [autoClose, autoCloseTime, showProgress]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  const getTypeStyles = () => {
    const base = "relative overflow-hidden rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-300 ease-in-out";
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS: return `${base} bg-green-50 border-l-4 border-green-400`;
      case NOTIFICATION_TYPES.ERROR: return `${base} bg-red-50 border-l-4 border-red-400`;
      case NOTIFICATION_TYPES.WARNING: return `${base} bg-yellow-50 border-l-4 border-yellow-400`;
      default: return `${base} bg-blue-50 border-l-4 border-blue-400`;
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS: return "text-green-400";
      case NOTIFICATION_TYPES.ERROR: return "text-red-400";
      case NOTIFICATION_TYPES.WARNING: return "text-yellow-400";
      default: return "text-blue-400";
    }
  };

  const getIcon = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS: return "✓";
      case NOTIFICATION_TYPES.ERROR: return "✕";
      case NOTIFICATION_TYPES.WARNING: return "⚠";
      default: return "ℹ";
    }
  };

  return (
    <div className={`${getTypeStyles()} ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : isLeaving ? 'translate-x-full opacity-0 scale-95' : 'translate-x-full opacity-0 scale-95'}`}>
      <div className="p-4 flex items-start">
        <div className="flex-shrink-0">
          <div className={`w-5 h-5 flex items-center justify-center ${getIconStyles()}`}>{getIcon()}</div>
        </div>
        <div className="ml-3 w-0 flex-1">
          {title && <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>}
          <p className="text-sm text-gray-700">{message}</p>
          {actions && actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {actions.map((action, i) => (
                <button key={i} onClick={action.onClick} className={`text-sm font-medium px-3 py-1 rounded ${action.style === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-blue-600 hover:text-blue-800'}`}>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button onClick={handleClose} className="inline-flex text-gray-400 hover:text-gray-600 transition-colors duration-200"><span className="sr-only">Close</span>✕</button>
        </div>
      </div>
      {showProgress && autoClose && autoCloseTime > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div className={`h-full transition-all duration-100 ease-linear ${type === NOTIFICATION_TYPES.SUCCESS ? 'bg-green-400' : type === NOTIFICATION_TYPES.ERROR ? 'bg-red-400' : type === NOTIFICATION_TYPES.WARNING ? 'bg-yellow-400' : 'bg-blue-400'}`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

/**
 * Notification Container
 */
export const NotificationContainer = () => {
  const { notifications, config, removeNotification } = useNotifications();
  if (notifications.length === 0) return null;

  const getPositionStyles = () => {
    const base = "fixed z-50 flex flex-col space-y-2 pointer-events-none";
    switch (config.position) {
      case NOTIFICATION_POSITIONS.TOP_RIGHT: return `${base} top-4 right-4`;
      case NOTIFICATION_POSITIONS.TOP_LEFT: return `${base} top-4 left-4`;
      case NOTIFICATION_POSITIONS.BOTTOM_RIGHT: return `${base} bottom-4 right-4`;
      case NOTIFICATION_POSITIONS.BOTTOM_LEFT: return `${base} bottom-4 left-4`;
      case NOTIFICATION_POSITIONS.TOP_CENTER: return `${base} top-4 left-1/2 transform -translate-x-1/2`;
      case NOTIFICATION_POSITIONS.BOTTOM_CENTER: return `${base} bottom-4 left-1/2 transform -translate-x-1/2`;
      default: return `${base} top-4 right-4`;
    }
  };

  return (
    <div className={getPositionStyles()}>
      {notifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem notification={notification} onClose={removeNotification} />
        </div>
      ))}
    </div>
  );
};

export default NotificationContext;
