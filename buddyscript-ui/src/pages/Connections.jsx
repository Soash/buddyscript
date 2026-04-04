import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import SwitchingBtn from '../components/SwitchingBtn';
import {
    acceptIncomingFriendRequest,
    cancelSentFriendRequest,
    declineIncomingFriendRequest,
    fetchFollowing,
    fetchIncomingFriendRequests,
    fetchSentFriendRequests,
    removeFollowingUser,
    upsertFollowingUser,
} from '../store/connectionsSlice';
import { toggleFollow } from '../store/socialSlice';
import { fetchFriends, unfriendUser } from '../store/friendsSlice';

const TABS = {
    INCOMING: 'incoming',
    SENT: 'sent',
    FOLLOWING: 'following',
    FRIENDS: 'friends',
};

const Connections = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(TABS.INCOMING);
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [followingSearchQuery, setFollowingSearchQuery] = useState('');
    const [friendsSearchQuery, setFriendsSearchQuery] = useState('');

    const { incoming, sent, following, loading, pending, error } = useSelector(
        (state) => state.connections
    );
    const socialPending = useSelector((state) => state.social?.pending || {});

    const friends = useSelector((state) => state.friends?.items || []);
    const friendsLoading = useSelector((state) => state.friends?.loading || false);
    const friendsPending = useSelector((state) => state.friends?.pending || {});

    useEffect(() => {
        dispatch(fetchIncomingFriendRequests());
        dispatch(fetchSentFriendRequests());
        dispatch(fetchFollowing());
        dispatch(fetchFriends());
    }, [dispatch]);

    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        const hash = (location.hash || '').toLowerCase();
        if (hash === '#send-request') {
            setActiveTab(TABS.SENT);
            return;
        }
        if (hash === '#following') {
            setActiveTab(TABS.FOLLOWING);
            return;
        }
        if (hash === '#friends') {
            setActiveTab(TABS.FRIENDS);
            return;
        }
        if (hash === '#friend-request' || hash === '' || hash === '#') {
            setActiveTab(TABS.INCOMING);
        }
    }, [location.hash]);

    const setTabAndHash = (tab) => {
        setActiveTab(tab);

        const hash =
            tab === TABS.INCOMING
                ? '#friend-request'
                : tab === TABS.SENT
                ? '#send-request'
                : tab === TABS.FOLLOWING
                ? '#following'
                : '#friends';

        if (window.location.hash !== hash) {
            window.location.hash = hash;
        }
    };

    const items = useMemo(() => {
        if (activeTab === TABS.INCOMING) return incoming;
        if (activeTab === TABS.SENT) return sent;

        const matchesQuery = (user, query) => {
            const q = (query || '').trim().toLowerCase();
            if (!q) return true;
            const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
            const email = user?.email || '';
            const role = user?.role || '';
            const haystack = `${name} ${email} ${role}`.toLowerCase();
            return haystack.includes(q);
        };

        if (activeTab === TABS.FOLLOWING) {
            return (following || []).filter((u) => matchesQuery(u, followingSearchQuery));
        }

        return (friends || []).filter((u) => matchesQuery(u, friendsSearchQuery));
    }, [activeTab, incoming, sent, following, friends, followingSearchQuery, friendsSearchQuery]);

    const isLoading =
        (activeTab === TABS.INCOMING && loading.incoming) ||
        (activeTab === TABS.SENT && loading.sent) ||
        (activeTab === TABS.FOLLOWING && loading.following) ||
        (activeTab === TABS.FRIENDS && friendsLoading);

    const getAvatarUrl = (user) => {
        return user?.profile_photo || '/assets/images/Avatar.png';
    };

    const getUserName = (user) => {
        return `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'User';
    };

    const renderRow = (item) => {
        if (activeTab === TABS.INCOMING) {
            const user = item?.sender;
            const requestId = item?.id;
            const isAcceptPending = Boolean(pending?.[`accept:${requestId}`]);
            const isPending = Boolean(pending?.[`decline:${requestId}`]);

            return (
                <div key={requestId} className="d-flex align-items-center justify-content-between py-2">
                    <div className="d-flex align-items-center">
                        <img
                            src={getAvatarUrl(user)}
                            alt="Avatar"
                            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div className="ms-3">
                            <div style={{ fontWeight: 600 }}>{getUserName(user)}</div>
                            <div className="text-muted" style={{ fontSize: 13 }}>
                                Friend request
                            </div>
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            disabled={isAcceptPending}
                            onClick={() => dispatch(acceptIncomingFriendRequest(requestId))}
                        >
                            {isAcceptPending ? '...' : 'Accept'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={isPending}
                            onClick={() => dispatch(declineIncomingFriendRequest(requestId))}
                        >
                            {isPending ? '...' : 'Delete'}
                        </button>
                    </div>
                </div>
            );
        }

        if (activeTab === TABS.SENT) {
            const user = item?.receiver;
            const requestId = item?.id;
            const isPending = Boolean(pending?.[`cancel:${requestId}`]);

            return (
                <div key={requestId} className="d-flex align-items-center justify-content-between py-2">
                    <div className="d-flex align-items-center">
                        <img
                            src={getAvatarUrl(user)}
                            alt="Avatar"
                            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div className="ms-3">
                            <div style={{ fontWeight: 600 }}>{getUserName(user)}</div>
                            <div className="text-muted" style={{ fontSize: 13 }}>
                                Request sent
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={isPending}
                        onClick={() =>
                            dispatch(cancelSentFriendRequest({ requestId, userId: user?.id }))
                        }
                    >
                        {isPending ? '...' : 'Cancel'}
                    </button>
                </div>
            );
        }

        if (activeTab === TABS.FRIENDS) {
            const user = item;
            const userId = user?.id;
            const isPending = Boolean(friendsPending?.[`unfriend:${userId}`]);

            return (
                <div key={userId} className="d-flex align-items-center justify-content-between py-2">
                    <div className="d-flex align-items-center">
                        <img
                            src={getAvatarUrl(user)}
                            alt="Avatar"
                            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div className="ms-3">
                            <div style={{ fontWeight: 600 }}>{getUserName(user)}</div>
                            <div className="text-muted" style={{ fontSize: 13 }}>
                                Friend
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        disabled={isPending}
                        onClick={() => {
                            if (!userId) return;
                            dispatch(unfriendUser(userId));
                        }}
                    >
                        {isPending ? '...' : 'Unfriend'}
                    </button>
                </div>
            );
        }

        const user = item;
        const userId = user?.id;
        const isPending = Boolean(socialPending?.[`follow:${userId}`]);

        return (
            <div key={userId} className="d-flex align-items-center justify-content-between py-2">
                <div className="d-flex align-items-center">
                    <img
                        src={getAvatarUrl(user)}
                        alt="Avatar"
                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div className="ms-3">
                        <div style={{ fontWeight: 600 }}>{getUserName(user)}</div>
                        <div className="text-muted" style={{ fontSize: 13 }}>
                            Following
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    disabled={isPending}
                    onClick={async () => {
                        if (!userId) return;
                        dispatch(removeFollowingUser(userId));
                        try {
                            await dispatch(toggleFollow(userId)).unwrap();
                        } catch (err) {
                            dispatch(upsertFollowingUser(user));
                        }
                    }}
                >
                    {isPending ? '...' : 'Unfollow'}
                </button>
            </div>
        );
    };

    // ⭐ Helper function to style the tabs dynamically based on Dark Mode!
    const getTabStyle = (tabName) => {
        const isActive = activeTab === tabName;
        
        if (isDarkMode) {
            return {
                // Active merges with the container below it, Inactive stays slightly darker
                backgroundColor: isActive ? 'rgb(30, 41, 59)' : '#253041', 
                
                // Active text is bright white, Inactive text is muted gray
                color: isActive ? '#ffffff' : '#8a99af',               
                
                // Active keeps top/side borders but hides the bottom. Inactive keeps all borders.
                borderColor: isActive ? '#444 #444 transparent #444' : '#444', 
                
                // Active has NO bottom border so it perfectly connects to the main box
                borderBottom: isActive ? '1px solid rgb(30, 41, 59)' : 'none' 
            };
        }
        
        // In Light Mode, we return an empty object and let standard Bootstrap take over!
        return {}; 
    };

    return (
        <React.Fragment>
            <div className={`_layout _layout_main_wrapper ${isDarkMode ? "_dark_wrapper" : ""}`}>

                <SwitchingBtn onToggle={() => setIsDarkMode((prev) => !prev)} />

                <div className="_main_layout">
                    <Navbar />

                    <div className="container _custom_container">
                        <div className="_layout_inner_wrap">
                            <div className="row">
                                <LeftSidebar />

                                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                    {/*<div className="_layout_middle_wrap">
                                        <div className="_layout_middle_inner">
                                    */}
                                    <div  className="_layout_middle_wrap" style={{height: '90vh'}}>
                                        <div className="_layout_middle_inner">
                                            <div 
                                                className="_b_radious6 p-3" 
                                                style={{ 
                                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', // Uses a nice dark navy in dark mode
                                                    color: isDarkMode ? '#ffffff' : '#112032' 
                                                }}
                                            >
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h5 className="mb-0">Connections</h5>
                                                </div>

                                                <ul className="nav nav-tabs">
                                                    <li className="nav-item">
                                                        <button
                                                            type="button"
                                                            className={`nav-link ${activeTab === TABS.INCOMING ? 'active' : ''}`}
                                                            onClick={() => setTabAndHash(TABS.INCOMING)}
                                                            style={getTabStyle(TABS.INCOMING)}
                                                        >
                                                            Friend Request
                                                        </button>
                                                    </li>
                                                    <li className="nav-item">
                                                        <button
                                                            type="button"
                                                            className={`nav-link ${activeTab === TABS.SENT ? 'active' : ''}`}
                                                            onClick={() => setTabAndHash(TABS.SENT)}
                                                            style={getTabStyle(TABS.SENT)}
                                                        >
                                                            Sent Request
                                                        </button>
                                                    </li>
                                                    <li className="nav-item">
                                                        <button
                                                            type="button"
                                                            className={`nav-link ${activeTab === TABS.FOLLOWING ? 'active' : ''}`}
                                                            onClick={() => setTabAndHash(TABS.FOLLOWING)}
                                                            style={getTabStyle(TABS.FOLLOWING)}
                                                        >
                                                            Following
                                                        </button>
                                                    </li>
                                                    <li className="nav-item">
                                                        <button
                                                            type="button"
                                                            className={`nav-link ${activeTab === TABS.FRIENDS ? 'active' : ''}`}
                                                            onClick={() => setTabAndHash(TABS.FRIENDS)}
                                                            style={getTabStyle(TABS.FRIENDS)}
                                                        >
                                                            Friends
                                                        </button>
                                                    </li>
                                                </ul>

                                                <div className="pt-3">
                                                    {(activeTab === TABS.FOLLOWING || activeTab === TABS.FRIENDS) && (
                                                        <form
                                                            className="_feed_right_inner_area_card_form mb-3"
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                                                                <circle cx="7" cy="7" r="6" stroke="#666"></circle>
                                                                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3"></path>
                                                            </svg>
                                                            <input
                                                                type="search"
                                                                className="form-control me-2 _feed_right_inner_area_card_form_inpt"
                                                                placeholder={
                                                                    activeTab === TABS.FOLLOWING
                                                                        ? 'Search following...'
                                                                        : 'Search friends...'
                                                                }
                                                                value={
                                                                    activeTab === TABS.FOLLOWING
                                                                        ? followingSearchQuery
                                                                        : friendsSearchQuery
                                                                }
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (activeTab === TABS.FOLLOWING) {
                                                                        setFollowingSearchQuery(value);
                                                                        return;
                                                                    }
                                                                    setFriendsSearchQuery(value);
                                                                }}
                                                            />
                                                        </form>
                                                    )}

                                                    {error && (
                                                        <div className="alert alert-danger py-2" role="alert">
                                                            {typeof error === 'string' ? error : error?.detail || 'Something went wrong'}
                                                        </div>
                                                    )}

                                                    {isLoading ? (
                                                        <div className="text-center py-3">
                                                            <p className="mb-0">Loading...</p>
                                                        </div>
                                                    ) : items.length === 0 ? (
                                                        <div className="text-center py-3">
                                                            <p className="mb-0 text-muted">No data</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            {items.map((item, idx) => (
                                                                <div key={item?.id || item?.created_at || idx}>
                                                                    {renderRow(item)}
                                                                    {idx !== items.length - 1 && <hr className="my-2" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <RightSidebar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Connections;
