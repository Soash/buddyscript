import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const Settings = () => {
    const [isDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    return (
        <div className={`_layout _layout_main_wrapper ${isDarkMode ? '_dark_wrapper' : ''}`}>
            <div className="_main_layout">
                <Navbar />

                <div className="container _custom_container" style={{ paddingTop: 24 }}>
                    <div className="_layout_inner_wrap">
                        <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                <div className="_layout_middle_wrap">
                                    <div className="_layout_middle_inner">
                                        
                                        {/* ⭐ Swapped bg-white for _layout_inner so the background flips automatically */}
                                        <div className="_b_radious6 _layout_inner overflow-hidden mb-4 shadow-sm" style={{ padding: 20 }}>
                                            {/* ⭐ Dynamic heading color */}
                                            <h3 className="mb-2" style={{ color: isDarkMode ? 'var(--bg2)' : 'var(--color6)' }}>
                                                Settings
                                            </h3>
                                            {/* ⭐ Removed text-muted, added dynamic text color */}
                                            <p className="mb-0" style={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                                                Demo page: settings options will be added here.
                                            </p>
                                        </div>

                                        {/* ⭐ Swapped bg-white for _layout_inner */}
                                        <div className="_b_radious6 _layout_inner overflow-hidden shadow-sm" style={{ padding: 20 }}>
                                            <p className="mb-2" style={{ color: isDarkMode ? 'var(--bg2)' : 'var(--color6)' }}>
                                                <strong>Demo items:</strong>
                                            </p>
                                            {/* ⭐ Dynamic list text color */}
                                            <ul className="mb-0" style={{ color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'var(--color7)' }}>
                                                <li>Account</li>
                                                <li>Privacy</li>
                                                <li>Notifications</li>
                                            </ul>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;