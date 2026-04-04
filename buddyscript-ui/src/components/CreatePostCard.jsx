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
import VisibilityGrid from './createpostcard/VisibilityGrid';

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
                    <VisibilityGrid 
                        visibility={visibility} 
                        setVisibility={setVisibility} 
                        isDarkMode={isDarkMode} 
                    />
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