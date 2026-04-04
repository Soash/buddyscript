import React, { useState } from 'react';

const VideoModal = ({ isOpen, onClose }) => {
    const [videoUrl, setVideoUrl] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder for future logic
        console.log("Video URL added:", videoUrl);
        setVideoUrl('');
        onClose();
    };

    return (
        <div className="_bs_comments_modal_overlay">
            <div className="_bs_comments_modal_content" style={{ maxWidth: '500px', width: '100%' }}>
                
                <div className="_bs_comments_modal_header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="_bs_comments_modal_title" style={{ fontSize: '18px', textAlign: 'center' }}>Add Video</div>
                    <button type="button" className="_bs_comments_modal_close" onClick={onClose} style={{ position: 'absolute', right: '14px' }}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="_bs_comments_modal_body" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: 20, fontSize: 13, textAlign: 'center', opacity: 0.7 }} className="_bs_comments_modal_title">
                        Video posting is frontend-only for now.
                    </div>

                    <div className="mb-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label className="form-label _bs_comments_modal_title" style={{ display: 'block', marginBottom: '8px' }}>Video URL (YouTube, Vimeo, etc.)</label>
                        <input 
                            className="form-control _inpt1" 
                            placeholder="https://"
                            value={videoUrl} 
                            onChange={(e) => setVideoUrl(e.target.value)}
                            style={{ padding: '12px' }}
                        />
                    </div>
                    
                    <div className="d-flex" style={{ gap: 12, justifyContent: 'center', marginTop: '30px' }}>
                        <button type="button" className="_discover_event_inner_card_btn_link" onClick={onClose} style={{ width: '120px', height: '44px' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ width: '120px', height: '44px', fontWeight: 500 }}>
                            Add Video
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VideoModal;