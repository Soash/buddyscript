import React from 'react';
import { Link } from 'react-router-dom';

const PostCardHeader = ({
    author,
    createdAt,
    visibility,
    defaultAvatarSrc = '/assets/images/Avatar.png',
    canDelete = false,
    onDelete,
    onEdit,
}) => {
    const visibilityLabel = visibility
        ? `${String(visibility).charAt(0).toUpperCase()}${String(visibility).slice(1)}`
        : '';

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const menuRef = React.useRef(null);

    React.useEffect(() => {
        if (!isMenuOpen) return;

        const handleDocClick = (e) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target)) setIsMenuOpen(false);
        };

        document.addEventListener('mousedown', handleDocClick);
        return () => document.removeEventListener('mousedown', handleDocClick);
    }, [isMenuOpen]);

    const handleDelete = () => {
        setIsMenuOpen(false);
        onDelete?.();
    };

    const handleEdit = () => {
        setIsMenuOpen(false);
        onEdit?.();
    };

    return (
        <div className="_feed_inner_timeline_post_top">
            <div className="_feed_inner_timeline_post_box">
                <div className="_feed_inner_timeline_post_box_image">
                    <Link to={`/profile/${author?.id}`}>
                        <img
                            src={author?.profile_photo || defaultAvatarSrc}
                            alt=""
                            className="_post_img"
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    </Link>
                </div>
                <div className="_feed_inner_timeline_post_box_txt">
                    <h4 className="_feed_inner_timeline_post_box_title">
                        <Link to={`/profile/${author?.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {author?.first_name || 'User'} {author?.last_name || ''}
                        </Link>
                    </h4>
                    <p className="_feed_inner_timeline_post_box_para">
                        {new Date(createdAt).toLocaleString()} .
                        <span style={{ marginLeft: '5px', fontSize: '14px' }}>{visibilityLabel}</span>
                    </p>
                </div>
            </div>

            {canDelete && (
                <div className="_feed_inner_timeline_post_box_dropdown" ref={menuRef}>
                    <button
                        type="button"
                        className="_feed_timeline_post_dropdown_link"
                        aria-label="Post menu"
                        onClick={() => setIsMenuOpen((v) => !v)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="5" r="2" fill="currentColor" opacity="0.6" />
                            <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.6" />
                            <circle cx="12" cy="19" r="2" fill="currentColor" opacity="0.6" />
                        </svg>
                    </button>

                    <div className={`_feed_timeline_dropdown delete${isMenuOpen ? ' _bs_dropdown_open' : ''}`} style={{minWidth: '170px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
                        <div className="_feed_timeline_dropdown_item" style={{ marginBottom: 0 }}>
                            <button
                                type="button"
                                className="_feed_timeline_dropdown_link"
                                onClick={handleDelete}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: 0,
                                }}
                            >
                                <span aria-hidden="true" className='delete-icon'>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M3 6h18"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M6 6l1 16a2 2 0 002 2h6a2 2 0 002-2l1-16"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M10 11v6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M14 11v6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                                Delete post
                            </button>

                            {onEdit && (
                                <button type="button" className="_feed_timeline_dropdown_link" onClick={handleEdit} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'left', padding: 0, marginTop: '10px' }}>
                                    <span aria-hidden="true" className='delete-icon'>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                    </span>
                                    Edit Post
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCardHeader;
