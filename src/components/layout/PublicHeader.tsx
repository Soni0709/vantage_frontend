import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks';
import { ThemeToggle } from '../ui';

interface PublicHeaderProps {
  showNav?: boolean;
  variant?: 'landing' | 'auth';
  breadcrumbs?: Array<{ label: string; href?: string }>;
  title?: string;
  subtitle?: string;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ 
  showNav = true, 
  variant = 'landing',
  breadcrumbs = [],
  title,
  subtitle
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useTheme(); // Listen to theme changes
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = mode === 'dark';

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'About', href: '/#about' },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
    setMobileMenuOpen(false);
  };

  const isAuthPage = variant === 'auth';

  return (
    <>
      {/* Main Header */}
      <header className={`sticky top-0 z-40 border-b transition-all duration-300 backdrop-blur-xl shadow-sm ${
        isDark
          ? 'bg-slate-900/60 border-white/5'
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Content */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity flex-shrink-0 group"
              title="Vantage - Personal Finance Tracker"
            >
              <div className={`w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/50`}>
                <span className="text-lg font-bold text-white">V</span>
              </div>
              <span className={`text-lg sm:text-xl font-bold bg-gradient-to-r transition-all duration-300 bg-clip-text text-transparent hidden sm:inline ${
                isDark
                  ? 'from-purple-400 to-blue-400'
                  : 'from-purple-600 to-blue-600'
              }`}>
                Vantage
              </span>
            </button>

            {/* Desktop Navigation - Landing Only */}
            {showNav && !isAuthPage && (
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      isActive(item.href)
                        ? isDark
                          ? 'text-purple-400 bg-purple-500/10'
                          : 'text-purple-600 bg-purple-50'
                        : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-white/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            {/* Spacer for auth pages */}
            {isAuthPage && <div className="hidden md:block flex-1" />}

            {/* Right Side - Theme Toggle & Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle */}
              <div className="hover:scale-110 transition-transform duration-300">
                <ThemeToggle />
              </div>

              {/* Desktop Auth Buttons - Landing Only */}
              {!isAuthPage && (
                <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className={`px-4 py-2 font-medium text-sm rounded-lg transition-all duration-300 ${
                      isDark
                        ? 'text-gray-400 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                  isDark
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Breadcrumbs on Auth Pages */}
          {isAuthPage && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-sm py-3 -mt-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className={`transition-colors duration-300 ${
                      isDark ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      /
                    </span>
                  )}
                  {crumb.href ? (
                    <button
                      onClick={() => navigate(crumb.href!)}
                      className={`font-medium transition-colors duration-300 ${
                        isDark
                          ? 'text-gray-400 hover:text-purple-400'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className={`font-semibold transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Auth Page Header Section */}
      {isAuthPage && (title || subtitle) && (
        <div className={`border-b transition-all duration-300 backdrop-blur-sm ${
          isDark
            ? 'bg-slate-900/30 border-white/5'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {title && (
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p className={`transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-t transition-all duration-300 backdrop-blur-xl ${
          isDark
            ? 'bg-slate-900/60 border-white/5'
            : 'bg-white/95 border-gray-200'
        }`}>
          <div className="px-4 sm:px-6 py-4 space-y-2 max-h-96 overflow-y-auto">
            {/* Mobile Nav Links - Landing Only */}
            {showNav && !isAuthPage && navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? isDark
                      ? 'text-purple-400 bg-purple-500/10'
                      : 'text-purple-600 bg-purple-50'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Mobile Auth Buttons - Landing Only */}
            {!isAuthPage && (
              <div className="flex sm:hidden gap-2 pt-2 border-t" style={{
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}>
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 px-4 py-3 font-medium rounded-lg transition-all duration-300 border ${
                    isDark
                      ? 'text-gray-400 border-white/10 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PublicHeader;