
import React, { useState } from 'react';
import './home.css';
// import AdminLogin from '../login/admin_login';
const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleOutsideClick = (event) => {
    if (!event.target.matches('#dropdown-btn')) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const renderContent = () => {
    switch (activeLink) {
      case 'gallery':
        return (
            "Galery"
        )


      case 'about':
        return (
            <p>About</p>
        );
      case 'contact':
        return (
            <p>contact</p>
        );
      default:
        return (
            <p>default</p>
        )
    }
  };

  return (
      <div>
        <div className="">
          <header className="header">
            <div className="logo1"></div>
            <div className="nav-links">
              <ul>

                <div className="dropdown-container">
                  <button id="dropdown-btn" className="dropdown-button" onClick={toggleDropdown}>
                    Login
                  </button>
                  {isOpen && (
                    <div className="dropdown-content">
                  <a href="/login/admin" onClick={(e) => handleLinkClick('admin', e)} className="dropdown-link">
                    Admin
                  </a>
                  <a href="/login/intern-login" className="dropdown-link">
                    Intern
                  </a>
                </div>
                  )}
                </div>
              </ul>
            </div>
          </header>
          {renderContent()}
        </div>
      </div>
  );
};

export default HomePage;