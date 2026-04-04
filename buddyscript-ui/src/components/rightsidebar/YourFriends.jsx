import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFriends } from '../../store/friendsSlice';

const YourFriends = () => {
    const dispatch = useDispatch();
    const friends = useSelector((state) => state.friends.items);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchFriends());
    }, [dispatch]);

    const filteredFriends = useMemo(() => {
        const raw = Array.isArray(friends) ? friends : [];
        const q = (searchQuery || '').trim().toLowerCase();
        if (!q) return raw;

        return raw.filter((friend) => {
            const firstName = friend?.first_name || '';
            const lastName = friend?.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const email = friend?.email || '';
            const role = friend?.role || '';
            const haystack = `${fullName} ${email} ${role}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [friends, searchQuery]);

    const displayedFriends = useMemo(() => {
        return (filteredFriends || []).slice(0, 10);
    }, [filteredFriends]);

    return (
        <div className="_layout_right_sidebar_inner">
            <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                
                {/* Search & Header Section */}
                <div className="_feed_top_fixed">
                    <div className="_feed_right_inner_area_card_content _mar_b24">
                        <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
                        <span className="_feed_right_inner_area_card_content_txt">
                            <Link className="_feed_right_inner_area_card_content_txt_link" to="/connections#friends">See All</Link>
                        </span>
                    </div>
                    <form
                        className="_feed_right_inner_area_card_form"
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                            <circle cx="7" cy="7" r="6" stroke="#666"></circle>
                            <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3"></path>
                        </svg>
                        <input
                            className="form-control me-2 _feed_right_inner_area_card_form_inpt"
                            type="search"
                            placeholder="Search friends..."
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                {/* Friends List Section */}
                <div className="_feed_bottom_fixed">
                    {filteredFriends.length === 0 ? (
                        <div className="_padd_t24 _padd_b24">
                            <p className="_feed_right_inner_area_card_ppl_para" style={{ margin: 0 }}>
                                {Array.isArray(friends) && friends.length > 0
                                    ? 'No matches found.'
                                    : 'No friends yet.'}
                            </p>
                        </div>
                    ) : (
                    displayedFriends.map((friend) => {
                        const firstName = friend?.first_name || '';
                        const lastName = friend?.last_name || '';
                        const fullName = `${firstName} ${lastName}`.trim();
                        const displayName = fullName || friend?.email || 'User';
                        const profilePhoto = friend?.profile_photo || '/assets/images/people1.png';

                        return (
                        <div key={friend.id} className="_feed_right_inner_area_card_ppl">
                            <div className="_feed_right_inner_area_card_ppl_box">
                                <div className="_feed_right_inner_area_card_ppl_image">
                                    {/* I updated these standard <a> tags to React <Link> components! */}
                                    <Link to={`/profile/${friend.id}`}>
                                        <img src={profilePhoto} alt={displayName} className="_box_ppl_img" />
                                    </Link>
                                </div>
                                <div className="_feed_right_inner_area_card_ppl_txt">
                                    <Link to={`/profile/${friend.id}`} style={{ textDecoration: 'none' }}>
                                        <h4 className="_feed_right_inner_area_card_ppl_title">{displayName}</h4>
                                    </Link>
                                    <p className="_feed_right_inner_area_card_ppl_para">{friend.role}</p>
                                </div>
                            </div>
                            
                            {/* Status indicator: fixed green "online" dot for now */}
                            <div className="_feed_right_inner_area_card_ppl_side">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
                                    <rect width="12" height="12" x="1" y="1" fill="#0ACF83" stroke="#fff" strokeWidth="2" rx="6"></rect>
                                </svg>
                            </div>
                        </div>
                        );
                    }))}
                </div>
            </div>
        </div>
    );
};

export default YourFriends;