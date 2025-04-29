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
      { path: '/customer/orders', name: 'My Orders' }
    ];
  }

  return (
    <ul style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '1.5rem',
      paddingLeft: 0,
      marginBottom: 0,
      listStyle: 'none'
    }}>
      {navItems.map((item) => (
        <li key={item.name}>
          <Link
            to={item.path}
            style={{
              color: location.pathname === item.path ? '#2196f3' : '#64748b',
              fontWeight: location.pathname === item.path ? '600' : '500',
              textDecoration: 'none',
              transition: 'color 0.3s'
            }}
          >
            <Typography>{item.name}</Typography>
          </Link>
        </li>
      ))}
    </ul>
  );
};

const Navbar = () => {
  const { user } = useAuth();

  // Optional cleanup hook in case you had more logic for responsiveness
  useEffect(() => {
    // Remove any old event listeners related to resizing
    return () => {};
  }, []);

  return (
    <MTNavbar
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        maxWidth: '100%',
        borderRadius: 0,
        padding: '0.75rem 1rem'
      }}
      className="sticky top-0 z-10 max-w-full rounded-none p-3"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <Typography
          as={Link}
          to="/"
          variant="h5"
          style={{
            color: '#1e293b',
            fontWeight: '700',
            textDecoration: 'none'
          }}
        >
          Restaurant App
        </Typography>

        {/* Desktop Navigation Only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NavList />
          {user && <ProfileDropdown />}
        </div>
      </div>
    </MTNavbar>
  );
};

export default Navbar;
