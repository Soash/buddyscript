import React, { useRef, useState } from 'react';

// 1. 10 Demo Data Items
const demoStories = [
    { id: 1, name: 'Your Story', image: 'assets/images/card_ppl1.png', isUser: true },
    { id: 2, name: 'Ryan Roslansky', image: 'assets/images/card_ppl2.png', avatar: 'assets/images/mini_pic.png', isActive: true },
    { id: 3, name: 'Bill Gates', image: 'assets/images/card_ppl3.png', avatar: 'assets/images/mini_pic.png', isActive: false },
    { id: 4, name: 'Steve Jobs', image: 'assets/images/card_ppl4.png', avatar: 'assets/images/mini_pic.png', isActive: true },
    { id: 5, name: 'Elon Musk', image: 'assets/images/card_ppl1.png', avatar: 'assets/images/mini_pic.png', isActive: false },
    { id: 6, name: 'Mark Zuckerberg', image: 'assets/images/card_ppl2.png', avatar: 'assets/images/mini_pic.png', isActive: true },
    { id: 7, name: 'Jeff Bezos', image: 'assets/images/card_ppl3.png', avatar: 'assets/images/mini_pic.png', isActive: false },
    { id: 8, name: 'Tim Cook', image: 'assets/images/card_ppl4.png', avatar: 'assets/images/mini_pic.png', isActive: true },
    { id: 9, name: 'Sundar Pichai', image: 'assets/images/card_ppl1.png', avatar: 'assets/images/mini_pic.png', isActive: false },
    { id: 10, name: 'Satya Nadella', image: 'assets/images/card_ppl2.png', avatar: 'assets/images/mini_pic.png', isActive: true },
];

const Story = () => {
    const scrollRef = useRef(null);
    
    // ⭐ Changed state to hold the INDEX of the story instead of just the image URL
    const [activeStoryIndex, setActiveStoryIndex] = useState(null);
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Smooth scroll logic for the layout grid arrows
    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300; 
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // ⭐ Modal Navigation Handlers
    const goToPrevStory = (e) => {
        e.stopPropagation(); // Stops the modal from closing when you click the arrow
        setActiveStoryIndex((prevIndex) => 
            prevIndex === 0 ? demoStories.length - 1 : prevIndex - 1
        );
    };

    const goToNextStory = (e) => {
        e.stopPropagation();
        setActiveStoryIndex((prevIndex) => 
            prevIndex === demoStories.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <>
            {/* --- FULL SCREEN MODAL WITH ARROWS --- */}
            {activeStoryIndex !== null && (
                <div 
                    className="_bs_comments_modal_overlay _bs_story_modal_overlay" 
                    style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setActiveStoryIndex(null)} // Close when clicking the dark background
                >
                    {/* Close Button */}
                    <button 
                        type="button"
                        className="_bs_story_modal_close"
                        style={{
                            background: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0,0,0,0.6)',
                            color: isDarkMode ?  '#000' : '#fff',
                            border: 'none',  fontSize: '16px',
                            cursor: 'pointer', zIndex: 10,
                            borderRadius: '50%',  display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center' }}
                        onClick={() => setActiveStoryIndex(null)}
                    >
                        ✕
                    </button>

                    {/* ⭐ Left Arrow inside Modal */}
                    <button 
                        onClick={goToPrevStory}
                        type="button"
                        className="_bs_story_modal_arrow _bs_story_modal_arrow_left"
                        style={{
                            background: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0,0,0,0.6)',
                            border: 'none',
                            color: isDarkMode ?  '#000' : '#fff',
                            fontSize: '40px', cursor: 'pointer', zIndex: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '6px' }}
                    >
                        ‹
                    </button>

                    {/* Active Image */}
                    <img 
                        src={demoStories[activeStoryIndex].image} 
                        alt="Story Fullscreen" 
                        className="_bs_story_modal_image"
                        onClick={(e) => e.stopPropagation()} 
                    />

                    {/* ⭐ Right Arrow inside Modal */}
                    <button 
                        onClick={goToNextStory}
                        type="button"
                        className="_bs_story_modal_arrow _bs_story_modal_arrow_right"
                        style={{
                            background: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0,0,0,0.6)',
                            border: 'none',
                            color: isDarkMode ?  '#000' : '#fff',
                            fontSize: '40px', cursor: 'pointer', zIndex: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '6px' }}
                    >
                        ›
                    </button>
                </div>
            )}


            {/* --- FOR DESKTOP --- */}
            <div className="_feed_inner_ppl_card _mar_b16" style={{ position: 'relative' }}>
                
                {/* Left Arrow */}
                <div className="_feed_inner_story_arrow" style={{ left: '5px', right: 'auto', zIndex: 10 }}>
                    <button type="button" className="_feed_inner_story_arrow_btn" onClick={() => scroll('left')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" fill="none" viewBox="0 0 9 10" style={{ transform: 'rotate(180deg)', margin: 0 }}>
                            <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z"></path>
                        </svg>
                    </button>
                </div>

                {/* Right Arrow */}
                <div className="_feed_inner_story_arrow" style={{ right: '5px', zIndex: 10 }}>
                    <button type="button" className="_feed_inner_story_arrow_btn" onClick={() => scroll('right')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" fill="none" viewBox="0 0 9 10" style={{ margin: 0 }}>
                            <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z"></path>
                        </svg>
                    </button>
                </div>

                {/* Horizontal Scroll Container */}
                <div 
                    ref={scrollRef} 
                    style={{ 
                        display: 'flex', 
                        overflowX: 'hidden', 
                        gap: '16px', 
                        padding: '4px 0' 
                    }}
                >
                    {/* ⭐ Updated mapping to grab the index (idx) */}
                    {demoStories.map((story, idx) => (
                        <div key={story.id} style={{ flex: '0 0 auto', width: '160px' }}>
                            {story.isUser ? (
                                /* "Your Story" Box */
                                <div className="_feed_inner_profile_story _b_radious6" onClick={() => setActiveStoryIndex(idx)}>
                                    <div className="_feed_inner_profile_story_image">
                                        <img src={story.image} alt={story.name} className="_profile_story_img" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                                        <div className="_feed_inner_story_txt">
                                            <div className="_feed_inner_story_btn">
                                                <button className="_feed_inner_story_btn_link">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                                                        <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                            <p className="_feed_inner_story_para">{story.name}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Friend Story Box */
                                <div className="_feed_inner_public_story _b_radious6" onClick={() => setActiveStoryIndex(idx)}>
                                    <div className="_feed_inner_public_story_image">
                                        <img src={story.image} alt={story.name} className="_public_story_img" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                                        <div className="_feed_inner_pulic_story_txt">
                                            <p className="_feed_inner_pulic_story_para">{story.name}</p>
                                        </div>
                                        <div className="_feed_inner_public_mini">
                                            <img src={story.avatar} alt="Avatar" className="_public_mini_img" style={{ border: story.isActive ? '2px solid #1890FF' : '2px solid var(--bg2)' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/*For Desktop End*/}


            {/* --- FOR MOBILE --- */}
            <div className="_feed_inner_ppl_card_mobile _mar_b16 d-block d-sm-none">
                <div className="_feed_inner_ppl_card_area">
                    <ul className="_feed_inner_ppl_card_area_list" style={{ padding: 0, margin: 0, display: 'flex', gap: '16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {/* ⭐ Updated mapping to grab the index (idx) */}
                        {demoStories.map((story, idx) => (
                            <li key={story.id} className="_feed_inner_ppl_card_area_item" onClick={() => setActiveStoryIndex(idx)}>
                                <div className="_feed_inner_ppl_card_area_link" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    
                                    {story.isUser ? (
                                        <div className="_feed_inner_ppl_card_area_story">
                                            <img src={story.image} alt={story.name} className="_card_story_img" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                            <div className="_feed_inner_ppl_btn">
                                                <button className="_feed_inner_ppl_btn_link" type="button">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
                                                        <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M6 2.5v7M2.5 6h7"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={story.isActive ? '_feed_inner_ppl_card_area_story_active' : '_feed_inner_ppl_card_area_story_inactive'}>
                                            <img src={story.image} alt={story.name} className="_card_story_img1" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                        </div>
                                    )}

                                    <p className="_feed_inner_ppl_card_area_txt" style={{ margin: '8px 0 0 0', textAlign: 'center' }}>
                                        {story.isUser ? story.name : story.name.split(' ')[0] + '...'}
                                    </p>

                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/*For Mobile End*/}
        </>
    );
};

export default Story;