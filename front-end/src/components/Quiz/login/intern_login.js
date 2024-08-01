// InternLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InternLogin = () => {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/intern-login', { email, password });
      if (response.data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', response.data.userId);
        navigate(`/intern/dashboard/${response.data.userId}`);
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div>
      <h2>Intern Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={email}
          onChange={(e) => setemail(e.target.value)}
          placeholder="email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default InternLogin;
