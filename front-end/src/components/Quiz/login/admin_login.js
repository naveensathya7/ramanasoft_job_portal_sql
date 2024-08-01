import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin_login.css';


function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://192.168.1.2:5000/admin_login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (response.ok) {
        console.log('Login successful');
        navigate('/admin/dashboard');
        setErrorMessage('')
      } else {
        const data = await response.json();
        setErrorMessage(data.message);
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='admin-body'>
      <div className="admin-login-container">
        <h1 className="admin-welcome-message">Welcome Back admin!</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="admin-login-form" method="POST">
          <div className="form-group">
            <label htmlFor="username" className="admin-form-label">
              Username:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="admin-form-label">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="remember-me-checkbox"
              />
              Remember me
            </label>
          </div>

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
