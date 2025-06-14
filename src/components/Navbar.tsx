
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useNotifications } from '@/hooks/useNotifications';
import { User, LogOut, Menu, Bell, Search, Settings, Sparkles, Moon, Sun } from 'lucide-react';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout
  } = useAuth();
  const {
    isDark,
    toggleTheme
  } = useDarkMode();
  const {
    unreadCount
  } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const isMobile = useIsMobile();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const navItems = [{
    path: '/dashboard',
    label: 'Dashboard'
  }, {
    path: '/diagnosis',
    label: 'AI Diagnosis'
  }, {
    path: '/chat',
    label: 'Health Chat'
  }, {
    path: '/monitor',
    label: 'Monitor'
  }, {
    path: '/history',
    label: 'History'
  }];
  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 px-[3px] mx-0 my-0 py-[34px]">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('/dashboard')}>
            {isMobile ? (
              // Mobile: Compact stacked text logo - no background, left aligned
              <div className="flex flex-col items-start justify-center">
                <span className="text-white font-black text-lg leading-tight tracking-wide font-serif" style={{ fontFamily: 'Impact, "Franklin Gothic Bold", "Helvetica Neue", Arial, sans-serif' }}>MED</span>
                <span className="text-blue-600 dark:text-blue-400 font-black text-lg leading-tight tracking-wide font-serif" style={{ fontFamily: 'Impact, "Franklin Gothic Bold", "Helvetica Neue", Arial, sans-serif' }}>PAL</span>
              </div>
            ) : (
              // Desktop: Larger stacked text logo with tagline - no background, left aligned
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-start justify-center">
                  <span className="text-white font-black text-2xl leading-tight tracking-wide font-serif" style={{ fontFamily: 'Impact, "Franklin Gothic Bold", "Helvetica Neue", Arial, sans-serif' }}>MED</span>
                  <span className="text-blue-600 dark:text-blue-400 font-black text-2xl leading-tight tracking-wide font-serif" style={{ fontFamily: 'Impact, "Franklin Gothic Bold", "Helvetica Neue", Arial, sans-serif' }}>PAL</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-primary font-medium">AI Healthcare Assistant</span>
                </div>
              </div>
            )}
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
                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300'
                }`}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <>
                {/* Search Button - Desktop Only */}
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </div>
                )}
              </Button>
              <NotificationDropdown
                isOpen={notificationOpen}
                onClose={() => setNotificationOpen(false)}
              />
            </div>

            {/* User Profile - Desktop Only */}
            {!isMobile && (
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 border border-blue-200 dark:border-blue-700 rounded-3xl py-px">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium Member</p>
                </div>
              </div>
            )}

            {/* Mobile: Dark Mode Toggle */}
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {/* Settings Dropdown - Desktop Only */}
            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <span>Dark Mode</span>
                    </div>
                    <Switch
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile: Logout Button */}
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}

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
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
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
              
              {/* Mobile Menu Footer */}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 px-2 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Premium Member</p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-start mt-2">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
