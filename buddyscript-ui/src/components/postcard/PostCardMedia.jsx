import React from 'react';

const PostCardMedia = ({ images, onOpenImage }) => {
    if (!Array.isArray(images) || images.length === 0) return null;

    const MAX_VISIBLE = 4;
    const hasOverflow = images.length > MAX_VISIBLE;
    const visibleImages = hasOverflow ? images.slice(0, MAX_VISIBLE) : images;
    const overflowCount = hasOverflow ? images.length - MAX_VISIBLE : 0;

    const gridColumns = visibleImages.length <= 1 ? '1fr' : 'repeat(2, 1fr)';

    return (
        <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '10px' }}>
                {visibleImages.map((img, idx) => {
                    const isOverflowTile = hasOverflow && idx === MAX_VISIBLE - 1;

                    return (
                        <div key={`${img.id ?? 'legacy'}-${idx}`} className="position-relative">
                            <img
                                src={img.image}
                                alt={img.caption || `Post image ${idx + 1}`}
                                className="_time_img"
                                style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                                onClick={() => onOpenImage?.(idx)}
                            />

                            {isOverflowTile && (
                                <button
                                    type="button"
                                    onClick={() => onOpenImage?.(idx)}
                                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 text-white"
                                    style={{ border: 'none', borderRadius: '8px', opacity: 0.8, cursor: 'pointer' }}
                                    aria-label={`View ${overflowCount} more images`}
                                >
                                    <span className="fw-bold" style={{ fontSize: '32px', lineHeight: 1 }}>
                                        +{overflowCount}
                                    </span>
                                </button>
                            )}
                        
                        {/*
                        {img.caption && <p style={{ marginTop: '6px', marginBottom: 0, fontSize: '14px' }}>{img.caption}</p>}
                        */}

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PostCardMedia;
