
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Heart, User, LogOut, Menu, Bell, Search, Settings, Sparkles } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/diagnosis', label: 'AI Diagnosis' },
    { path: '/chat', label: 'Health Chat' },
    { path: '/monitor', label: 'Monitor' },
    { path: '/history', label: 'History' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl group-hover:shadow-lg transition-all duration-300">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MedPal
              </h1>
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-primary font-medium">AI Healthcare Assistant</span>
              </div>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`text-sm transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'medical-gradient text-white shadow-lg' 
                    : 'hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Enhanced User Menu */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="h-4 w-4" />
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </Button>

            {/* User Profile */}
            <div className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-4 py-2 border border-blue-200">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">Premium Member</p>
              </div>
            </div>

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            {/* Logout */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
