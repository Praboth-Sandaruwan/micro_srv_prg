import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurants/pending/all');
      setPendingCount(response.data.length);
    } catch (error) {
      console.error('Error fetching pending restaurants:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Consistent blue color definitions
  const blueColor = '#3b82f6'; // Primary blue
  const blueGradient = 'linear-gradient(to right, #3b82f6, #60a5fa)';
  const blueLight = '#bfdbfe'; // Lighter blue for backgrounds
  const blueDark = '#1d4ed8'; // Darker blue for hover effects

  return (
    <div className="min-h-screen bg-gray-50 font-[Inter,sans-serif]">
      {/* Welcome Banner */}
      <div
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1682&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          height: '300px',
          borderRadius: '1rem',
          overflow: 'hidden',
          margin: '1.5rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(3, 7, 18, 0.7)',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '0.75rem',
            }}
          >
            Welcome to Gourmet Delight
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#d1d5db' }}>
            Manage your food delivery platform efficiently and elegantly.
          </p>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <Typography
              variant="h3"
              className="font-bold mb-2 text-gray-900"
            >
              Dashboard Overview
            </Typography>
            <Typography variant="lead" className="text-gray-600">
              Welcome back, <span style={{ color: blueColor, fontWeight: '600' }}>{user?.name}</span>
            </Typography>
          </div>
          <div className="mt-4 md:mt-0">
            <Typography
              variant="small"
              className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full"
            >
              Last login: {new Date().toLocaleString()}
            </Typography>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Pending Restaurants Card */}
          <Card className="bg-white border-0 shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full min-h-[300px]">
            <CardBody className="p-6 relative h-full flex flex-col">
              {/* Blue Icon Box */}
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke={blueColor} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>

              {/* Title & Description */}
              <Typography variant="h5" className="font-medium mb-1 text-gray-900">
                Pending Restaurants
              </Typography>
              <Typography variant="small" className="text-gray-500 mb-6">
                Awaiting your approval
              </Typography>

              {/* Empty space to maintain height */}
              <div className="flex-grow"></div>

              {/* Button */}
              <Link to="/admin/pending-restaurants" className="mt-auto">
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: blueGradient,
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.1)`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = `linear-gradient(to right, ${blueDark}, #3b82f6)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = blueGradient;
                  }}
                >
                  {pendingCount > 0 ? 'Review Approvals' : 'View Pending'}
                </button>
              </Link>
            </CardBody>
          </Card>

          {/* Restaurant Management Card */}
          <Card className="bg-white border-0 shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full min-h-[300px]">
            <CardBody className="p-6 relative h-full flex flex-col">
              {/* Blue Icon Box */}
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke={blueColor} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>

              {/* Title & Description */}
              <Typography variant="h5" className="font-medium mb-1 text-gray-900">
                Restaurant Management
              </Typography>
              <Typography variant="small" className="text-gray-500 mb-6">
                All restaurant listings
              </Typography>

              {/* Empty space to maintain height */}
              <div className="flex-grow"></div>

              {/* Button */}
              <Link to="/admin/restaurants" className="mt-auto">
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: blueGradient,
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.1)`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = `linear-gradient(to right, ${blueDark}, #3b82f6)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = blueGradient;
                  }}
                >
                  Manage Restaurants
                </button>
              </Link>
            </CardBody>
          </Card>

          {/* User Management Card */}
          <Card className="bg-white border-0 shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full min-h-[300px]">
            <CardBody className="p-6 relative h-full flex flex-col">
              {/* Blue Icon Box */}
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke={blueColor} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>

              {/* Title & Description */}
              <Typography variant="h5" className="font-medium mb-1 text-gray-900">
                User Management
              </Typography>
              <Typography variant="small" className="text-gray-500 mb-6">
                System users & permissions
              </Typography>

              {/* Empty space to maintain height */}
              <div className="flex-grow"></div>

              {/* Button */}
              <Link to="/admin/users" className="mt-auto">
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: blueGradient,
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.1)`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = `linear-gradient(to right, ${blueDark}, #3b82f6)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = blueGradient;
                  }}
                >
                  Manage Users
                </button>
              </Link>
            </CardBody>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="border-0 shadow-xl rounded-xl mb-8 bg-white">
          <CardBody className="p-6">
            <Typography variant="h5" className="font-bold mb-6 text-gray-900">
              Quick Stats
            </Typography>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ['Total Restaurants', 142],
                ['Active Users', 856],
                ['New This Week', 24],
                ['Approval Rate', '92%'],
              ].map(([label, stat], i) => (
                <div key={i} className="bg-blue-50 p-4 rounded-lg text-center">
                  <Typography variant="h6" className="font-medium text-gray-800">
                    {label}
                  </Typography>
                  <Typography variant="h3" style={{ color: blueColor }} className="font-bold">
                    {stat}
                  </Typography>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;