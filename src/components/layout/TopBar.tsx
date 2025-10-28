import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useGetAlertsQuery, useMarkAlertReadMutation, useGetSavingsGoalsSummaryQuery } from '../../store/api';
import type { BudgetAlert } from '../../types';

interface TopBarProps {
  onMenuClick: () => void;
}

// Unified notification type
interface Notification {
  id: string;
  type: 'budget' | 'savings_goal';
  severity: 'warning' | 'critical' | 'success' | 'info';
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  budgetId?: string;
  isRead?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Memoize the query params to prevent infinite loop
  const alertFilters = useMemo(() => ({ isRead: false }), []);
  const { data: budgetAlerts = [] } = useGetAlertsQuery(alertFilters);
  const { data: savingsSummary } = useGetSavingsGoalsSummaryQuery();
  const [markAsRead] = useMarkAlertReadMutation();
  
  const [showNotifications, setShowNotifications] = useState(false);

  // Convert budget alerts to notifications
  const budgetNotifications: Notification[] = useMemo(() => {
    return budgetAlerts.map((alert: BudgetAlert) => ({
      id: alert.id,
      type: 'budget' as const,
      severity: alert.severity,
      message: alert.message,
      timestamp: alert.createdAt,
      actionUrl: '/budgets',
      actionLabel: 'View Budget',
      budgetId: alert.budgetId,
      isRead: alert.isRead,
    }));
  }, [budgetAlerts]);

  // Generate savings goal notifications
  const savingsNotifications: Notification[] = useMemo(() => {
    if (!savingsSummary?.goals) return [];
    
    const notifications: Notification[] = [];
    
    savingsSummary.goals.forEach((goal) => {
      // Goal reached notification
      if (goal.is_reached && !goal.isRead) {
        notifications.push({
          id: `savings-reached-${goal.id}`,
          type: 'savings_goal',
          severity: 'success',
          message: `🎉 Congratulations! You've reached your "${goal.name}" savings goal!`,
          timestamp: goal.updated_at,
          actionUrl: '/savings-goals',
          actionLabel: 'View Goals',
        });
      }
      
      // Overdue notification
      if (goal.is_overdue && !goal.is_reached) {
        notifications.push({
          id: `savings-overdue-${goal.id}`,
          type: 'savings_goal',
          severity: 'warning',
          message: `⏰ Your "${goal.name}" goal deadline has passed. Current progress: ${Number(goal.progress_percentage || 0).toFixed(0)}%`,
          timestamp: goal.updated_at,
          actionUrl: '/savings-goals',
          actionLabel: 'Update Goal',
        });
      }
      
      // Near completion notification (90%+)
      const progress = Number(goal.progress_percentage || 0);
      if (progress >= 90 && progress < 100 && !goal.is_reached) {
        notifications.push({
          id: `savings-near-${goal.id}`,
          type: 'savings_goal',
          severity: 'info',
          message: `💪 Almost there! "${goal.name}" is ${progress.toFixed(0)}% complete`,
          timestamp: goal.updated_at,
          actionUrl: '/savings-goals',
          actionLabel: 'Add Amount',
        });
      }
    });
    
    return notifications;
  }, [savingsSummary]);

  // Combine all notifications and sort by timestamp
  const allNotifications = useMemo(() => {
    return [...budgetNotifications, ...savingsNotifications]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [budgetNotifications, savingsNotifications]);

  const unreadCount = allNotifications.length;

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.type === 'budget' && notification.budgetId) {
      try {
        await markAsRead({ budgetId: notification.budgetId, alertId: notification.id });
      } catch (error) {
        console.error('Failed to mark alert as read:', error);
      }
    }
    // Savings goal notifications are frontend-only, so just close the dropdown
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setShowNotifications(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          badge: 'bg-red-500/20 text-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-400',
        };
      case 'success':
        return {
          bg: 'bg-green-500/10',
          text: 'text-green-400',
          badge: 'bg-green-500/20 text-green-400',
        };
      case 'info':
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          badge: 'bg-blue-500/20 text-blue-400',
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          badge: 'bg-gray-500/20 text-gray-400',
        };
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'success':
        return 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'budget' ? 'Budget' : 'Savings Goal';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 backdrop-blur-xl bg-black/20">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Center: Search Bar (hidden on mobile) */}
        <div className="hidden sm:flex flex-1 max-w-2xl mx-auto">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search transactions, budgets, or categories..."
              className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
              disabled
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 rounded-xl shadow-2xl z-20">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-md">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {allNotifications.length > 0 ? (
                      allNotifications.map((notification) => {
                        const styles = getSeverityStyles(notification.severity);
                        return (
                          <div
                            key={notification.id}
                            className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.bg}`}>
                                <svg className={`w-4 h-4 ${styles.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getSeverityIcon(notification.severity)} />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className="text-sm text-gray-300 leading-snug">{notification.message}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${styles.badge}`}>
                                    {getTypeLabel(notification.type)}
                                  </span>
                                  <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  {notification.type === 'budget' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(notification);
                                      }}
                                      className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                  {notification.actionLabel && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleNotificationClick(notification);
                                      }}
                                      className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                                    >
                                      {notification.actionLabel} →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center">
                        <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <p className="text-sm text-gray-400 font-medium">All caught up!</p>
                        <p className="text-xs text-gray-500 mt-1">No notifications at the moment</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Avatar - Links to Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-semibold">
              {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
