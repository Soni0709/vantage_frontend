import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { cn } from '../../utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    name: 'Budgets',
    href: '/budgets',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  },
  {
    name: 'Savings Goals',
    href: '/savings-goals',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    name: 'Recurring',
    href: '/recurring',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    badge: 'Soon',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { currentUser } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-white/5 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Collapse Button */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold">V</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Vantage
                </span>
              </div>
            )}
            
            {isCollapsed && (
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto">
                <span className="text-lg font-bold">V</span>
              </div>
            )}

            {/* Close button (mobile) / Collapse button (desktop) */}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onClose();
                } else {
                  onToggleCollapse();
                }
              }}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative",
                    isActive
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                    isCollapsed && "justify-center"
                  )
                }
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full" />
                    )}
                    <div className={cn(
                      "transition-transform group-hover:scale-110",
                      isActive && "text-purple-400"
                    )}>
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <>
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-semibold rounded-md border border-purple-500/20">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-white/5">
            <NavLink
              to="/profile"
              onClick={onClose}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? `${currentUser?.firstName} ${currentUser?.lastName}` : undefined}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
