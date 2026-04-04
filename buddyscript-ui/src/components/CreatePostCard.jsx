import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPost } from '../store/feedSlice';

// Import our new clean components!
import PostInputArea from './createpostcard/PostInputArea';
import PostImageGrid from './createpostcard/PostImageGrid';
import PostActionBar from './createpostcard/PostActionBar';
import EventModal from './createpostcard/EventModal';
import VideoModal from './createpostcard/VideoModal';
import ArticleModal from './createpostcard/ArticleModal';

const CreatePostCard = () => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector(state => state.auth);
    
    // Core State
    const [text, setText] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
    
    // Image State
    const [images, setImages] = useState([]);
    const [imageCaptions, setImageCaptions] = useState([]);
    
    // Modal States
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    const fileInputRef = useRef(null);
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Clean up memory leaks for image previews
    const imagePreviews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);
    useEffect(() => {
        return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    }, [imagePreviews]);

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setImages((prev) => [...prev, ...files]);
        setImageCaptions((prev) => [...prev, ...files.map(() => '')]);
        e.target.value = ''; // Reset input
    };

    const removeSelectedImage = (index) => {
        setImages((prev) => prev.filter((_, idx) => idx !== index));
        setImageCaptions((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed && images.length === 0) return;

        dispatch(createPost({ content: trimmed, visibility, images, imageCaptions }));
        setText(''); setImages([]); setImageCaptions([]);
    };

    return (
        <div className='_feed_inner_text_area  _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16'>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                
                <div>
                    {/* 1. Avatar and Text */}
                    <PostInputArea currentUser={currentUser} text={text} setText={setText} />

                    {/* 2. Image Grid (Only shows if images are selected) */}
                    <PostImageGrid 
                        images={images} 
                        imagePreviews={imagePreviews} 
                        imageCaptions={imageCaptions} 
                        setImageCaptions={setImageCaptions} 
                        removeSelectedImage={removeSelectedImage} 
                        onAddMoreClick={() => fileInputRef.current?.click()} 
                    />

                    {/* 3. Visibility Globe (Bottom Right of Input Area) */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', marginTop: '10px' }}>
                        
                        {/* ⭐ Used _right_info_btn_link so it perfectly handles dark mode borders and text colors */}
                        <button 
                            type="button" 
                            className="_right_info_btn_link" 
                            onClick={() => setIsVisibilityMenuOpen(!isVisibilityMenuOpen)} 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px', margin: 0, height: 'auto' }}
                        >
                            {visibility === 'public' ? '🌍 Public' : '🔒 Private'}
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                                <path fill="currentColor" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z"></path>
                            </svg>
                        </button>
                        
                        {isVisibilityMenuOpen && (
                            /* ⭐ Used _bs_comments_modal_content because it natively flips to --bg5 in dark mode! */
                            <div 
                                className="_bs_comments_modal_content"
                                style={{ 
                                    position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                                    padding: '8px', zIndex: 50, minWidth: '140px', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'visible',
                                    width: 'auto',
                                }}
                            >
                                {/* ⭐ Used _chat_left_dropdown_link to automatically handle text color in light/dark mode */}

                                <button 
                                    type="button" 
                                    className="_chat_left_dropdown_link"
                                    style={{ 
                                        width: '100%', textAlign: 'left', padding: '8px 12px', 
                                        background: visibility === 'public' ? 'rgba(55, 125, 255, 0.15)' : 'transparent', 
                                        //color: visibility === 'public' ? 'var(--bg1)' : 'var(--bg1)',
                                        color: isDarkMode ? 'var(--bg1)' : 'var(--color1)', 
                                        borderRadius: '6px', cursor: 'pointer', display: 'block', marginBottom: '4px',
                                    }} 
                                    onClick={() => { setVisibility('public'); setIsVisibilityMenuOpen(false); }}
                                >
                                    🌍 Public
                                </button>

                                <button 
                                    type="button" 
                                    className="_chat_left_dropdown_link"
                                    style={{ 
                                        width: '100%', textAlign: 'left', padding: '8px 12px', 
                                        background: visibility === 'private' ? 'rgba(55, 125, 255, 0.15)' : 'transparent', 
                                        color: isDarkMode ? 'var(--bg1)' : 'var(--color1)', 
                                        borderRadius: '6px', cursor: 'pointer', display: 'block'
                                    }} 
                                    onClick={() => { setVisibility('private'); setIsVisibilityMenuOpen(false); }}
                                >
                                    🔒 Private
                                </button>

                            </div>
                        )}
                    </div>
                </div>

                {/* 4. The Action Footer */}
                <PostActionBar 
                    onPhotoClick={() => fileInputRef.current?.click()} 
                    onVideoClick={() => setIsVideoModalOpen(true)} 
                    onEventClick={() => setIsEventModalOpen(true)} 
                    onArticleClick={() => setIsArticleModalOpen(true)} 
                />
            </form>

            {/* Hidden File Input */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesChange} style={{ display: 'none' }} />

            {/* Modals */}
            <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
            <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
            <ArticleModal isOpen={isArticleModalOpen} onClose={() => setIsArticleModalOpen(false)} />
            {/* You can extract VideoModal and ArticleModal later exactly like EventModal! */}
        </div>
    );
};

export default CreatePostCard;