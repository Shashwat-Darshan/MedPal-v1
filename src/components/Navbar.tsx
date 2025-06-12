
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Heart, User, Bell, Settings } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="bg-primary p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MedPal</h1>
              <span className="text-xs text-primary font-medium">AI Healthcare Assistant</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-primary"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/diagnosis')}
              className="text-muted-foreground hover:text-primary"
            >
              AI Diagnosis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/chat')}
              className="text-muted-foreground hover:text-primary"
            >
              Health Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/monitor')}
              className="text-muted-foreground hover:text-primary"
            >
              Monitor
            </Button>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
            
            <div className="flex items-center space-x-2 bg-secondary rounded-full px-3 py-1">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user?.name || 'User'}</span>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
