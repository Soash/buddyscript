import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchYouMightLike } from '../store/youMightLikeSlice';
import { toggleFollow } from '../store/socialSlice';
import { removeFollowingUser, upsertFollowingUser } from '../store/connectionsSlice';
import YourFriends from './rightsidebar/YourFriends';

const RightSidebar = () => {
    const dispatch = useDispatch();
    const { person, loading } = useSelector((state) => state.youMightLike || {});
    const socialPending = useSelector((state) => state.social?.pending || {});
    const followStatusByUserId = useSelector((state) => state.social?.followStatusByUserId || {});

    React.useEffect(() => {
        dispatch(fetchYouMightLike());
    }, [dispatch]);

    const getUserName = (user) => {
        return (
            `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
            user?.email ||
            'User'
        );
    };

    const avatarSrc = person?.profile_photo || '/assets/images/Avatar.png';
    const subtitle = person?.role || person?.bio || '';
    const isFollowPending = person?.id != null ? Boolean(socialPending[`follow:${person.id}`]) : false;
    const followStatus = person?.id != null ? followStatusByUserId?.[person.id] : undefined;
    const isFollowed = followStatus === 'followed';

    const handleIgnore = () => {
        dispatch(fetchYouMightLike());
    };

    const handleFollow = async () => {
        if (!person?.id) return;
        try {
            const result = await dispatch(toggleFollow(person.id)).unwrap();

            if (result?.status === 'followed') {
                dispatch(upsertFollowingUser(person));
            }
            if (result?.status === 'unfollowed') {
                dispatch(removeFollowingUser(person.id));
            }
        } catch (err) {
            console.error('Follow failed', err);
        }
    };

    return (
        <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
            <div className="_layout_right_sidebar_wrap">
                
                {/* You Might Like Section */}
                <div className="_layout_right_sidebar_inner">
                    <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area" style={{ height: '250px' }}>
                        <div className="_right_inner_area_info_content _mar_b24">
                            <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
                            <span className="_right_inner_area_info_content_txt">
                                <Link className="_right_inner_area_info_content_txt_link" to="/find-people">See All</Link>
                            </span>
                        </div>


                        <hr className="_underline" />

                        <div> 
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}></p>
                                </div>
                            ) : !person ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>No suggestions yet.</p>
                                </div>
                            ) : (
                                <div className="_right_inner_area_info_ppl">
                                    <div className="_right_inner_area_info_box">
                                        <div className="_right_inner_area_info_box_image">
                                            <Link to={`/profile/${person.id}`}>
                                                <img src={avatarSrc} alt="Image" className="_ppl_img" />
                                            </Link>
                                        </div>
                                        <div className="_right_inner_area_info_box_txt">
                                            <Link to={`/profile/${person.id}`} style={{ textDecoration: 'none' }}>
                                                <h4 className="_right_inner_area_info_box_title">{getUserName(person)}</h4>
                                            </Link>
                                            {subtitle ? (
                                                <p className="_right_inner_area_info_box_para">{subtitle}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="_right_info_btn_grp">
                                        <button type="button" className="_right_info_btn_link" onClick={handleIgnore}>
                                            Ignore
                                        </button>
                                        <button
                                            type="button"
                                            className="_right_info_btn_link _right_info_btn_link_active"
                                            onClick={handleFollow}
                                            disabled={isFollowPending}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: '115px',
                                            }}
                                        >
                                            {isFollowPending ? '...' : isFollowed ? 'Unfollow' : 'Follow'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>


                    </div>
                </div>

                {/* Your Friends Section */}
                <YourFriends />
                
            </div>
        </div>
    );
};

export default RightSidebar;

