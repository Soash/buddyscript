import React from 'react';

const PostInputArea = ({ currentUser, text, setText }) => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    return (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div>
                <img
                    src={currentUser?.profile_photo || '/assets/images/Avatar.png'}
                    alt="Profile"
                    style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                        if (!e.currentTarget.src.endsWith('/assets/images/Avatar.png')) {
                            e.currentTarget.src = '/assets/images/Avatar.png';
                        }
                    }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <textarea
                    className="form-control"
                    placeholder="Write something ..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ 
                        width: '100%', 
                        minHeight: '60px', 
                        color: isDarkMode ? '#fff' : 'var(--color1)',
                        border: 'none', 
                        backgroundColor: 'transparent',
                        resize: 'none',
                        outline: 'none',
                        fontSize: '16px'
                    }}
                />
            </div>
        </div>
    );
};

export default PostInputArea;