import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import SwitchingBtn from '../components/SwitchingBtn';
import { fetchPeopleDirectory } from '../store/peopleDirectorySlice';
import {
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    sendFriendRequest,
    toggleFollow,
    unfriend,
} from '../store/socialSlice';

const FILTERS = {
    ALL: 'all',
    FRIENDS: 'friends',
    NON_FRIENDS: 'non_friends',
    INCOMING: 'incoming',
    OUTGOING: 'outgoing',
    FOLLOWING: 'following',
    NOT_FOLLOWING: 'not_following',
};

const FindPeople = () => {
    const dispatch = useDispatch();

    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);
    const [searchQuery, setSearchQuery] = useState('');

    const { items, loading, error } = useSelector((state) => state.peopleDirectory);
    const socialPending = useSelector((state) => state.social?.pending || {});

    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        dispatch(fetchPeopleDirectory());
    }, [dispatch]);

    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery = (u) => {
            if (!q) return true;
            if (q.length < 2) return false;

            const parts = [
                u?.first_name || '',
                u?.last_name || '',
                u?.email || '',
                u?.role || '',
                u?.bio || '',
            ]
                .join(' ')
                .toLowerCase();

            // Prefix match against individual "words" to avoid matching the middle of a string.
            const tokens = parts.split(/[^a-z0-9]+/i).filter(Boolean);
            return tokens.some((t) => t.startsWith(q));
        };

        const byFilter = (u) => {
            const isFriend = Boolean(u?.is_friend);
            const incoming = u?.incoming_request_id != null;
            const outgoing = u?.outgoing_request_id != null;
            const isFollowing = Boolean(u?.is_following);

            if (activeFilter === FILTERS.FRIENDS) return isFriend;
            if (activeFilter === FILTERS.NON_FRIENDS) return !isFriend && !incoming && !outgoing;
            if (activeFilter === FILTERS.INCOMING) return incoming;
            if (activeFilter === FILTERS.OUTGOING) return outgoing;
            if (activeFilter === FILTERS.FOLLOWING) return isFollowing;
            if (activeFilter === FILTERS.NOT_FOLLOWING) return !isFollowing;
            return true;
        };

        return (Array.isArray(items) ? items : []).filter((u) => matchesQuery(u) && byFilter(u));
    }, [items, searchQuery, activeFilter]);

    const getAvatarUrl = (user) => user?.profile_photo || '/assets/images/Avatar.png';

    const getUserName = (user) => {
        return `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'User';
    };

    const getSubtitle = (user) => {
        if (user?.is_friend) return 'Friend';
        if (user?.incoming_request_id != null) return 'Incoming request';
        if (user?.outgoing_request_id != null) return 'Outgoing request';
        return user?.role || user?.bio || '';
    };

    const renderActions = (user) => {
        const userId = user?.id;
        if (!userId) return null;

        const isFollowingBusy = Boolean(socialPending?.[`follow:${userId}`]);
        const isFollowing = Boolean(user?.is_following);

        const incomingRequestId = user?.incoming_request_id;
        const outgoingRequestId = user?.outgoing_request_id;
        const isFriend = Boolean(user?.is_friend);

        const isSendBusy = Boolean(socialPending?.[`friendRequest:${userId}`]);
        const isCancelBusy = Boolean(socialPending?.[`cancelFriendRequest:${userId}`]);
        const isUnfriendBusy = Boolean(socialPending?.[`unfriend:${userId}`]);

        const isAcceptBusy = Boolean(socialPending?.[`acceptFriendRequest:${incomingRequestId}`]);
        const isDeclineBusy = Boolean(socialPending?.[`declineFriendRequest:${incomingRequestId}`]);

        const followLabel = isFollowingBusy ? '...' : isFollowing ? 'Unfollow' : 'Follow';

        const followBtn = (
            <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                disabled={isFollowingBusy}
                onClick={() => dispatch(toggleFollow(userId))}
            >
                {followLabel}
            </button>
        );

        if (incomingRequestId != null) {
            return (
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        disabled={isAcceptBusy}
                        onClick={() => dispatch(acceptFriendRequest({ userId, requestId: incomingRequestId }))}
                    >
                        {isAcceptBusy ? '...' : 'Accept'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={isDeclineBusy}
                        onClick={() => dispatch(declineFriendRequest({ userId, requestId: incomingRequestId }))}
                    >
                        {isDeclineBusy ? '...' : 'Decline'}
                    </button>
                    {followBtn}
                </div>
            );
        }

        const friendBtn = (() => {
            if (isFriend) {
                return (
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        disabled={isUnfriendBusy}
                        onClick={() => dispatch(unfriend(userId))}
                    >
                        {isUnfriendBusy ? '...' : 'Unfriend'}
                    </button>
                );
            }

            if (outgoingRequestId != null) {
                return (
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={isCancelBusy}
                        onClick={() =>
                            dispatch(cancelFriendRequest({ userId, requestId: outgoingRequestId }))
                        }
                    >
                        {isCancelBusy ? '...' : 'Cancel'}
                    </button>
                );
            }

            return (
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={isSendBusy}
                    onClick={() => dispatch(sendFriendRequest(userId))}
                >
                    {isSendBusy ? '...' : 'Add Friend'}
                </button>
            );
        })();

        return <div className="d-flex gap-2">{friendBtn}{followBtn}</div>;
    };

    const filterBtnClass = (value) =>
        `btn btn-sm ${activeFilter === value ? 'btn-primary' : 'btn-outline-secondary'}`;

    return (
        <React.Fragment>
            <div className={`_layout _layout_main_wrapper ${isDarkMode ? '_dark_wrapper' : ''}`}>
                <SwitchingBtn onToggle={() => setIsDarkMode((prev) => !prev)} />

                <div className="_main_layout">
                    <Navbar />

                    <div className="container _custom_container">
                        <div className="_layout_inner_wrap">
                            <div className="row">
                                <LeftSidebar />

                                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                    <div className="_layout_middle_wrap">
                                        <div className="_layout_middle_inner">
                                            <div
                                                className="_b_radious6 p-3"
                                                style={{
                                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                                    color: isDarkMode ? '#ffffff' : '#112032',
                                                }}
                                            >
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h5 className="mb-0">Find People</h5>
                                                </div>

                                                <form
                                                    className="_feed_right_inner_area_card_form mb-3"
                                                    onSubmit={(e) => e.preventDefault()}
                                                >
                                                    <svg
                                                        className="_feed_right_inner_area_card_form_svg"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="17"
                                                        height="17"
                                                        fill="none"
                                                        viewBox="0 0 17 17"
                                                    >
                                                        <circle cx="7" cy="7" r="6" stroke="#666"></circle>
                                                        <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3"></path>
                                                    </svg>
                                                    <input
                                                        type="search"
                                                        className="form-control me-2 _feed_right_inner_area_card_form_inpt"
                                                        placeholder="Search people..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </form>

                                                <div className="d-flex flex-wrap gap-2 mb-3">
                                                    <button
                                                        type="button"
                                                        className={filterBtnClass(FILTERS.ALL)}
                                                        onClick={() => setActiveFilter(FILTERS.ALL)}
                                                    >
                                                        All
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={filterBtnClass(FILTERS.FRIENDS)}
                                                        onClick={() => setActiveFilter(FILTERS.FRIENDS)}
                                                    >
                                                        Friends
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={filterBtnClass(FILTERS.NON_FRIENDS)}
                                                        onClick={() => setActiveFilter(FILTERS.NON_FRIENDS)}
                                                    >
                                                        Non-friends
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={filterBtnClass(FILTERS.INCOMING)}
                                                        onClick={() => setActiveFilter(FILTERS.INCOMING)}
                                                    >
                                                        Incoming Requests
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={filterBtnClass(FILTERS.OUTGOING)}
                                                        onClick={() => setActiveFilter(FILTERS.OUTGOING)}
                                                    >
                                                        Outgoing Requests
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={filterBtnClass(FILTERS.FOLLOWING)}
                                                        onClick={() => setActiveFilter(FILTERS.FOLLOWING)}
                                                    >
                                                        Following
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={filterBtnClass(FILTERS.NOT_FOLLOWING)}
                                                        onClick={() => setActiveFilter(FILTERS.NOT_FOLLOWING)}
                                                    >
                                                        Not following
                                                    </button>
                                                </div>

                                                {error ? (
                                                    <div className="alert alert-danger py-2" role="alert">
                                                        {typeof error === 'string'
                                                            ? error
                                                            : error?.detail || 'Something went wrong'}
                                                    </div>
                                                ) : null}

                                                {loading ? (
                                                    <div className="text-center py-3">
                                                        <p className="mb-0">Loading...</p>
                                                    </div>
                                                ) : filteredItems.length === 0 ? (
                                                    <div className="text-center py-3">
                                                        <p className="mb-0 text-muted">No people found.</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {filteredItems.map((user, idx) => {
                                                            const userId = user?.id;
                                                            return (
                                                                <div key={userId || idx}>
                                                                    <div className="d-flex align-items-center justify-content-between py-2">
                                                                        <div className="d-flex align-items-center">
                                                                            <Link to={`/profile/${userId}`}>
                                                                                <img
                                                                                    src={getAvatarUrl(user)}
                                                                                    alt="Avatar"
                                                                                    style={{
                                                                                        width: 44,
                                                                                        height: 44,
                                                                                        borderRadius: '50%',
                                                                                        objectFit: 'cover',
                                                                                    }}
                                                                                />
                                                                            </Link>
                                                                            <div className="ms-3">
                                                                                <Link
                                                                                    to={`/profile/${userId}`}
                                                                                    style={{
                                                                                        textDecoration: 'none',
                                                                                        color: isDarkMode ? '#ffffff' : '#112032',
                                                                                    }}
                                                                                >
                                                                                    <div style={{ fontWeight: 600 }}>{getUserName(user)}</div>
                                                                                </Link>
                                                                                <div className="text-muted" style={{ fontSize: 13 }}>
                                                                                    {getSubtitle(user)}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {renderActions(user)}
                                                                    </div>
                                                                    {idx !== filteredItems.length - 1 ? <hr className="my-2" /> : null}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
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

export default FindPeople;
