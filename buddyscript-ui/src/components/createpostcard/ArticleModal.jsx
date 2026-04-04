import React, { useState } from 'react';

const ArticleModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder for future logic
        console.log("Article Published:", { title, content });
        setTitle('');
        setContent('');
        onClose();
    };

    return (
        <div className="_bs_comments_modal_overlay">
            {/* Made this one 600px wide so the user has more room to type an article */}
            <div className="_bs_comments_modal_content" style={{ maxWidth: '600px', width: '100%' }}>
                
                <div className="_bs_comments_modal_header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="_bs_comments_modal_title" style={{ fontSize: '18px', textAlign: 'center' }}>Write Article</div>
                    <button type="button" className="_bs_comments_modal_close" onClick={onClose} style={{ position: 'absolute', right: '14px' }}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="_bs_comments_modal_body" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: 20, fontSize: 13, textAlign: 'center', opacity: 0.7 }} className="_bs_comments_modal_title">
                        Article publishing is frontend-only for now.
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="mb-3">
                            <label className="form-label _bs_comments_modal_title" style={{ display: 'block', marginBottom: '8px', marginLeft: '12px' }}>Article Title</label>
                            <input 
                                className="form-control _inpt1" 
                                placeholder="Enter a catchy title..."
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ padding: '12px' }}
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label _bs_comments_modal_title" style={{ display: 'block', marginBottom: '8px', marginLeft: '12px' }}>Content</label>
                            <textarea 
                                className="form-control _inpt1" 
                                rows={8} 
                                placeholder="What do you want to share?"
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                style={{ minHeight: '200px', borderRadius: '12px', padding: '12px', resize: 'vertical' }} 
                            />
                        </div>
                        
                        <div className="d-flex" style={{ gap: 12, justifyContent: 'center', marginTop: '30px' }}>
                            <button type="button" className="_discover_event_inner_card_btn_link" onClick={onClose} style={{ width: '120px', height: '44px' }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ width: '120px', height: '44px', fontWeight: 500 }}>
                                Publish
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArticleModal;