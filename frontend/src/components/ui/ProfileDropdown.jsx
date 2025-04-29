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
          color="blue-gray"
          className="flex items-center gap-2 p-2"
        >
          <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5" />
          </div>
          <Typography variant="small" className="ml-1 font-medium text-gray-900">
            {user?.name?.split(' ')[0] || 'User'}
          </Typography>
        </Button>
      </MenuHandler>
  
      <MenuList>
        <MenuItem 
          onClick={handleProfileClick}
          className="flex items-center gap-2"
        >
          <UserIcon className="w-4 h-4" />
          <Typography variant="small" className="font-medium">
            My Profile
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500"
        >
          <PowerIcon className="w-4 h-4" />
          <Typography variant="small" className="font-medium">
            Sign Out
          </Typography>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProfileDropdown;