import React from 'react';

const PostCardMedia = ({ images, onOpenImage }) => {
    if (!Array.isArray(images) || images.length === 0) return null;

    return (
        <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {images.map((img, idx) => (
                    <div key={`${img.id ?? 'legacy'}-${idx}`}>
                        <img
                            src={img.image}
                            alt={img.caption || `Post image ${idx + 1}`}
                            className="_time_img"
                            style={{ width: '100%', maxHeight: '360px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                            onClick={() => onOpenImage?.(idx)}
                        />
                        
                        {/*
                        {img.caption && <p style={{ marginTop: '6px', marginBottom: 0, fontSize: '14px' }}>{img.caption}</p>}
                        */}

                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostCardMedia;
