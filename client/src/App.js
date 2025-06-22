import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Front from './Front';
import About from './About';
import Projects from './Projects';
import Navbar from './Navbar';
import './App.css';
import SignupForm from './SignupForm';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import ProductList from './ProductList';
import ProductDetails from './ProductDetails';
import AdminPanel from './AdminPanel';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';


function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const validateAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const res = await fetch('http://localhost:4000/api/validate-token', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          setLoggedInUser(JSON.parse(userData));
        } else {
          handleLogout();
        }
      } catch (err) {
        handleLogout();
      }
    }
  };
  
  validateAuth();
}, []);

  const handleLogin = (user) => {
    setLoggedInUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token);
    console.log(' Logged in as:', user);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('Logged out')
  }
  return (
      <Router>
      <div className="App">
        <Navbar user={loggedInUser}  onLogout={handleLogout}/>
        <Routes>
          <Route path="/" element={<Front />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPanel token={localStorage.getItem('token')} /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
          <Route path="chat/:otherUserId" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
