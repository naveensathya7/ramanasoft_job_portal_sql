import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './home.css';
import FolderTable from './dash';

const CreateDash = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedView, setSelectedView] = useState('Dashboard');

    const menuItems = [
        { id: 'create', name: 'Dashboard' },
        { id: 'configure', name: 'Configure' },
        { id: 'publish', name: 'Publish' },
        { id: 'analyze', name: 'Analyze' },
    ];

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('?');
        if (tab) {
            setSelectedView(tab.charAt(0).toUpperCase() + tab.slice(1));
        }
    }, [location]);

    const handleMenuItemClick = (view) => {
        setSelectedView(view);
        navigate(`/?${view.toLowerCase()}`);
    };

    const renderContent = () => {
        switch (selectedView) {
            case 'Configure':
                return <p>Configure</p>;
            case 'Publish':
                return <p>Publish</p>;
            case 'Analyze':
                return <p>Analyze</p>;
            default:
                return <FolderTable />;
        }
    };

    return (
        <div className='create-dash'>
            <div className="top-panel">
                <ul className="menu">
                    {menuItems.map((item) => (
                        <li 
                            key={item.id} 
                            onClick={() => handleMenuItemClick(item.name)}
                            className={selectedView === item.name ? 'active' : ''}
                        >
                            {item.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    );
};

export default CreateDash;
