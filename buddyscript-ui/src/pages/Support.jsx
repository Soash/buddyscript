import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; 

const Support = () => {
    // 1. Tell this page to check the browser's memory for the dark mode setting!
    const [isDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true'; 
    });

    return (
        // 2. We add the exact same wrapper from your Feed.jsx so the CSS works!
        <div className={`_layout _layout_main_wrapper ${isDarkMode ? "_dark_wrapper" : ""}`}>
            <div className="_main_layout">
                
                <Navbar />

                {/* The Support Content */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '70vh', 
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    <h1 style={{ 
                        fontSize: '3rem', 
                        marginBottom: '10px', 
                        color: isDarkMode ? '#ffffff' : '#112032' // Changes text to white if dark mode
                    }}>
                        🎧 Help & Support
                    </h1>
                    
                    <p style={{ 
                        fontSize: '1.2rem', 
                        marginBottom: '30px',
                        color: isDarkMode ? '#bbbbbb' : '#666', // Changes paragraph to light gray if dark mode
                        maxWidth: '600px' // Keeps the text from stretching too wide on big screens
                    }}>
                        Having trouble with BuddyScript or need to report a bug? Our team is here to help! <br /><br />
                        Please send us an email at <strong>support@buddyscript.com</strong> and we will get back to you as soon as possible.
                    </p>
                    
                    <Link to="/feed" style={{ 
                        padding: '10px 24px', 
                        backgroundColor: '#377DFF', 
                        color: '#fff', 
                        borderRadius: '6px', 
                        textDecoration: 'none',
                        fontWeight: 'bold'
                    }}>
                        Go Back to Feed
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Support;