import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks';
import PublicHeader from '../components/layout/PublicHeader';
import { Button } from '../components/ui';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isDark = mode === 'dark';

  const features = [
    {
      title: "Smart Budget Tracking",
      description: "Set category-wise budgets and get real-time alerts when you're approaching limits",
      icon: "💰",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Savings Goals",
      description: "Create multiple savings goals, track progress, and achieve your financial dreams",
      icon: "🎯",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Transaction Management",
      description: "Track income and expenses with automatic recurring transaction handling",
      icon: "📊",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const stats = [
    { number: "100%", label: "Free Forever", icon: "🎁" },
    { number: "₹0", label: "Hidden Fees", icon: "🔒" },
    { number: "256-bit", label: "Encryption", icon: "🛡️" },
    { number: "24/7", label: "Access", icon: "⚡" }
  ];

  const FloatingCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <div 
      className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );

  const backgroundStyle = isDark
    ? {
        background: 'linear-gradient(to bottom right, rgb(15, 23, 42), rgb(15, 23, 42), rgb(2, 6, 23))',
      }
    : {
        background: 'linear-gradient(to bottom right, rgb(249, 250, 251), rgb(255, 255, 255), rgb(243, 244, 246))',
      };

  const cardBgClass = isDark 
    ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-white/10' 
    : 'bg-white border-gray-200/50';
  const featureListBgClass = isDark
    ? 'bg-gray-800/30 hover:bg-gray-800/50'
    : 'bg-gray-100/50 hover:bg-gray-200/50';
  const activeBgClass = isDark
    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20'
    : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10';

  return (
    <div className="min-h-screen overflow-hidden transition-colors duration-300" style={backgroundStyle}>
      {/* Animated Background Elements - only show in dark mode */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '30s' }}></div>
        </div>
      )}

      {/* Public Header Navigation */}
      <PublicHeader variant="landing" showNav={true} />

      {/* Hero Section */}
      <section id="hero" className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <FloatingCard delay={200}>
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight ${
              isDark 
                ? 'bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent' 
                : 'text-gray-900'
            }`}>
              Take Control of
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                Your Money
              </span>
            </h1>
          </FloatingCard>
          
          <FloatingCard delay={400}>
            <p className={`text-lg sm:text-xl lg:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Simple, powerful personal finance tracker built for India. Track expenses, 
              set budgets, achieve savings goals, and get real-time insights—all in one place.
            </p>
          </FloatingCard>

          <FloatingCard delay={600}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-white"
                onClick={() => navigate('/register')}
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className={isDark ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-400 text-gray-900 hover:bg-gray-200'} 
                onClick={() => navigate('/login')}
              >
                Sign In
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </FloatingCard>

          {/* Stats Grid */}
          <FloatingCard delay={800}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-2xl transition-all duration-300 hover:scale-110 ${
                    isDark 
                      ? 'bg-gray-800/50 border border-white/10' 
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </FloatingCard>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 ${
              isDark
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}>
              Everything You Need to Manage Your Finances
            </h2>
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              All essential features in one simple app—no premium plans, no hidden costs
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Interactive Feature Display */}
            <div className="relative">
              <div className={`backdrop-blur-xl rounded-3xl p-8 sm:p-10 border shadow-2xl transition-all duration-500 ${cardBgClass}`}>
                <div className="mb-8">
                  <div className={`inline-block text-6xl p-4 rounded-2xl bg-gradient-to-r ${features[activeFeature].color} bg-opacity-20`}>
                    {features[activeFeature].icon}
                  </div>
                </div>
                <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {features[activeFeature].title}
                </h3>
                <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {features[activeFeature].description}
                </p>
                
                {/* Feature Metrics */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Easy to Use</span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Intuitive</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full w-[98%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Free Forever</span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>100%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-[100%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-l-4 transform ${
                    activeFeature === index 
                      ? `${activeBgClass} border-purple-500 scale-105 shadow-lg` 
                      : `${featureListBgClass} border-transparent hover:shadow-md`
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 text-3xl p-3 rounded-xl bg-gradient-to-r ${feature.color} bg-opacity-20`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 ${
              isDark
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}>
              Simple, Transparent Pricing
            </h2>
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Just one plan. Everything included. Forever free.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className={`backdrop-blur-xl rounded-3xl p-8 sm:p-12 border shadow-2xl ${
              isDark 
                ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-white/10' 
                : 'bg-white border-gray-200/50'
            }`}>
              <div className="grid sm:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                    ₹0
                  </div>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Forever</p>
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  <div className={`h-16 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                </div>
                <div className="sm:col-span-1">
                  <ul className="space-y-3">
                    <li className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-green-500 mr-2">✓</span> All Features
                    </li>
                    <li className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-green-500 mr-2">✓</span> Unlimited Data
                    </li>
                    <li className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-green-500 mr-2">✓</span> No Credit Card
                    </li>
                  </ul>
                </div>
              </div>

              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-white"
                onClick={() => navigate('/register')}
              >
                Start Free Now
              </Button>

              <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No credit card required • Cancel anytime • 100% free forever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - App Info & Facts */}
      <section id="about" className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 ${
              isDark
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}>
              About Vantage
            </h2>
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Comprehensive personal finance management built on modern technology
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className={`rounded-2xl p-8 border ${
              isDark
                ? 'bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-white/10'
                : 'bg-purple-50 border-purple-200'
            }`}>
              <h3 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-3xl">🎯</span> Our Mission
              </h3>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                To empower individuals with intelligent, accessible financial tools that simplify money management and encourage better financial decisions.
              </p>
            </div>

            <div className={`rounded-2xl p-8 border ${
              isDark
                ? 'bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-white/10'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h3 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-3xl">🚀</span> Our Vision
              </h3>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                A world where personal finance management is intuitive, transparent, and accessible to everyone, regardless of their technical background.
              </p>
            </div>
          </div>

          
          {/* Core Features Overview */}
          <div className="mb-16">
            <h3 className={`text-3xl font-bold text-center mb-12 ${
              isDark
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}>
              Comprehensive Feature Set
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '💳', name: 'Transaction Management', desc: 'Track all income and expenses with detailed categorization' },
                { icon: '💰', name: 'Smart Budgeting', desc: 'Set budgets per category with real-time tracking' },
                { icon: '🎯', name: 'Savings Goals', desc: 'Create multiple goals and track progress visually' },
                { icon: '🔄', name: 'Recurring Transactions', desc: 'Automatically handle recurring payments' },
                { icon: '📊', name: 'Analytics & Insights', desc: 'Detailed charts and spending analysis' },
                { icon: '⚠️', name: 'Smart Alerts', desc: 'Get notified when approaching budget limits' }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                    isDark
                      ? 'bg-gray-800/50 border-white/10 hover:bg-gray-800/70'
                      : 'bg-white border-gray-200 hover:shadow-xl'
                  }`}
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.name}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`backdrop-blur-xl rounded-3xl p-8 sm:p-12 border shadow-2xl transition-all ${
            isDark 
              ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-white/10'
              : 'bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-gray-300/20'
          }`}>
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${
              isDark
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}>
              Ready to Take Control?
            </h2>
            <p className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Join thousands of users managing their finances with Vantage. Get started in minutes, completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-white"
                onClick={() => navigate('/register')}
              >
                Create Account Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className={isDark ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-400 text-gray-900 hover:bg-gray-200'}
                onClick={() => navigate('/login')}
              >
                Already a user? Sign In
              </Button>
            </div>
            <p className={`text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No credit card required • 100% free forever</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 border-t" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-white">V</span>
                </div>
                <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Vantage</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Personal Finance Tracker for India</p>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Product</h4>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#features" className={`hover:${isDark ? 'text-white' : 'text-gray-900'} transition-colors`}>Features</a></li>
                <li><a href="#pricing" className={`hover:${isDark ? 'text-white' : 'text-gray-900'} transition-colors`}>Pricing</a></li>
                <li><a href="#" className={`hover:${isDark ? 'text-white' : 'text-gray-900'} transition-colors`}>Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Legal</h4>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className={`hover:${isDark ? 'text-white' : 'text-gray-900'} transition-colors`}>Privacy</a></li>
                <li><a href="#" className={`hover:${isDark ? 'text-white' : 'text-gray-900'} transition-colors`}>Terms</a></li>
                <li><a href="#" className={`hover:${isDark ? 'text-white' : 'text-gray-900'} transition-colors`}>Contact</a></li>
              </ul>
            </div>
          </div>
          <div className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} border-t pt-8`} style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
            © 2024 Vantage Finance Tracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;