// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { Typography, Button } from '@material-tailwind/react';

const NotFoundPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <Typography variant="h1" style={{ fontSize: '6rem', fontWeight: '700', color: '#2196f3' }}>
        404
      </Typography>
      <Typography variant="h3" style={{ marginBottom: '1rem' }}>
        Page Not Found
      </Typography>
      <Typography variant="paragraph" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        Oops! We couldn't find the page you're looking for. The page might have been moved, deleted, or might never have existed.
      </Typography>
      <Button 
        variant="gradient" 
        color="blue" 
        as={Link} 
        to="/"
        style={{ padding: '0.75rem 1.5rem' }}
      >
        Go Home
      </Button>
    </div>
  );
};

export default NotFoundPage;