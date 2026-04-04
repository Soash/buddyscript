import React, { useState } from 'react';

// 1. We create a fake "database" of notifications so we don't repeat HTML!
const mockNotifications = [
    { id: 1, name: "Steve Jobs", action: "posted a link in your timeline.", time: "42 minutes ago", image: "assets/images/friend-req.png", isRead: false },
    { id: 2, name: "Admin", action: "changed the name of the group Freelancer usa.", time: "1 hour ago", image: "assets/images/profile-1.png", isRead: true },
    { id: 3, name: "Ryan Roslansky", action: "commented on your photo.", time: "2 hours ago", image: "assets/images/friend-req.png", isRead: false },
    { id: 4, name: "Dylan Field", action: "liked your recent post.", time: "1 day ago", image: "assets/images/profile-1.png", isRead: true },
];

const NotificationDropdown = ({ isOpen }) => {
    // 2. Create a switch to remember which tab is currently active ('all' or 'unread')
    const [activeTab, setActiveTab] = useState('all');

    // 3. Filter the data! If tab is 'unread', only keep the ones where isRead is false.
    const displayedNotifications = activeTab === 'unread' 
        ? mockNotifications.filter(notification => notification.isRead === false)
        : mockNotifications;

    return (
        <div 
            id="_notify_drop" 
            className="_notification_dropdown"
            onClick={(e) => e.stopPropagation()}
            style={{ 
                display: isOpen ? 'block' : 'none',
                opacity: isOpen ? 1 : 0,             
                visibility: isOpen ? 'visible' : 'hidden',
                left: "-95px" 
            }}
        >
            <div className="_notifications_content">
                <h4 className="_notifications_content_title">Notifications</h4>
                <div className="_notification_box_right">
                    <button type="button" className="_notification_box_right_link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                            <circle cx="2" cy="2" r="2" fill="#C4C4C4"></circle>
                            <circle cx="2" cy="8" r="2" fill="#C4C4C4"></circle>
                            <circle cx="2" cy="15" r="2" fill="#C4C4C4"></circle>
                        </svg>
                    </button>
                    <div className="_notifications_drop_right">
                        <ul className="_notification_list">
                            <li className="_notification_item"><span className="_notification_link">Mark as all read</span></li>
                            <li className="_notification_item"><span className="_notification_link">Notifications settings</span></li>
                            <li className="_notification_item"><span className="_notification_link">Open Notifications</span></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="_notifications_drop_box">
                
                <div className="_notifications_drop_btn_grp">
                    <button 
                        className={activeTab === 'all' ? "_notifications_btn_link" : "_notifications_btn_link1"} 
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </button>

                    <button 
                        className={activeTab === 'unread' ? "_notifications_btn_link" : "_notifications_btn_link1"} 
                        onClick={() => setActiveTab('unread')}
                        /* ⭐ NEW: Only applies the 10px margin if the tab is actively on 'unread' */
                        style={{ marginLeft: activeTab === 'unread' ? '10px' : '0' }} 
                    >
                        Unread
                    </button>
                </div>

                <div className="_notifications_all">
                    {/* 5. Loop through the filtered list and draw the HTML dynamically! */}
                    {displayedNotifications.length > 0 ? (
                        displayedNotifications.map((note) => (
                            <div className="_notification_box" key={note.id} style={{ backgroundColor: note.isRead ? 'transparent' : 'rgba(55, 125, 255, 0.15)' }}>
                                <div className="_notification_image">
                                    <img src={note.image} alt="Profile" className="_notify_img" />
                                </div>
                                <div className="_notification_txt">
                                    <p className="_notification_para">
                                        <span className="_notify_txt_link">{note.name}</span> {note.action}
                                    </p>
                                    <div className="_nitification_time">
                                        <span>{note.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No unread notifications!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationDropdown;