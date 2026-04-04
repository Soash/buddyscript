import React from 'react';

const PostImageGrid = ({ images, imagePreviews, imageCaptions, setImageCaptions, removeSelectedImage, onAddMoreClick }) => {
    if (images.length === 0) return null;

    return (
        <div style={{ marginBottom: '20px' }}>
            {/* The "X images selected" Banner */}
            <div className='_comment_name_title' style={{ 
                backgroundColor: 'rgba(55, 125, 255, 0.15)', 
                //color: '#e2e8f0', 
                display: 'inline-block', 
                padding: '8px 16px', 
                borderRadius: '6px', 
                marginBottom: '16px', 
                fontWeight: '500' 
            }}>
                {`${images.length} image${images.length === 1 ? '' : 's'} selected`}
            </div>

            {/* The 3-Column Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: '16px' 
            }}>
                {images.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Image & Remove Button */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                type="button" 
                                onClick={(e) => { e.preventDefault(); removeSelectedImage(idx); }} 
                                style={{ 
                                    position: 'absolute', top: '8px', right: '8px', background: '#fff', 
                                    border: 'none', borderRadius: '4px', width: '28px', height: '28px', 
                                    cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                }}
                            >
                                ✕
                            </button>
                            <img 
                                src={imagePreviews[idx]} 
                                alt="preview" 
                                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} 
                            />
                        </div>
                        {/* Caption Input */}
                        <input 
                            type="text" 
                            placeholder="Caption" 
                            value={imageCaptions[idx] || ''} 
                            onChange={(e) => { 
                                const next = [...imageCaptions]; 
                                next[idx] = e.target.value; 
                                setImageCaptions(next); 
                            }} 
                            style={{ 
                                padding: '10px', borderRadius: '6px', border: 'none', 
                                backgroundColor: '#fff', color: '#111', outline: 'none' 
                            }} 
                        />
                    </div>
                ))}

                {/* The "Add More" Square */}
                <div 
                    onClick={onAddMoreClick} 
                    style={{ 
                        background: '#fff', borderRadius: '8px', height: '140px', 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', 
                        justifyContent: 'center', cursor: 'pointer', color: '#111' 
                    }}
                >
                    <span style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
                    <span style={{ fontWeight: 'bold', marginTop: '4px' }}>Add more</span>
                </div>
            </div>
        </div>
    );
};

export default PostImageGrid;