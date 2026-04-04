import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    togglePostReaction,
    addComment,
    addReply,
    toggleCommentLike,
    fetchPostReactors,
    fetchCommentReactors,
    deletePost,
} from '../store/feedSlice';
import { Link } from 'react-router-dom';

import PostCardHeader from './postcard/PostCardHeader';
import PostCardMedia from './postcard/PostCardMedia';
import PostCardImageModal from './postcard/PostCardImageModal';
import PostCardReactsSummary from './postcard/PostCardReactsSummary';
import PostCardReactionBar from './postcard/PostCardReactionBar';
import PostCardComments from './postcard/PostCardComments';
import PostCardCommentsModal from './postcard/PostCardCommentsModal';
import PostCardReactorsModal from './postcard/PostCardReactorsModal';

const REACTION_COLORS = {
    like: '#1877F2',
    love: '#F33E58',
    haha: '#F7B125',
};

const ReactionMiniIcon = ({ type }) => {
    const t = type || 'like';
    const color = REACTION_COLORS[t] || 'currentColor';

    if (t === 'love') {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={color}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        );
    }

    if (t === 'haha') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 19 19" aria-hidden="true">
                <path fill={REACTION_COLORS.haha} d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
                <path
                    fill="#664500"
                    d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"
                />
                <path
                    fill="#fff"
                    d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z"
                />
                <path
                    fill="#664500"
                    d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
                />
            </svg>
        );
    }

    // like (default)
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
    );
};

