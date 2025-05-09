// src/components/ui/ProfileDropdown.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar
} from '@material-tailwind/react';
import { UserCircleIcon, PowerIcon } from '@heroicons/react/24/outline';
import { UserIcon } from "@heroicons/react/24/solid";

const ProfileDropdown = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
  };

  const handleProfileClick = () => {
    closeMenu();
    navigate('/profile');
  };

  const getUserInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-50 transition-colors duration-300"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center">
            {user?.name ? (
              <span className="text-sm font-medium">{getUserInitials()}</span>
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </div>
          <span className="text-gray-700">{user?.name?.split(' ')[0] || 'User'}</span>
        </Button>
      </MenuHandler>
  
      <MenuList className="p-1 min-w-[180px] border border-gray-200 shadow-lg rounded-lg">
        <MenuItem 
          onClick={handleProfileClick}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors duration-300"
        >
          <UserCircleIcon className="w-4 h-4 text-gray-500" />
          <span>My Profile</span>
        </MenuItem>
        <hr className="my-1 border-gray-200" />
        <MenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-300"
        >
          <PowerIcon className="w-4 h-4" />
          <span>Sign Out</span>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProfileDropdown;