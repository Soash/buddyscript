import React from 'react';

const PostCardReactsSummary = ({
    visibility,
    likesCount,
    commentsCount,
    latestReactors,
    onOpenReactors,
    defaultAvatarSrc = '/assets/images/Avatar.png',
}) => {
    const safeLikesCount = typeof likesCount === 'number' ? likesCount : 0;
    const reactors = Array.isArray(latestReactors) ? latestReactors : [];
    const top5 = reactors.slice(0, 5);
    const remainder = Math.max(0, safeLikesCount - 5);
    const canOpen = visibility === 'public';

    return (
        <>
            <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26" style={{ marginTop: '16px' }}>
                <div
                    className="_feed_inner_timeline_total_reacts_image"
                    onClick={canOpen ? onOpenReactors : undefined}
                    role={canOpen ? 'button' : undefined}
                    tabIndex={canOpen ? 0 : undefined}
                    onKeyDown={
                        canOpen
                            ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      onOpenReactors?.();
                                  }
                              }
                            : undefined
                    }
                    style={{ cursor: canOpen ? 'pointer' : 'default' }}
                    title={canOpen ? 'View who reacted' : 'Reactions are not available for private posts'}
                >
                    {top5.map((r, idx) => {
                        const src = r?.user?.profile_photo || defaultAvatarSrc;
                        const classes = idx === 0 ? '_react_img1' : `_react_img${idx >= 2 ? ' _rect_img_mbl_none' : ''}`;
                        return <img key={`${r?.user?.id || 'u'}-${idx}`} src={src} alt="" className={classes} />;
                    })}
                    {remainder > 0 && <p className="_feed_inner_timeline_total_reacts_para">{remainder}+</p>}
                </div>


                <div className="_feed_inner_timeline_total_reacts_txt">
                    <p className="_feed_inner_timeline_total_reacts_para1">
                        <span>{commentsCount}</span> Comment
                    </p>
                    <p className="_feed_inner_timeline_total_reacts_para2">
                        <span>{likesCount}</span> {likesCount === 1 ? 'Reaction' : 'Reactions'}
                    </p>
                </div>
            </div>
        </>
    );
};

export default PostCardReactsSummary;
