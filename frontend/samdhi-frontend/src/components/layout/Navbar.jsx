// src/components/layout/Navbar.jsx
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ProfileDropdown from '../ui/ProfileDropdown';
import {
  Navbar as MTNavbar,
  Typography
} from '@material-tailwind/react';

// NavList for user-specific navigation
const NavList = () => {
  const { user } = useAuth();
  const location = useLocation();

  let navItems = [];

  if (user?.role === 'admin') {
    navItems = [
      { path: '/admin/dashboard', name: 'Dashboard' },
      { path: '/admin/restaurants', name: 'Restaurants' },
      { path: '/admin/users', name: 'Users' }
    ];
  } else if (user?.role === 'restaurant') {
    navItems = [
      { path: '/restaurant/dashboard', name: 'Dashboard' },
      { path: '/restaurant/menu', name: 'Menu' },
      { path: '/restaurant/orders', name: 'Orders' }
    ];
  } else if (user?.role === 'customer') {
    navItems = [
      { path: '/customer/dashboard', name: 'Dashboard' },
      { path: '/customer/restaurants', name: 'Add Restaurant' },
      { path: '/delivery', name: 'My Orders' }
    ];
  }

  return (
    <ul className="flex flex-row gap-8">
      {navItems.map((item) => (
        <li key={item.name}>
          <Link
            to={item.path}
            className={`px-1 py-2 text-sm font-medium relative group ${
              location.pathname === item.path ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            } transition-colors duration-300`}
          >
            {item.name}
            <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
              location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
            }`}></span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

const Navbar = () => {
  const { user } = useAuth();

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/" 
              className="flex items-center"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Gourmet Delight
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <NavList />
            {user && <ProfileDropdown />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;