const PostCard = ({ post }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.auth?.user);
    const [commentText, setCommentText] = React.useState('');
    const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
    const [activeImageIndex, setActiveImageIndex] = React.useState(0);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = React.useState(false);
    const [isPostReactorsModalOpen, setIsPostReactorsModalOpen] = React.useState(false);
    const [isCommentReactorsModalOpen, setIsCommentReactorsModalOpen] = React.useState(false);
    const [activeCommentIdForReactors, setActiveCommentIdForReactors] = React.useState(null);

    const defaultAvatarSrc = '/assets/images/Avatar.png';
    const composerAvatarSrc = currentUser?.profile_photo || defaultAvatarSrc;

    const postReactors = useSelector((state) => state.feed.reactorsByPostId?.[post.id] || []);
    const postReactorsLoading = useSelector((state) => state.feed.reactorsLoadingByPostId?.[post.id]);
    const activeCommentReactors = useSelector((state) =>
        activeCommentIdForReactors ? state.feed.reactorsByCommentId?.[activeCommentIdForReactors] || [] : []
    );
    const activeCommentReactorsLoading = useSelector((state) =>
        activeCommentIdForReactors ? state.feed.reactorsLoadingByCommentId?.[activeCommentIdForReactors] : false
    );

    const images = (Array.isArray(post.images) && post.images.length > 0)
        ? post.images
        : (post.image ? [{ id: null, image: post.image, caption: '', position: 0 }] : []);
    const userReactionType = post.user_reaction_type || (post.is_liked_by_user ? 'like' : null);

    const openImageModal = (index) => {
        setActiveImageIndex(index);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
    };

    const goPrevImage = () => {
        setActiveImageIndex((current) => {
            if (images.length === 0) return 0;
            return (current - 1 + images.length) % images.length;
        });
    };

    const goNextImage = () => {
        setActiveImageIndex((current) => {
            if (images.length === 0) return 0;
            return (current + 1) % images.length;
        });
    };

    const handleReact = (type) => {
        dispatch(togglePostReaction({ postId: post.id, type }));
        if (post.visibility === 'public') {
            dispatch(fetchPostReactors(post.id));
        }
    };

    const handleComment = (e) => {
        e.preventDefault();
        if(!commentText) return;
        dispatch(addComment({ postId: post.id, text: commentText }));
        setCommentText('');
    };

    const handleToggleCommentLike = (commentId) => {
        dispatch(toggleCommentLike(commentId));
        dispatch(fetchCommentReactors(commentId));
    };

    const handleAddReply = ({ parentId, text }) => {
        dispatch(addReply({ postId: post.id, parentId, text }));
    };

    const canDelete = !!currentUser?.id && currentUser.id === post.author?.id;

    const handleDeletePost = () => {
        if (!canDelete) return;
        const ok = window.confirm('Delete this post?');
        if (!ok) return;
        dispatch(deletePost(post.id));
    };

    const openCommentsModal = () => {
        setIsCommentsModalOpen(true);
    };

    const closeCommentsModal = () => {
        setIsCommentsModalOpen(false);
    };

    const openPostReactorsModal = () => {
        setIsPostReactorsModalOpen(true);
        if (post.visibility === 'public') {
            dispatch(fetchPostReactors(post.id));
        }
    };

    const closePostReactorsModal = () => {
        setIsPostReactorsModalOpen(false);
    };

    const openCommentReactorsModal = (commentId) => {
        if (!commentId) return;
        setActiveCommentIdForReactors(commentId);
        setIsCommentReactorsModalOpen(true);
        dispatch(fetchCommentReactors(commentId));
    };

    const closeCommentReactorsModal = () => {
        setIsCommentReactorsModalOpen(false);
        setActiveCommentIdForReactors(null);
    };

    const formatReactionType = (t) => {
        if (t === 'love') return 'Love';
        if (t === 'haha') return 'Haha';
        return 'Like';
    };

    return (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
            <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                <PostCardHeader
                    author={post.author}
                    createdAt={post.created_at}
                    visibility={post.visibility}
                    defaultAvatarSrc={defaultAvatarSrc}
                    canDelete={canDelete}
                    onDelete={handleDeletePost}
                />
                {post.content && <h4 className="_feed_inner_timeline_post_title" style={{marginTop: "16px"}}>{post.content}</h4>}
                <PostCardMedia images={images} onOpenImage={openImageModal} />
            </div>

            <PostCardImageModal
                isOpen={isImageModalOpen}
                images={images}
                activeIndex={activeImageIndex}
                onClose={closeImageModal}
                onPrev={goPrevImage}
                onNext={goNextImage}
            />
            
            <PostCardReactsSummary
                visibility={post.visibility}
                likesCount={post.likes_count}
                commentsCount={post.comments_count}
                latestReactors={post.latest_reactors}
                onOpenReactors={openPostReactorsModal}
                defaultAvatarSrc={defaultAvatarSrc}
            />

            <PostCardReactionBar userReactionType={userReactionType} onReact={handleReact} onComment={openCommentsModal} />

            <PostCardComments
                comments={post.comments || []}
                postId={post.id}
                commentText={commentText}
                onChangeCommentText={setCommentText}
                onSubmitComment={handleComment}
                defaultAvatarSrc={defaultAvatarSrc}
                composerAvatarSrc={composerAvatarSrc}
                onToggleCommentLike={handleToggleCommentLike}
                onOpenCommentReactors={openCommentReactorsModal}
                onAddReply={handleAddReply}
                previewLimitCollapsed={1}
                previewLimitExpanded={5}
            />

            <PostCardCommentsModal isOpen={isCommentsModalOpen} onClose={closeCommentsModal}>
                <PostCardComments
                    comments={post.comments || []}
                    postId={post.id}
                    commentText={commentText}
                    onChangeCommentText={setCommentText}
                    onSubmitComment={handleComment}
                    defaultAvatarSrc={defaultAvatarSrc}
                    composerAvatarSrc={composerAvatarSrc}
                    onToggleCommentLike={handleToggleCommentLike}
                    onOpenCommentReactors={openCommentReactorsModal}
                    onAddReply={handleAddReply}
                    disableCollapseExpand
                />
            </PostCardCommentsModal>

            <PostCardReactorsModal isOpen={isPostReactorsModalOpen} onClose={closePostReactorsModal} title="Reactions">
                {post.visibility !== 'public' ? (
                    <p className="_bs_reactors_empty">Reactions are not available for private posts.</p>
                ) : postReactorsLoading ? (
                    <p className="_bs_reactors_empty">Loading reactions...</p>
                ) : (postReactors || []).length === 0 ? (
                    <p className="_bs_reactors_empty">No reactions yet.</p>
                ) : (
                    <ul className="_bs_reactors_list">
                        {postReactors.map((r, idx) => (
                            <li key={`${r?.user?.id || 'u'}-${idx}`} className="_bs_reactors_item">
                                <div className="_bs_reactors_left">
                                    <img
                                        src={r?.user?.profile_photo || defaultAvatarSrc}
                                        alt=""
                                        className="_bs_reactors_avatar"
                                    />
                                    <div className="_bs_reactors_meta">
                                        <div className="_comment_name_title">
                                        {r?.user?.first_name || 'User'} {r?.user?.last_name || ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="_bs_reactors_badge" role="img" aria-label={formatReactionType(r?.reaction_type)} title={formatReactionType(r?.reaction_type)}>
                                    <ReactionMiniIcon type={r?.reaction_type} />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </PostCardReactorsModal>

            <PostCardReactorsModal
                isOpen={isCommentReactorsModalOpen}
                onClose={closeCommentReactorsModal}
                title="Comment Reactions"
            >
                {activeCommentReactorsLoading ? (
                    <p className="_bs_reactors_empty">Loading reactions...</p>
                ) : (activeCommentReactors || []).length === 0 ? (
                    <p className="_bs_reactors_empty">No reactions yet.</p>
                ) : (
                    <ul className="_bs_reactors_list">
                        {activeCommentReactors.map((r, idx) => (
                            <li key={`${r?.user?.id || 'u'}-${idx}`} className="_bs_reactors_item">
                                <div className="_bs_reactors_left">
                                    <img
                                        src={r?.user?.profile_photo || defaultAvatarSrc}
                                        alt=""
                                        className="_bs_reactors_avatar"
                                    />
                                    <div className="_bs_reactors_meta">
                                        <div className="_bs_reactors_name">
                                        {r?.user?.first_name || 'User'} {r?.user?.last_name || ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="_bs_reactors_badge" role="img" aria-label={formatReactionType(r?.reaction_type)} title={formatReactionType(r?.reaction_type)}>
                                    <ReactionMiniIcon type={r?.reaction_type} />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </PostCardReactorsModal>
        </div>
    );
};

export default PostCard;
