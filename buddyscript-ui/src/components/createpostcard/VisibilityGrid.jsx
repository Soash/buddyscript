import React, { useRef, useState, useEffect } from 'react';

const VisibilityGrid = ({ visibility, setVisibility, isDarkMode }) => {

    const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // ✅ Close on outside click
    useEffect(() => {
        if (!isVisibilityMenuOpen) return;

        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsVisibilityMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisibilityMenuOpen]);

    return (

        <div 
            ref={dropdownRef}
            style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}
        >
            
            <button 
                type="button" 
                className="_right_info_btn_link" 
                onClick={() => setIsVisibilityMenuOpen(prev => !prev)} 
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 12px', borderRadius: '6px', margin: 0, height: 'auto' 
                }}
            >
                {visibility === 'public' ? '🌍 Public' : '🔒 Private'}
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                    <path fill="currentColor" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z"></path>
                </svg>
            </button>
            
            {isVisibilityMenuOpen && (
                <div 
                    className="_bs_comments_modal_content"
                    style={{ 
                        position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                        padding: '8px', zIndex: 50, minWidth: '140px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'visible',
                        width: 'auto',
                    }}
                >

                    <button 
                        type="button" 
                        className="_chat_left_dropdown_link"
                        style={{ 
                            width: '100%', textAlign: 'left', padding: '8px 12px', 
                            background: visibility === 'public' ? 'rgba(55, 125, 255, 0.15)' : 'transparent', 
                            color: isDarkMode ? 'var(--bg1)' : 'var(--color1)', 
                            borderRadius: '6px', cursor: 'pointer', display: 'block', marginBottom: '4px',
                        }} 
                        onClick={() => { 
                            setVisibility('public'); 
                            setIsVisibilityMenuOpen(false); 
                        }}
                    >
                        🌍 Public
                    </button>

                    <button 
                        type="button" 
                        className="_chat_left_dropdown_link"
                        style={{ 
                            width: '100%', textAlign: 'left', padding: '8px 12px', 
                            background: visibility === 'private' ? 'rgba(55, 125, 255, 0.15)' : 'transparent', 
                            color: isDarkMode ? 'var(--bg1)' : 'var(--color1)', 
                            borderRadius: '6px', cursor: 'pointer', display: 'block'
                        }} 
                        onClick={() => { 
                            setVisibility('private'); 
                            setIsVisibilityMenuOpen(false); 
                        }}
                    >
                        🔒 Private
                    </button>

                </div>
            )}
        </div>
    );
};

export default VisibilityGrid;

