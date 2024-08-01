import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './dashboard.css';
import QuizDash from './quiz/quizdash';
import SubmissionsList from './interns_data/formdetails';
const AdminDash = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedView, setSelectedView] = useState('Create');

    const menuItems = [
        { id: 'option1', name: 'Option01' },
        { id: 'option2', name: 'Interns_list' },
        { id: 'Job', name: 'Job' },
        { id: 'Quiz', name: 'Quiz' },
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
        navigate(`/admin/dashboard?${view.toLowerCase()}`);
    };

    const renderContent = () => {
        switch (selectedView) {
            case 'option1':
                return <p>Option 01</p>;
            case 'Interns_list':
                return <SubmissionsList />
            case 'Quiz':
                return <QuizDash/>
            default:
                return <p>Default</p>;
        }
    };

    return (
        <div className='Navbody'>
            <div className="top-panel">
                <ul className="menu2">
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

export default AdminDash;
