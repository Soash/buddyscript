import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import SwitchingBtn from '../components/SwitchingBtn';
import EventModal from '../components/createpostcard/EventModal';
import { deleteEvent, fetchEvents, setEventRsvp } from '../store/eventsSlice';

const Events = () => {
    const dispatch = useDispatch();

    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    const { items: events, loading, error, pending } = useSelector((state) => state.events);
    const currentUserId = useSelector((state) => state.auth?.user?.id);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        dispatch(fetchEvents());
    }, [dispatch]);

    const sortedEvents = useMemo(() => {
        if (!Array.isArray(events)) return [];
        return [...events].sort((a, b) => {
            const aDate = a?.starts_at ? new Date(a.starts_at).getTime() : 0;
            const bDate = b?.starts_at ? new Date(b.starts_at).getTime() : 0;
            return bDate - aDate;
        });
    }, [events]);

    const filteredEvents = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return sortedEvents;
        if (q.length < 2) return [];

        return sortedEvents.filter((e) => {
            const parts = `${e?.name || ''} ${e?.location || ''} ${e?.details || ''}`.toLowerCase();
            const tokens = parts.split(/[^a-z0-9]+/i).filter(Boolean);
            return tokens.some((t) => t.startsWith(q));
        });
    }, [sortedEvents, searchQuery]);

    const beginEdit = (event) => {
        if (!event?.id) return;
        setEventToEdit(event);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (eventId) => {
        if (!eventId) return;
        const ok = window.confirm('Delete this event?');
        if (!ok) return;
        await dispatch(deleteEvent({ eventId })).unwrap();
        if (Number(eventToEdit?.id) === Number(eventId)) {
            setIsEditModalOpen(false);
            setEventToEdit(null);
        }
    };

    return (
        <React.Fragment>
            <div className={`_layout _layout_main_wrapper ${isDarkMode ? '_dark_wrapper' : ''}`}>
                <EventModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEventToEdit(null);
                    }}
                    mode="edit"
                    initialEvent={eventToEdit}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        setEventToEdit(null);
                    }}
                />
                <SwitchingBtn onToggle={() => setIsDarkMode((prev) => !prev)} />

                <div className="_main_layout">
                    <Navbar />

                    <div className="container _custom_container">
                        <div className="_layout_inner_wrap">
                            <div className="row justify-content-center">
                                <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
                                    <div className="_layout_middle_wrap" style={{ paddingTop: 0 }}>
                                        <div className="_layout_middle_inner">
                                            <h3 style={{ color: isDarkMode ? 'var(--bg2)' : 'var(--color6)' }}>Events</h3>

                                            <div class="_layout_inner shadow-sm p-4 mb-3" style={{width: "fit-content"}}>
                                                <input
                                                    type="text"
                                                    className="form-control _inpt1"
                                                    placeholder="Search events..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    style={{
                                                        padding: '12px',
                                                        border: '1px solid var(--color3)',
                                                    }}
                                                />
                                            </div>

                                            {loading && <p style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Loading events...</p>}
                                            {!loading && error && (
                                                <p style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                                                    Failed to load events.
                                                </p>
                                            )}

                                            {!loading && sortedEvents.length === 0 ? (
                                                <div className="_layout_inner p-5 text-center shadow-sm">
                                                    <p className="mb-0" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>No events yet.</p>
                                                </div>
                                            ) : !loading && filteredEvents.length === 0 ? (
                                                <div className="_layout_inner p-5 text-center shadow-sm">
                                                    <p className="mb-0" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>No matching events.</p>
                                                </div>
                                            ) : (
                                                filteredEvents.map((event) => {
                                                    const eventId = event?.id;
                                                    const myStatus = event?.my_rsvp_status;
                                                    const isGoing = myStatus === 'going';
                                                    const isOwner = Number(event?.creator) === Number(currentUserId);
                                                    const isUpdating = !!pending?.[`update:${eventId}`];
                                                    const isDeleting = !!pending?.[`delete:${eventId}`];

                                                    return (
                                                        <div key={eventId} className="_layout_inner shadow-sm p-4 mb-3">
                                                            <div className="d-flex justify-content-between align-items-start" style={{ gap: 12 }}>
                                                                <div style={{ flex: 1 }}>
                                                                    
                                                                    <h5 className="mb-1" style={{ color: isDarkMode ? 'var(--bg2)' : 'var(--color6)' }}>
                                                                        {event?.name || 'Untitled event'}
                                                                    </h5>
                                                                    
                                                                    <div style={{ fontSize: 14, color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                                                                        {event?.starts_at ? new Date(event.starts_at).toLocaleString() : ''}
                                                                        {event?.location ? ` • ${event.location}` : ''}
                                                                    </div>
                                                                    
                                                                    {event?.details && (
                                                                        <p className="mt-3 mb-0" style={{ whiteSpace: 'pre-wrap', color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'var(--color7)' }}>
                                                                            {event.details}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="d-flex" style={{ gap: 8, flexShrink: 0 }}>
                                                                    {isOwner ? (
                                                                        <div className="d-flex" style={{ gap: 6 }}>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-link p-0"
                                                                                onClick={() => beginEdit(event)}
                                                                                disabled={isUpdating || isDeleting}
                                                                                aria-label="Edit event"
                                                                                title="Edit"
                                                                                style={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)' }}
                                                                            >
                                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-link p-0"
                                                                                onClick={() => handleDelete(eventId)}
                                                                                disabled={isDeleting}
                                                                                aria-label="Delete event"
                                                                                title="Delete"
                                                                                style={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)' }}
                                                                            >
                                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                                    <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                    <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                    <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                                    <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    ) : null}
                                                                    <button
                                                                        type="button"
                                                                        className={isGoing ? 'btn btn-primary' : 'btn btn-outline-primary'}
                                                                        disabled={!!pending?.[`rsvp:${eventId}`] || isDeleting || isUpdating}
                                                                        onClick={() => dispatch(setEventRsvp({ eventId, status: isGoing ? null : 'going' }))}
                                                                    >
                                                                        {isGoing ? 'Undo Going' : 'Going'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Events;