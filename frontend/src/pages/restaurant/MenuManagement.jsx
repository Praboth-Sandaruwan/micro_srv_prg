import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Typography, 
  Button, 
  Spinner,
  Tooltip
} from '@material-tailwind/react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const MenuManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRestaurants = async () => {
      try {
        setLoading(true);
        const response = await api.get('/menu/my-restaurants');
        setRestaurants(response.data);
        
        // If restaurants exist, select the first one by default
        if (response.data.length > 0) {
          setSelectedRestaurant(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        showToast.error(error.response?.data?.message || 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchMyRestaurants();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedRestaurant) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/menu/restaurant/${selectedRestaurant}`);
        setMenuItems(response.data.menuItems);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        showToast.error(error.response?.data?.message || 'Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedRestaurant]);

  const handleRestaurantChange = (restaurantId) => {
    setSelectedRestaurant(restaurantId);
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/menu/${itemId}`);
      
      // Refresh the menu items list
      const updatedItems = menuItems.filter(item => item._id !== itemId);
      setMenuItems(updatedItems);
      
      showToast.success('Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = (restaurantId) => {
    navigate(`/restaurant/menu/add?restaurantId=${restaurantId}`);
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1280px',
      margin: '0 auto'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem' 
      }}>
        <div>
          <Typography variant="h3">Menu Management</Typography>
          <Typography variant="paragraph" color="blue-gray" style={{ marginTop: '0.5rem' }}>
            Manage your restaurant menu items
          </Typography>
        </div>
        <Link to="/restaurant/menu/add">
          <Button 
            color="blue"
            style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              fontWeight: '500',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
            }}
          >
            Add Menu Item
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spinner style={{ height: '3rem', width: '3rem', color: '#3b82f6' }} />
        </div>
      ) : restaurants.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '3rem' }}>
            <Typography variant="h5" color="blue-gray" style={{ marginBottom: '1rem' }}>
              No Restaurants Found
            </Typography>
            <Typography variant="paragraph" color="gray">
              You need to register a restaurant before adding menu items.
            </Typography>
            <Button 
              color="blue" 
              variant="gradient" 
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/restaurant/register')}
            >
              Register Restaurant
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: '2rem' }}>
            <CardHeader
              color="blue"
              style={{ 
                padding: '1rem', 
                backgroundColor: '#f8fafc', 
                borderBottom: '1px solid #e2e8f0' 
              }}
            >
              <Typography variant="h6">Select Restaurant</Typography>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {restaurants.map((restaurant) => (
                  <div key={restaurant._id} style={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      color={selectedRestaurant === restaurant._id ? "blue" : "gray"}
                      variant={selectedRestaurant === restaurant._id ? "filled" : "outlined"}
                      onClick={() => handleRestaurantChange(restaurant._id)}
                    >
                      {restaurant.name}
                    </Button>
                    <Tooltip content="Add menu item">
                      <Button
                        color="blue"
                        variant="text"
                        size="sm"
                        onClick={() => handleAddMenuItem(restaurant._id)}
                        style={{ 
                          marginLeft: '0.25rem',
                          padding: '0.3rem',
                          minWidth: 'auto',
                          borderRadius: '9999px'
                        }}
                      >
                        +
                      </Button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              color="blue"
              style={{ 
                padding: '1rem', 
                backgroundColor: '#f8fafc', 
                borderBottom: '1px solid #e2e8f0' 
              }}
            >
              <Typography variant="h6">Menu Items</Typography>
            </CardHeader>
            <CardBody>
              {menuItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Typography variant="paragraph" color="gray">
                    No menu items found. Click "Add Menu Item" to create your first menu item.
                  </Typography>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    minWidth: '800px'
                  }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: '#f8fafc', 
                        borderBottom: '1px solid #e2e8f0' 
                      }}>
                        <th style={{ 
                          padding: '1rem', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#475569',
                          fontSize: '0.875rem'
                        }}>Image</th>
                        <th style={{ 
                          padding: '1rem', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#475569',
                          fontSize: '0.875rem'
                        }}>Name</th>
                        <th style={{ 
                          padding: '1rem', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#475569',
                          fontSize: '0.875rem'
                        }}>Description</th>
                        <th style={{ 
                          padding: '1rem', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#475569',
                          fontSize: '0.875rem'
                        }}>Price</th>
                        <th style={{ 
                          padding: '1rem', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#475569',
                          fontSize: '0.875rem'
                        }}>Category</th>
                        <th style={{ 
                          padding: '1rem', 
                          textAlign: 'center', 
                          fontWeight: '600',
                          color: '#475569',
                          fontSize: '0.875rem'
                        }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((item) => (
                        <tr key={item._id} style={{ 
                          borderBottom: '1px solid #e2e8f0',
                          transition: 'background-color 0.2s'
                        }}>
                          <td style={{ 
                            padding: '1.25rem 1rem', 
                            width: '80px'
                          }}>
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover',
                                  borderRadius: '4px' 
                                }}
                              />
                            ) : (
                              <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                backgroundColor: '#e2e8f0',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8',
                                fontSize: '0.75rem'
                              }}>
                                No image
                              </div>
                            )}
                          </td>
                          <td style={{ 
                            padding: '1.25rem 1rem', 
                            color: '#334155',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>{item.name}</td>
                          <td style={{ 
                            padding: '1.25rem 1rem', 
                            color: '#334155',
                            fontSize: '0.875rem'
                          }}>{item.description}</td>
                          <td style={{ 
                            padding: '1.25rem 1rem', 
                            color: '#334155',
                            fontSize: '0.875rem'
                          }}>${item.price.toFixed(2)}</td>
                          <td style={{ 
                            padding: '1.25rem 1rem', 
                            color: '#334155',
                            fontSize: '0.875rem'
                          }}>{item.category}</td>
                          <td style={{ 
                            padding: '1rem', 
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            <Link to={`/restaurant/menu/edit/${item._id}`}>
                              <Button 
                                color="blue" 
                                size="sm" 
                                variant="outlined"
                                style={{ marginRight: '0.5rem' }}
                              >
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              color="red" 
                              size="sm" 
                              variant="outlined"
                              onClick={() => handleDeleteMenuItem(item._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};

export default MenuManagement;