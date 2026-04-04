import React from 'react';

const REACTIONS = [
    { type: 'like', label: 'Like' },
    { type: 'love', label: 'Love' },
    { type: 'haha', label: 'Haha' },
];

const reactionColors = {
    like: '#1877F2',
    love: '#F33E58',
    haha: '#F7B125',
};

const ReactionIcon = ({ type, filled, color }) => {
    if (type === 'love') {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill={filled ? (color || 'currentColor') : 'none'}
                stroke={color || 'currentColor'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        );
    }

    if (type === 'haha') {
        // Always a filled emoji-style icon (matches existing template).
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                <path fill="#F7B125" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
                <path
                    fill="#664500"
                    d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"
                />
                <path
                    fill="#fff"
                    d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z"
                />
                <path
                    fill="#664500"
                    d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
                />
            </svg>
        );
    }

    // like (default)
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill={filled ? (color || 'currentColor') : 'none'}
            stroke={color || 'currentColor'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
    );
};

const ReactionButton = React.memo(function ReactionButton({ value, onSelect }) {
    const [open, setOpen] = React.useState(false);
    const closeTimerRef = React.useRef(null);
    const openTimerRef = React.useRef(null);

    const clearTimers = React.useCallback(() => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        if (openTimerRef.current) {
            clearTimeout(openTimerRef.current);
            openTimerRef.current = null;
        }
    }, []);

    React.useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);

    const handlePointerEnter = React.useCallback(() => {
        clearTimers();
        // Small delay avoids accidental flicker.
        openTimerRef.current = setTimeout(() => setOpen(true), 60);
    }, [clearTimers]);

    const handlePointerLeave = React.useCallback(() => {
        clearTimers();
        // Close delay prevents flicker when moving pointer between button and popup.
        closeTimerRef.current = setTimeout(() => setOpen(false), 160);
    }, [clearTimers]);

    const selectedType = value || null;
    const selectedLabel = selectedType ? REACTIONS.find((r) => r.type === selectedType)?.label : 'Like';
    const mainType = selectedType || 'like';
    const isReacted = !!selectedType;
    const selectedColor = selectedType ? (reactionColors[mainType] || 'inherit') : 'inherit';
    const selectedHexColor = selectedType ? (reactionColors[mainType] || undefined) : undefined;

    const handleMainClick = React.useCallback(() => {
        // Default click: Like
        // If already reacted: clicking the same selected reaction toggles off.
        if (!selectedType) {
            onSelect?.('like');
        } else {
            onSelect?.(selectedType);
        }
    }, [onSelect, selectedType]);

    const handlePick = React.useCallback(
        (type) => {
            onSelect?.(type);
            setOpen(false);
        },
        [onSelect]
    );

    return (
        <div
            style={{ position: 'relative', display: 'inline-block', width:'20%' }}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
        >
            <button
                type="button"
                className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${isReacted ? '_feed_reaction_active' : ''}`}
                onClick={handleMainClick}
                aria-haspopup="true"
                aria-expanded={open}
                style={{ color: selectedColor, width:'100%' }}
            >
                <span className="_feed_inner_timeline_reaction_link">
                    <span>
                        <ReactionIcon
                            type={mainType}
                            filled={isReacted && mainType !== 'haha'}
                            color={mainType === 'haha' ? undefined : selectedHexColor}
                        />
                        {selectedLabel}
                    </span>
                </span>
            </button>

            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 'calc(100% + 8px)',
                    zIndex: 20,
                    background: 'var(--color1)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '999px',
                    padding: '6px 8px',
                    display: 'flex',
                    gap: '6px',
                    opacity: open ? 1 : 0,
                    transform: open ? 'translateY(0px)' : 'translateY(4px)',
                    pointerEvents: open ? 'auto' : 'none',
                    transition: 'opacity 120ms ease, transform 120ms ease',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                }}
                role="menu"
                aria-hidden={!open}
            >
                {REACTIONS.map((r) => {
                    const active = selectedType === r.type;
                    return (
                        <button
                            key={r.type}
                            type="button"
                            onClick={() => handlePick(r.type)}
                            title={r.label}
                            aria-label={r.label}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                padding: '4px',
                                cursor: 'pointer',
                                lineHeight: 0,
                                // Hover options are always colored.
                                color: reactionColors[r.type] || 'inherit',
                                opacity: active ? 1 : 0.9,
                            }}
                            role="menuitem"
                        >
                            <ReactionIcon
                                type={r.type}
                                filled={r.type !== 'haha'}
                                color={r.type === 'haha' ? undefined : (reactionColors[r.type] || undefined)}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

export default ReactionButton;
