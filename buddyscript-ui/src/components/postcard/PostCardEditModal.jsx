import React from 'react';

import PostInputArea from '../createpostcard/PostInputArea';
import VisibilityGrid from '../createpostcard/VisibilityGrid';

const PostCardEditModal = ({
    isOpen,
    onClose,
    currentUser,
    initialContent = '',
    initialVisibility = 'public',
    initialImages = [],
    onSave,
    saving = false,
}) => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const surfaceBg = isDarkMode ? 'var(--bg6)' : 'var(--bg2)';
    const surfaceText = isDarkMode ? 'var(--bg2)' : 'var(--color1)';

    const [content, setContent] = React.useState(initialContent || '');
    const [visibility, setVisibility] = React.useState(initialVisibility || 'public');


    const [existingImages, setExistingImages] = React.useState([]);
    const [deleteImageIds, setDeleteImageIds] = React.useState([]);
    const [existingCaptionsById, setExistingCaptionsById] = React.useState({});
    const [clearLegacyImage, setClearLegacyImage] = React.useState(false);

    const fileInputRef = React.useRef(null);

    const [newImages, setNewImages] = React.useState([]); // File[]
    const [newImagePreviews, setNewImagePreviews] = React.useState([]); // string[]
    const [newImageCaptions, setNewImageCaptions] = React.useState([]); // string[]

    React.useEffect(() => {
        if (!isOpen) return;

        setContent(initialContent || '');
        setVisibility(initialVisibility || 'public');

        const imgs = Array.isArray(initialImages) ? initialImages : [];
        setExistingImages(imgs);
        setDeleteImageIds([]);
        setClearLegacyImage(false);

        const captionMap = {};
        for (const img of imgs) {
            if (img?.id) captionMap[String(img.id)] = img?.caption || '';
        }
        setExistingCaptionsById(captionMap);

        // revoke any previous previews
        setNewImagePreviews((prev) => {
            prev.forEach((url) => {
                try {
                    URL.revokeObjectURL(url);
                } catch {
                    // ignore
                }
            });
            return [];
        });
        setNewImages([]);
        setNewImageCaptions([]);
    }, [isOpen]);

    React.useEffect(() => {
        return () => {
            // cleanup on unmount
            newImagePreviews.forEach((url) => {
                try {
                    URL.revokeObjectURL(url);
                } catch {
                    // ignore
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isOpen) return null;

    const removeExisting = (img) => {
        if (!img) return;

        if (img.id) {
            setDeleteImageIds((prev) => (prev.includes(img.id) ? prev : [...prev, img.id]));
        } else {
            setClearLegacyImage(true);
        }

        setExistingImages((prev) => prev.filter((x) => x !== img));
    };

    const addFiles = (files) => {
        const list = Array.from(files || []);
        if (list.length === 0) return;

        const previews = list.map((file) => URL.createObjectURL(file));

        setNewImages((prev) => [...prev, ...list]);
        setNewImagePreviews((prev) => [...prev, ...previews]);
        setNewImageCaptions((prev) => [...prev, ...list.map(() => '')]);
    };

    const removeSelectedNewImage = (idx) => {
        setNewImagePreviews((prev) => {
            const url = prev[idx];
            if (url) {
                try {
                    URL.revokeObjectURL(url);
                } catch {
                    // ignore
                }
            }
            const next = [...prev];
            next.splice(idx, 1);
            return next;
        });
        setNewImages((prev) => {
            const next = [...prev];
            next.splice(idx, 1);
            return next;
        });
        setNewImageCaptions((prev) => {
            const next = [...prev];
            next.splice(idx, 1);
            return next;
        });
    };

    const submit = async (e) => {
        e.preventDefault();

        const captionsById = {};
        for (const img of existingImages) {
            if (!img?.id) continue;
            captionsById[String(img.id)] = existingCaptionsById[String(img.id)] || '';
        }

        await onSave?.({
            content,
            visibility,
            deleteImageIds,
            existingCaptionsById: captionsById,
            newImages,
            newImageCaptions,
            clearLegacyImage,
        });
    };

    return (
        <div role="dialog" aria-modal="true" className="_bs_comments_modal_overlay">
            <div className="_bs_comments_modal_content">
                <div className="_bs_comments_modal_header">
                    <div className="_bs_comments_modal_title">Edit Post</div>
                    <button type="button" onClick={onClose} aria-label="Close" className="_bs_comments_modal_close" disabled={saving}>
                        ✕
                    </button>
                </div>

                <div className="_bs_comments_modal_body">
                    <form onSubmit={submit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className='p-5'>
                            <PostInputArea currentUser={currentUser} text={content} setText={setContent} />

                            <VisibilityGrid
                                visibility={visibility}
                                setVisibility={setVisibility}
                                isDarkMode={isDarkMode}
                            />

                            <div>
                                {/* <div style={{ fontWeight: 600, marginBottom: '8px' }} className='_feed_inner_timeline_post_box_title'>Images</div> */}

                                <div style={{ display: 'none' }}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            addFiles(e.target.files);
                                            e.target.value = '';
                                        }}
                                        disabled={saving}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div
                                        className='_comment_name_title'
                                        style={{
                                            backgroundColor: 'rgba(55, 125, 255, 0.15)',
                                            display: 'inline-block',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            marginBottom: '16px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        {`${(existingImages?.length || 0) + (newImages?.length || 0)} image${(existingImages?.length || 0) + (newImages?.length || 0) === 1 ? '' : 's'} selected`}
                                    </div>

                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                            gap: '16px',
                                        }}
                                    >
                                        {(existingImages || []).map((img, idx) => (
                                            <div
                                                key={img?.id ?? `legacy-${idx}`}
                                                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                                            >
                                                <div style={{ position: 'relative' }}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            removeExisting(img);
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '8px',
                                                            right: '8px',
                                                            background: surfaceBg,
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            width: '28px',
                                                            height: '28px',
                                                            cursor: 'pointer',
                                                            zIndex: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: surfaceText,
                                                        }}
                                                        disabled={saving}
                                                        aria-label="Remove image"
                                                    >
                                                        ✕
                                                    </button>

                                                    <img
                                                        src={img?.image}
                                                        alt="preview"
                                                        style={{
                                                            width: '100%',
                                                            height: '140px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                        }}
                                                    />
                                                </div>

                                                <input
                                                    type="text"
                                                    placeholder={img?.id ? 'Caption' : 'Caption (legacy image)'}
                                                    value={img?.id ? (existingCaptionsById[String(img.id)] || '') : ''}
                                                    onChange={(e) => {
                                                        if (!img?.id) return;
                                                        const val = e.target.value;
                                                        setExistingCaptionsById((prev) => ({ ...prev, [String(img.id)]: val }));
                                                    }}
                                                    disabled={!img?.id || saving}
                                                    style={{
                                                        padding: '10px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        backgroundColor: surfaceBg,
                                                        color: surfaceText,
                                                        outline: 'none',
                                                    }}
                                                />
                                                {!img?.id ? (
                                                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                                                        Legacy image captions can’t be edited.
                                                    </div>
                                                ) : null}
                                            </div>
                                        ))}

                                        {(newImages || []).map((file, idx) => (
                                            <div key={`${file?.name || 'file'}-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            removeSelectedNewImage(idx);
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '8px',
                                                            right: '8px',
                                                            background: surfaceBg,
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            width: '28px',
                                                            height: '28px',
                                                            cursor: 'pointer',
                                                            zIndex: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: surfaceText,
                                                        }}
                                                        disabled={saving}
                                                        aria-label="Remove image"
                                                    >
                                                        ✕
                                                    </button>

                                                    <img
                                                        src={newImagePreviews[idx]}
                                                        alt="preview"
                                                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
                                                    />
                                                </div>

                                                <input
                                                    type="text"
                                                    placeholder="Caption"
                                                    value={newImageCaptions[idx] || ''}
                                                    onChange={(e) => {
                                                        const next = [...newImageCaptions];
                                                        next[idx] = e.target.value;
                                                        setNewImageCaptions(next);
                                                    }}
                                                    disabled={saving}
                                                    style={{
                                                        padding: '10px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        backgroundColor: surfaceBg,
                                                        color: surfaceText,
                                                        outline: 'none',
                                                    }}
                                                />
                                            </div>
                                        ))}

                                        <div
                                            style={{
                                                background: surfaceBg,
                                                borderRadius: '8px',
                                                height: '140px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: saving ? 'not-allowed' : 'pointer',
                                                color: surfaceText,
                                                opacity: saving ? 0.7 : 1,
                                            }}
                                            role="button"
                                            tabIndex={saving ? -1 : 0}
                                            onClick={() => {
                                                if (saving) return;
                                                fileInputRef.current?.click();
                                            }}
                                            onKeyDown={(e) => {
                                                if (saving) return;
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    fileInputRef.current?.click();
                                                }
                                            }}
                                        >
                                            <span style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
                                            <span style={{ fontWeight: 'bold', marginTop: '4px' }}>Add more</span>
                                        </div>
                                    </div>
                                </div>

                              

                                    
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostCardEditModal;
