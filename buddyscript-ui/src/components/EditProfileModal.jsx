import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/profileSlice';

const EditProfileModal = ({ show, onClose }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [role, setRole] = useState(user?.role || '');
    const [photo, setPhoto] = useState(null);

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('bio', bio);
        formData.append('role', role);
        if (photo) {
            formData.append('profile_photo', photo);
        }

        await dispatch(updateProfile(formData));
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="bg-white rounded p-4 shadow w-50" style={{maxWidth: '600px'}}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="m-0">Edit Profile</h5>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Profile Photo</label>
                        <input type="file" className="form-control" onChange={(e) => setPhoto(e.target.files[0])} accept="image/*" />
                    </div>
                    <div className="row">
                        <div className="col-6 mb-3">
                            <label className="form-label">First Name</label>
                            <input type="text" className="form-control" value={firstName} onChange={e => setFirstName(e.target.value)} />
                        </div>
                        <div className="col-6 mb-3">
                            <label className="form-label">Last Name</label>
                            <input type="text" className="form-control" value={lastName} onChange={e => setLastName(e.target.value)} />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Role / Job Title</label>
                        <input type="text" className="form-control" value={role} onChange={e => setRole(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Bio (Short Details)</label>
                        <textarea className="form-control" rows="3" value={bio} onChange={e => setBio(e.target.value)}></textarea>
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
