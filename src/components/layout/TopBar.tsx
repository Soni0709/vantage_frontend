import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../../hooks';
import { useGetAlertsQuery, useMarkAlertReadMutation, useGetSavingsGoalsSummaryQuery } from '../../store/api';
import { ThemeToggle } from '../ui';
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
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { mode } = useTheme();
  
  const alertFilters = useMemo(() => ({ isRead: false }), []);
  const { data: budgetAlerts = [] } = useGetAlertsQuery(alertFilters);
  const { data: savingsSummary } = useGetSavingsGoalsSummaryQuery();
  const [markAsRead] = useMarkAlertReadMutation();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedSavingsNotifications, setDismissedSavingsNotifications] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('vantage_dismissed_savings_notifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Budget notifications
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
    }));
  }, [budgetAlerts]);

  // Savings goal notifications - keep separate from dismissed state to avoid loops
  const savingsNotifications: Notification[] = useMemo(() => {
    if (!savingsSummary?.goals) return [];
    
    const notifications: Notification[] = [];
    
    savingsSummary.goals.forEach((goal) => {
      if (goal.is_reached) {
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

  // Filter dismissed notifications
  const activeSavingsNotifications = useMemo(() => {
    return savingsNotifications.filter(n => !dismissedSavingsNotifications.has(n.id));
  }, [savingsNotifications, dismissedSavingsNotifications]);

  // All notifications
  const allNotifications = useMemo(() => {
    return [...budgetNotifications, ...activeSavingsNotifications]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [budgetNotifications, activeSavingsNotifications]);

  const unreadCount = allNotifications.length;

  const handleDismissNotification = (notificationId: string, type: 'budget' | 'savings_goal', budgetId?: string) => {
    if (type === 'budget' && budgetId) {
      markAsRead({ budgetId, alertId: notificationId }).catch((error) => {
        console.error('Failed to mark alert as read:', error);
      });
    } else if (type === 'savings_goal') {
      const newSet = new Set(dismissedSavingsNotifications);
      newSet.add(notificationId);
      setDismissedSavingsNotifications(newSet);
      localStorage.setItem('vantage_dismissed_savings_notifications', JSON.stringify(Array.from(newSet)));
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
        return { bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' };
      case 'warning':
        return { bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' };
      case 'success':
        return { bg: 'bg-green-500/10', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400' };
      case 'info':
        return { bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-400', badge: 'bg-gray-500/20 text-gray-400' };
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
    <header 
      className="sticky top-0 z-30 border-b backdrop-blur-xl transition-all duration-200"
      style={{
        background: mode === 'dark' 
          ? 'rgba(15, 23, 42, 0.6)'
          : 'white',
        borderColor: mode === 'dark'
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgb(229, 231, 235)',
        color: mode === 'dark' ? 'white' : 'rgb(17, 24, 39)'
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg transition-colors" style={{
          color: 'currentColor',
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgb(243, 244, 246)'
        }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:flex flex-1 max-w-2xl mx-auto">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search transactions, budgets, or categories..."
              className="w-full px-4 py-2 pl-10 rounded-xl text-sm focus:outline-none transition-all"
              style={{
                background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgb(249, 250, 251)',
                border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgb(229, 231, 235)'}`,
                color: mode === 'dark' ? 'white' : 'rgb(17, 24, 39)',
              }}
              disabled
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
              color: mode === 'dark' ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
            }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg transition-colors" style={{
              color: 'currentColor',
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
                color: 'currentColor'
              }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 dark:bg-red-500 text-white dark:text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 border rounded-xl shadow-2xl z-20" style={{
                  background: mode === 'dark' 
                    ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
                    : 'linear-gradient(to bottom, rgb(249, 250, 251), white)',
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgb(229, 231, 235)'
                }}>
                  <div className="p-4 border-b" style={{
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgb(229, 231, 235)',
                  background: mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgb(249, 250, 251)',
                }}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold" style={{
                    color: mode === 'dark' ? 'white' : 'rgb(17, 24, 39)'
                  }}>Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-md">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto" style={{
                    background: mode === 'dark' ? 'transparent' : 'transparent'
                  }}>
                    {allNotifications.length > 0 ? (
                      allNotifications.map((notification) => {
                        const styles = getSeverityStyles(notification.severity);
                        return (
                          <div key={notification.id} className="p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`} style={{
                                background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgb(243, 244, 246)'
                              }}>
                                <svg className={`w-4 h-4 ${styles.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getSeverityIcon(notification.severity)} />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm leading-snug mb-2" style={{
                              color: mode === 'dark' ? 'rgb(209, 213, 219)' : 'rgb(75, 85, 99)'
                            }}>{notification.message}</p>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-1.5 py-0.5 text-xs font-semibold rounded`} style={{
                                    background: mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
                                    color: mode === 'dark' ? 'rgb(196, 181, 253)' : 'rgb(126, 34, 206)'
                                  }}>
                                    {getTypeLabel(notification.type)}
                                  </span>
                                  <span className="text-xs" style={{
                                    color: mode === 'dark' ? 'rgb(107, 114, 128)' : 'rgb(107, 114, 128)'
                                  }}>{formatTimestamp(notification.timestamp)}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleDismissNotification(notification.id, notification.type, notification.budgetId)}
                                    className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                                  >
                                    {notification.type === 'budget' ? 'Mark as read' : 'Dismiss'}
                                  </button>
                                  {notification.actionLabel && (
                                    <button
                                      onClick={() => {
                                        navigate(notification.actionUrl!);
                                        setShowNotifications(false);
                                      }}
                                      className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
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
                        <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">All caught up!</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">No notifications at the moment</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 p-1.5 rounded-xl transition-colors" style={{
              color: 'currentColor',
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            }}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
              {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
