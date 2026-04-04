import React from 'react';

const PostCardImageModal = ({ isOpen, images, activeIndex, onClose, onPrev, onNext }) => {
    if (!isOpen || !Array.isArray(images) || images.length === 0) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.75)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}
        >
            <div
                style={{
                    width: 'min(980px, 100%)',
                    background: '#fff',
                    borderRadius: '10px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderBottom: '1px solid rgba(0,0,0,0.08)',
                    }}
                >
                    <div style={{ fontSize: '14px', color: '#333' }}>
                        {images.length > 1 ? `${activeIndex + 1} / ${images.length}` : 'Image'}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '18px',
                            lineHeight: 1,
                            padding: '6px 8px',
                            cursor: 'pointer',
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '48px 1fr 48px',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px',
                    }}
                >
                    <button
                        type="button"
                        onClick={onPrev}
                        aria-label="Previous image"
                        disabled={images.length <= 1}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            border: '1px solid rgba(0,0,0,0.12)',
                            background: '#fff',
                            cursor: images.length <= 1 ? 'default' : 'pointer',
                            opacity: images.length <= 1 ? 0.4 : 1,
                        }}
                    >
                        ‹
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img
                            src={images[activeIndex]?.image}
                            alt={images[activeIndex]?.caption || `Post image ${activeIndex + 1}`}
                            style={{
                                width: '100%',
                                maxHeight: '70vh',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                background: '#f8f8f8',
                            }}
                        />
                        {images[activeIndex]?.caption && (
                            <p
                                style={{
                                    marginTop: '10px',
                                    marginBottom: 0,
                                    fontSize: '14px',
                                    color: '#333',
                                    textAlign: 'center',
                                }}
                            >
                                {images[activeIndex].caption}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onNext}
                        aria-label="Next image"
                        disabled={images.length <= 1}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            border: '1px solid rgba(0,0,0,0.12)',
                            background: '#fff',
                            cursor: images.length <= 1 ? 'default' : 'pointer',
                            opacity: images.length <= 1 ? 0.4 : 1,
                        }}
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCardImageModal;
