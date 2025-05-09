// src/pages/admin/UsersList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Typography, 
  Button,
  IconButton,
  Tooltip
} from '@material-tailwind/react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';
import authService from '../../services/authService';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // In UsersList.jsx
const handleEdit = (userId) => {
    console.log("Editing user with ID:", userId); // Debug log to verify ID
    console.log("Full path:", `/admin/users/edit/${userId}`);
    navigate(`/admin/users/edit/${userId}`);
  };
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        showToast.success('User deleted successfully');
        // Refresh user list
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showToast.error('Failed to delete user');
      }
    }
  };

  const TABLE_HEAD = ["Name", "Email", "Phone", "Role", "Actions"];

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1280px',
      margin: '0 auto'
    }}>
      <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <CardHeader
          floated={false}
          variant="gradient"
          color="blue"
          style={{ 
            padding: '1.5rem',
            margin: '0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h5" color="black">
            User Management
          </Typography>
        </CardHeader>
        <CardBody style={{ padding: '1rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                minWidth: '600px'
              }}>
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head) => (
                      <th 
                        key={head}
                        style={{ 
                          borderBottom: '1px solid #e5e7eb',
                          padding: '1rem',
                          textAlign: 'left',
                          color: '#64748b',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase'
                        }}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td style={{ 
                          padding: '1rem',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <Typography variant="small" color="blue-gray">
                            {user.name}
                          </Typography>
                        </td>
                        <td style={{ 
                          padding: '1rem',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <Typography variant="small" color="blue-gray">
                            {user.email}
                          </Typography>
                        </td>
                        <td style={{ 
                          padding: '1rem',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <Typography variant="small" color="blue-gray">
                            {user.phoneNumber}
                          </Typography>
                        </td>
                        <td style={{ 
                          padding: '1rem',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <div style={{
                            backgroundColor: 
                              user.role === 'admin' ? '#3b82f6' : 
                              user.role === 'restaurant' ? '#10b981' : '#f59e0b',
                            color: 'white',
                            borderRadius: '9999px',
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            display: 'inline-block',
                            textTransform: 'capitalize'
                          }}>
                            {user.role}
                          </div>
                        </td>
                        <td style={{ 
                          padding: '1rem',
                          borderBottom: '1px solid #e5e7eb',
                          whiteSpace: 'nowrap'
                        }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Tooltip content="Edit User">
                              <IconButton
                                variant="text"
                                color="blue"
                                size="sm"
                                onClick={() => handleEdit(user._id)}
                              >
                                <PencilIcon style={{ width: '16px', height: '16px' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content="Delete User">
                              <IconButton
                                variant="text"
                                color="red"
                                size="sm"
                                onClick={() => handleDelete(user._id)}
                              >
                                <TrashIcon style={{ width: '16px', height: '16px' }} />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td 
                        colSpan={5}
                        style={{ 
                          padding: '2rem',
                          textAlign: 'center',
                          color: '#64748b'
                        }}
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default UsersList;