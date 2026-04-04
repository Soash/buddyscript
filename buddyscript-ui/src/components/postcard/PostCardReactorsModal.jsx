import React from 'react';

const PostCardReactorsModal = ({ isOpen, onClose, children, title = 'Reactions' }) => {
    if (!isOpen) return null;

    return (
        <div role="dialog" aria-modal="true" className="_bs_comments_modal_overlay _bs_reactors_modal_overlay">
            <div className="_bs_comments_modal_content _bs_reactors_modal_content">
                <div className="_bs_comments_modal_header">
                    <div className="_bs_comments_modal_title">{title}</div>
                    <button type="button" onClick={onClose} aria-label="Close" className="_bs_comments_modal_close">
                        ✕
                    </button>
                </div>

                <div className="_bs_comments_modal_body _bs_reactors_modal_body">{children}</div>
            </div>
        </div>
    );
};

export default PostCardReactorsModal;
