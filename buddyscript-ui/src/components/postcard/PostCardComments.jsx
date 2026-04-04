import React from 'react';
import { Link } from 'react-router-dom';

const PostCardComments = ({
    comments,
    postId,
    commentText,
    onChangeCommentText,
    onSubmitComment,
    defaultAvatarSrc = '/assets/images/Avatar.png',
    composerAvatarSrc,
    onToggleCommentLike,
    onOpenCommentReactors,
    onAddReply,
    previewLimitCollapsed = 1,
    previewLimitExpanded = 5,
    disableCollapseExpand = false,
}) => {
    const [visibleTopLevelCount, setVisibleTopLevelCount] = React.useState(previewLimitCollapsed);
    const [replyToCommentId, setReplyToCommentId] = React.useState(null);
    const [replyText, setReplyText] = React.useState('');
    const [expandedReplyParentIds, setExpandedReplyParentIds] = React.useState(() => new Set());

    React.useEffect(() => {
        setVisibleTopLevelCount(previewLimitCollapsed);
    }, [previewLimitCollapsed]);

    const timeAgo = (dateString) => {
        if (!dateString) return '';
        const now = Date.now();
        const ts = new Date(dateString).getTime();
        if (Number.isNaN(ts)) return '';
        const seconds = Math.max(0, Math.floor((now - ts) / 1000));
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}m`;
        return 'now';
    };

    const ordered = React.useMemo(() => {
        const list = Array.isArray(comments) ? [...comments] : [];
        // Newest first
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return list;
    }, [comments]);

    const topLevelComments = React.useMemo(() => ordered.filter((c) => !c.parent), [ordered]);
    const repliesByParentId = React.useMemo(() => {
        const map = new Map();
        for (const c of ordered) {
            if (!c?.parent) continue;
            const arr = map.get(c.parent) || [];
            arr.push(c);
            map.set(c.parent, arr);
        }
        return map;
    }, [ordered]);

    const resolvedCollapsedCount = Math.max(1, previewLimitCollapsed);
    const resolvedExpandedCount = Math.max(resolvedCollapsedCount, previewLimitExpanded);
    const canExpandCollapse = !disableCollapseExpand && resolvedExpandedCount > resolvedCollapsedCount;

    const effectiveVisibleCount = disableCollapseExpand
        ? topLevelComments.length
        : Math.min(topLevelComments.length, visibleTopLevelCount);

    const visibleTopLevelComments = topLevelComments.slice(0, effectiveVisibleCount);
    const hiddenCount = Math.max(0, topLevelComments.length - effectiveVisibleCount);

    const showViewLatest =
        !disableCollapseExpand &&
        canExpandCollapse &&
        hiddenCount > 0 &&
        effectiveVisibleCount <= resolvedCollapsedCount;

    const showViewLess =
        !disableCollapseExpand &&
        canExpandCollapse &&
        topLevelComments.length > resolvedCollapsedCount &&
        effectiveVisibleCount > resolvedCollapsedCount;

    const handleSubmitReply = (e) => {
        e.preventDefault();
        const text = replyText?.trim();
        if (!replyToCommentId || !text) return;
        onAddReply?.({ postId, parentId: replyToCommentId, text });
        setReplyText('');
        setReplyToCommentId(null);
    };

    return (
        <div className="_feed_inner_timeline_cooment_area">
            <div className="_feed_inner_comment_box">
                <form
                    className="_feed_inner_comment_box_form"
                    onSubmit={onSubmitComment}
                >
                    <div className="_feed_inner_comment_box_content">
                        <div className="_feed_inner_comment_box_content_image">
                            <img src={composerAvatarSrc || defaultAvatarSrc} alt="" className="_comment_img" />
                        </div>
                        <div className="_feed_inner_comment_box_content_txt">
                            <textarea
                                className="form-control _comment_textarea"
                                placeholder="Write a comment"
                                id="floatingTextarea2"
                                value={commentText}
                                onChange={(e) => onChangeCommentText?.(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="_feed_inner_comment_box_icon">
                        <button type="button" className="_feed_inner_comment_box_icon_btn" aria-label="Voice">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                <path
                                    fill="#000"
                                    fillOpacity=".46"
                                    fillRule="evenodd"
                                    d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>

                        <button type="button" className="_feed_inner_comment_box_icon_btn" aria-label="Image">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                <path
                                    fill="#000"
                                    fillOpacity=".46"
                                    fillRule="evenodd"
                                    d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>

                        <button type="submit" className="_feed_inner_comment_box_icon_btn" aria-label="Send comment" disabled={!commentText?.trim()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                <path
                                    fill="#000"
                                    fillOpacity=".46"
                                    fillRule="evenodd"
                                    d="M14.73 1.27a.5.5 0 01.12.52l-5 12a.5.5 0 01-.9.06L6.33 9.67 2.15 7.05a.5.5 0 01.06-.9l12-5a.5.5 0 01.52.12zM7.064 9.23l2.13 3.41L13.2 3.02 7.064 9.23zM12.98 2.8L3.36 6.806l3.41 2.13L12.98 2.8z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            <div className="_timline_comment_main">
                {showViewLatest && (
                    <div className="_previous_comment">
                        <button
                            type="button"
                            className="_previous_comment_txt"
                            onClick={() => setVisibleTopLevelCount(resolvedExpandedCount)}
                        >
                            View latest comments
                        </button>
                    </div>
                )}

                {showViewLess && (
                    <div className="_previous_comment">
                        <button
                            type="button"
                            className="_previous_comment_txt"
                            onClick={() => setVisibleTopLevelCount(resolvedCollapsedCount)}
                        >
                            View less comments
                        </button>
                    </div>
                )}

                {visibleTopLevelComments.map((c) => {
                    const replies = repliesByParentId.get(c.id) || [];
                    const avatarSrc = c.author?.profile_photo || defaultAvatarSrc;
                    const isLiked = !!c.is_liked_by_user;
                    const repliesExpanded = expandedReplyParentIds.has(c.id);

                    const toggleRepliesExpanded = () => {
                        setExpandedReplyParentIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(c.id)) next.delete(c.id);
                            else next.add(c.id);
                            return next;
                        });
                    };

                    return (
                        <div className="_comment_main" key={c.id}>
                            <div className="_comment_image">
                                <Link to={`/profile/${c.author?.id}`} className="_comment_image_link">
                                    <img src={avatarSrc} alt="" className="_comment_img1" style={{objectFit:'cover'}} />
                                </Link>
                            </div>

                            <div className="_comment_area">
                                <div className="_comment_details">
                                    <div className="_comment_details_top">
                                        <div className="_comment_name">
                                            <Link to={`/profile/${c.author?.id}`}>
                                                <h4 className="_comment_name_title">
                                                    {c.author?.first_name || 'User'} {c.author?.last_name || ''}
                                                </h4>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="_comment_status">
                                        <p className="_comment_status_text">
                                            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.content}</span>
                                        </p>
                                    </div>

                                    <div
                                        className="_total_reactions"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => onOpenCommentReactors?.(c.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                onOpenCommentReactors?.(c.id);
                                            }
                                        }}
                                    >
                                        <div className="_total_react">
                                            <span className="_reaction_like">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="feather feather-thumbs-up"
                                                >
                                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                                </svg>
                                            </span>
                                        </div>
                                        <span className="_total">{c.likes_count || 0}</span>
                                    </div>

                                    <div className="_comment_reply">
                                        <div className="_comment_reply_num">
                                            <ul className="_comment_reply_list">
                                                <li>
                                                    <span
                                                        onClick={() => onToggleCommentLike?.(c.id)}
                                                        style={isLiked ? { color: 'var(--color5)' } : undefined}
                                                        className='like-reply'
                                                    >
                                                        Like.
                                                    </span>
                                                </li>
                                                <li>
                                                    <span
                                                        onClick={() =>
                                                            setReplyToCommentId((current) => (current === c.id ? null : c.id))
                                                        }
                                                        className='like-reply'
                                                    >
                                                        Reply.
                                                    </span>
                                                </li>
                                                <li>
                                                    <span className="_time_link">{timeAgo(c.created_at)}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {replyToCommentId === c.id && (
                                    <div className="_feed_inner_comment_box _feed_inner_comment_box_reply">
                                        <form className="_feed_inner_comment_box_form" onSubmit={handleSubmitReply}>
                                            <div className="_feed_inner_comment_box_content">
                                                <div className="_feed_inner_comment_box_content_image">
                                                    <img
                                                        src={composerAvatarSrc || defaultAvatarSrc}
                                                        alt=""
                                                        className="_comment_img"
                                                    />
                                                </div>
                                                <div className="_feed_inner_comment_box_content_txt">
                                                    <textarea
                                                        className="form-control _comment_textarea"
                                                        placeholder="Write a reply"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="_feed_inner_comment_box_icon">
                                                <button type="button" className="_feed_inner_comment_box_icon_btn" aria-label="Voice">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                                        <path
                                                            fill="#000"
                                                            fillOpacity=".46"
                                                            fillRule="evenodd"
                                                            d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>

                                                <button type="button" className="_feed_inner_comment_box_icon_btn" aria-label="Image">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                                        <path
                                                            fill="#000"
                                                            fillOpacity=".46"
                                                            fillRule="evenodd"
                                                            d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="_feed_inner_comment_box_icon_btn"
                                                    aria-label="Send reply"
                                                    disabled={!replyText?.trim()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                                        <path
                                                            fill="#000"
                                                            fillOpacity=".46"
                                                            fillRule="evenodd"
                                                            d="M14.73 1.27a.5.5 0 01.12.52l-5 12a.5.5 0 01-.9.06L6.33 9.67 2.15 7.05a.5.5 0 01.06-.9l12-5a.5.5 0 01.52.12zM7.064 9.23l2.13 3.41L13.2 3.02 7.064 9.23zM12.98 2.8L3.36 6.806l3.41 2.13L12.98 2.8z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {replies.length > 0 && (
                                    <div className="_previous_comment" style={{ marginLeft: '60px', marginTop: '12px' }}>
                                        <button type="button" className="_previous_comment_txt" onClick={toggleRepliesExpanded}>
                                            {repliesExpanded
                                                ? replies.length === 1
                                                    ? 'Hide reply'
                                                    : 'Hide replies'
                                                : replies.length === 1
                                                  ? 'View reply'
                                                  : 'View replies'}
                                        </button>
                                    </div>
                                )}

                                {replies.length > 0 && repliesExpanded && (
                                    <div style={{ marginLeft: '60px', marginTop: '12px' }}>
                                        {replies.map((r) => {
                                            const replyAvatarSrc = r.author?.profile_photo || defaultAvatarSrc;
                                            const replyIsLiked = !!r.is_liked_by_user;

                                            return (
                                                <div className="_comment_main" key={r.id}>
                                                    <div className="_comment_image">
                                                        <Link to={`/profile/${r.author?.id}`} className="_comment_image_link">
                                                            <img src={replyAvatarSrc} alt="" className="_comment_img1" style={{objectFit:'cover'}}/>
                                                        </Link>
                                                    </div>
                                                    <div className="_comment_area">
                                                        <div className="_comment_details">
                                                            <div className="_comment_details_top">
                                                                <div className="_comment_name">
                                                                    <Link to={`/profile/${r.author?.id}`}>
                                                                        <h4 className="_comment_name_title">
                                                                            {r.author?.first_name || 'User'} {r.author?.last_name || ''}
                                                                        </h4>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                            <div className="_comment_status">
                                                                <p className="_comment_status_text">
                                                                    <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.content}</span>
                                                                </p>
                                                            </div>
                                                            <div
                                                                className="_total_reactions"
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => onOpenCommentReactors?.(r.id)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                        e.preventDefault();
                                                                        onOpenCommentReactors?.(r.id);
                                                                    }
                                                                }}
                                                            >
                                                                <div className="_total_react">
                                                                    <span className="_reaction_like">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            className="feather feather-thumbs-up"
                                                                        >
                                                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                                <span className="_total">{r.likes_count || 0}</span>
                                                            </div>
                                                            <div className="_comment_reply">
                                                                <div className="_comment_reply_num">
                                                                    <ul className="_comment_reply_list">
                                                                        <li>
                                                                            <span
                                                                                onClick={() => onToggleCommentLike?.(r.id)}
                                                                                style={replyIsLiked ? { color: 'var(--color5)' } : undefined}
                                                                            >
                                                                                Like.
                                                                            </span>
                                                                        </li>
                                                                        <li>
                                                                            <span className="_time_link">{timeAgo(r.created_at)}</span>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PostCardComments;
