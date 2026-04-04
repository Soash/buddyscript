import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../store/profileSlice';
import { fetchPosts } from '../store/feedSlice';
import { sendFriendRequest, toggleFollow } from '../store/socialSlice';
import { fetchFollowing, fetchSentFriendRequests, cancelSentFriendRequest } from '../store/connectionsSlice';
import { fetchFriends, unfriendUser } from '../store/friendsSlice';
import PostCard from '../components/PostCard';
import CreatePostCard from '../components/CreatePostCard';
import EditProfileModal from '../components/EditProfileModal';
import Navbar from '../components/Navbar';
import SwitchingBtn from '../components/SwitchingBtn';

const Profile = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    
    const { activeProfile, loading: profileLoading } = useSelector(state => state.profile);
    const { posts, loading: postsLoading } = useSelector(state => state.feed);
    const { user: currentUser } = useSelector(state => state.auth);
    const pending = useSelector((state) => state.social?.pending || {});
    const followStatus = useSelector((state) => state.social?.followStatusByUserId?.[Number(id)]);

    const following = useSelector((state) => state.connections?.following || []);
    const sentRequests = useSelector((state) => state.connections?.sent || []);
    const connectionsPending = useSelector((state) => state.connections?.pending || {});

    const friends = useSelector((state) => state.friends?.items || []);
    const friendsPending = useSelector((state) => state.friends?.pending || {});

    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        dispatch(fetchUserProfile(id));
        dispatch(fetchPosts(id));

        const profileUserId = Number(id);
        const myUserId = Number(currentUser?.id);
        if (myUserId && profileUserId && myUserId !== profileUserId) {
            dispatch(fetchFollowing());
            dispatch(fetchSentFriendRequests());
            dispatch(fetchFriends());
        }
    }, [dispatch, id, currentUser?.id]);

    const isOwnProfile = Number(currentUser?.id) === Number(id);
    const displayUser = isOwnProfile ? currentUser : activeProfile;

    const profileUserId = Number(id);

    const isFriend = friends.some((u) => Number(u?.id) === profileUserId);

    const outgoingRequest = sentRequests.find(
        (r) => Number(r?.receiver?.id) === profileUserId
    );
    const outgoingRequestId = outgoingRequest?.id;

    const isFollowing =
        followStatus === 'followed' || following.some((u) => Number(u?.id) === profileUserId);

    if (profileLoading || !displayUser) return <div className="text-center mt-5"><p>Loading profile...</p></div>;

    const avatarUrl = displayUser?.profile_photo || '/assets/images/Avatar.png';

    return (
        <React.Fragment>
            <div className={`_layout _layout_main_wrapper ${isDarkMode ? "_dark_wrapper" : ""}`}>
                <SwitchingBtn onToggle={() => setIsDarkMode((prev) => !prev)} />

                <Navbar />

                {/* Profile Content */}
                <section
                    className="_layout_main_wrapper"
                    style={isDarkMode ? { background: 'var(--bg6)' } : undefined}
                >
                    <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
                            {/* Profile Header Area */}
                            <div className="_profile_header _b_radious6 bg-white overflow-hidden mb-4 shadow-sm" style={{position: 'relative'}}>
                                <div
                                    className="_profile_cover"
                                    style={{
                                        height: '250px',
                                        background: 'linear-gradient(135deg, var(--color5) 0%, var(--color9) 100%)',
                                    }}
                                ></div>
                                <div className="_profile_info p-4" style={{position: 'relative'}}>
                                    <img 
                                        src={avatarUrl} 
                                        alt="Profile" 
                                        style={{
                                            width: '120px', height: '120px', borderRadius: '50%', 
                                            position: 'absolute', top: '-60px', left: '24px',
                                            border: '4px solid white', objectFit: 'cover'
                                        }} 
                                    />
                                    <div style={{marginLeft: '140px'}}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h2 className="mb-0">{displayUser.first_name} {displayUser.last_name}</h2>
                                                {displayUser.role && <p className="text-muted mb-0">{displayUser.role}</p>}
                                            </div>
                                            {isOwnProfile ? (
                                                <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>Edit Profile</button>
                                            ) : (
                                                <div className="d-flex" style={{ gap: '8px' }}>
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        style={{ minWidth: 110 }}
                                                        disabled={!!pending[`follow:${profileUserId}`]}
                                                        onClick={() => dispatch(toggleFollow(profileUserId))}
                                                    >
                                                        {pending[`follow:${profileUserId}`]
                                                            ? '...'
                                                            : isFollowing
                                                                ? 'Unfollow'
                                                                : 'Follow'}
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        disabled={
                                                            !!pending[`friendRequest:${profileUserId}`] ||
                                                            !!friendsPending[`unfriend:${profileUserId}`] ||
                                                            (!!outgoingRequestId && !!connectionsPending[`cancel:${outgoingRequestId}`])
                                                        }
                                                        onClick={() => {
                                                            if (isFriend) {
                                                                dispatch(unfriendUser(profileUserId));
                                                                return;
                                                            }
                                                            if (outgoingRequestId) {
                                                                dispatch(
                                                                    cancelSentFriendRequest({
                                                                        requestId: outgoingRequestId,
                                                                        userId: profileUserId,
                                                                    })
                                                                );
                                                                return;
                                                            }
                                                            dispatch(sendFriendRequest(profileUserId));
                                                        }}
                                                    >
                                                        {pending[`friendRequest:${profileUserId}`] ||
                                                        friendsPending[`unfriend:${profileUserId}`] ||
                                                        (outgoingRequestId && connectionsPending[`cancel:${outgoingRequestId}`])
                                                            ? '...'
                                                            : isFriend
                                                                ? 'Unfriend'
                                                                : outgoingRequestId
                                                                    ? 'Cancel Request'
                                                                    : 'Add Friend'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-3 mb-0" style={{fontSize: '15px'}}>{displayUser.bio || 'This user has no bio.'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Posts Area */}
                            <div className="_profile_posts">
                                {isOwnProfile && <CreatePostCard />}
                                
                                <h4
                                    className="mb-4 mt-4"
                                    style={isDarkMode ? { color: 'var(--bg2)' } : undefined}
                                >
                                    Posts by {displayUser.first_name}
                                </h4>
                                
                                {postsLoading ? (
                                    <p>Loading posts...</p>
                                ) : posts.length > 0 ? (
                                    posts.map(post => <PostCard key={post.id} post={post} />)
                                ) : (
                                    <div className="text-center bg-white p-5 rounded shadow-sm">
                                        <p className="text-muted mb-0">No posts visible for this user.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Modal Container */}
                <EditProfileModal show={showEditModal} onClose={() => setShowEditModal(false)} />
                </section>
            </div>
        </React.Fragment>
    );
};

export default Profile;
