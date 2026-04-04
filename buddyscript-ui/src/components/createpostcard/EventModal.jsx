import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent, updateEvent } from '../../store/eventsSlice';

const toDateTimeLocalValue = (value) => {
    if (!value) return '';
    const str = String(value);

    // Already in datetime-local format
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) return str;

    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return '';

    const pad2 = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const min = pad2(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const EventModal = ({ isOpen, onClose, mode = 'create', initialEvent = null, onSuccess }) => {
    const dispatch = useDispatch();
    const eventsPending = useSelector((state) => state.events?.pending || {});
    
    const [eventName, setEventName] = useState('');
    const [eventStartsAt, setEventStartsAt] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDetails, setEventDetails] = useState('');
    const [eventError, setEventError] = useState('');
    const [eventSuccess, setEventSuccess] = useState(false);
    
    const eventCloseTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (eventCloseTimeoutRef.current) clearTimeout(eventCloseTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        setEventError('');
        setEventSuccess(false);

        if (mode === 'edit' && initialEvent) {
            setEventName(initialEvent?.name || '');
            setEventStartsAt(toDateTimeLocalValue(initialEvent?.starts_at));
            setEventLocation(initialEvent?.location || '');
            setEventDetails(initialEvent?.details || '');
        }
    }, [isOpen, mode, initialEvent]);

    if (!isOpen) return null;

    const handleEventCreate = async (e) => {
        e.preventDefault();
        setEventError('');
        setEventSuccess(false);

        if (!eventName.trim()) return setEventError('Event name is required.');
        if (!eventStartsAt) return setEventError('Event date/time is required.');

        try {
            if (mode === 'edit') {
                const eventId = initialEvent?.id;
                if (!eventId) {
                    setEventError('Missing event id.');
                    return;
                }

                await dispatch(
                    updateEvent({
                        eventId,
                        payload: {
                            name: eventName.trim(),
                            starts_at: eventStartsAt,
                            location: eventLocation.trim(),
                            details: eventDetails.trim(),
                        },
                    })
                ).unwrap();
            } else {
                await dispatch(
                    createEvent({
                        name: eventName.trim(),
                        starts_at: eventStartsAt,
                        location: eventLocation.trim(),
                        details: eventDetails.trim(),
                    })
                ).unwrap();
            }

            setEventSuccess(true);
            eventCloseTimeoutRef.current = setTimeout(() => {
                onClose();
                setEventName(''); setEventStartsAt(''); setEventLocation(''); setEventDetails('');
                setEventError(''); setEventSuccess(false);

                if (typeof onSuccess === 'function') onSuccess();
            }, 900);
        } catch (err) {
            setEventError(typeof err === 'string' ? err : err?.detail || 'Failed to create event.');
        }
    };

    const isEdit = mode === 'edit';
    const eventId = initialEvent?.id;
    const isSubmitting = isEdit ? !!eventsPending?.[`update:${eventId}`] : !!eventsPending?.create;

    return (
        <div className="_bs_comments_modal_overlay">
            <div className="_bs_comments_modal_content" style={{ maxWidth: '500px', width: '100%' }}>
                
                <div className="_bs_comments_modal_header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="_bs_comments_modal_title" style={{ fontSize: '18px', textAlign: 'center' }}>{isEdit ? 'Edit Event' : 'Create Event'}</div>
                    <button type="button" className="_bs_comments_modal_close" onClick={onClose} style={{ position: 'absolute', right: '14px' }}>✕</button>
                </div>

                <form onSubmit={handleEventCreate} className="_bs_comments_modal_body" style={{ padding: '24px' }}>
                    {eventError && <div style={{ marginBottom: 10, fontSize: 13, color: '#ff4d4f', textAlign: 'center' }}>{eventError}</div>}
                    {eventSuccess && (
                        <div style={{ marginBottom: 10, fontSize: 13, color: '#00e676', textAlign: 'center' }}>
                            {isEdit ? 'Event updated.' : 'Event created.'}
                        </div>
                    )}
                    
                    {/* ⭐ Applied your wrapper structure here */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        
                        {/* Note: I added width: '100%' to the mb-3 wrappers so they stretch fully inside the flex-center container */}
                        <div className="mb-3">
                            <label className="form-label _bs_comments_modal_title" style={{ display: 'block', marginBottom: '8px', marginLeft: '12px' }}>Event name</label>
                            <input 
                                className="form-control _inpt1" 
                                value={eventName} 
                                onChange={(e) => setEventName(e.target.value)}
                                style={{ padding: '12px' }}
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label _bs_comments_modal_title" style={{ display: 'block', marginBottom: '8px', marginLeft: '12px' }}>Date & time</label>
                            <input 
                                type="datetime-local" 
                                className="form-control _inpt1" 
                                value={eventStartsAt} 
                                onChange={(e) => setEventStartsAt(e.target.value)}
                                style={{ paddingLeft: '12px' }}
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label _bs_comments_modal_title" style={{ display: 'block', marginBottom: '8px', marginLeft: '12px' }}>Location (optional)</label>
                            <input 
                                className="form-control _inpt1" 
                                value={eventLocation} 
                                onChange={(e) => setEventLocation(e.target.value)}
                                style={{ padding: '12px' }}
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label _bs_comments_modal_title" style={{ display: 'block', marginBottom: '8px', marginLeft: '12px' }}>Details (optional)</label>
                            <textarea 
                                className="form-control _inpt1" 
                                rows={5} 
                                value={eventDetails} 
                                onChange={(e) => setEventDetails(e.target.value)} 
                                style={{ minHeight: '140px', borderRadius: '12px', padding: '12px', resize: 'vertical' }} 
                            />
                        </div>
                        
                        <div className="d-flex" style={{ gap: 12, justifyContent: 'center', marginTop: '30px' }}>
                            <button type="button" className="_discover_event_inner_card_btn_link" onClick={onClose} style={{ width: '120px', height: '44px' }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting || eventSuccess} style={{ width: '120px', height: '44px', fontWeight: 500 }}>
                                {isSubmitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save' : 'Create')}
                            </button>
                        </div>
                        
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventModal;