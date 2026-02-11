import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Modal from './Modal';
import '../../styles/UserProfileModal.css';

const UserProfileModal = ({ userId, isOpen, onClose, onUpdate }) => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    bio: '',
    department: '',
    phone_verified: false,
    profile_photo: null
  });

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        bio: data.bio || '',
        department: data.department || '',
        phone_verified: data.phone_verified || false,
        profile_photo: null
      });
      if (data.profile_photo) {
        setPhotoPreview(`http://localhost:5000${data.profile_photo}`);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Upload photo if selected
      if (formData.profile_photo) {
        const photoFormData = new FormData();
        photoFormData.append('profile_photo', formData.profile_photo);
        
        const photoResponse = await fetch('http://localhost:5000/api/users/profile/upload-photo', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: photoFormData
        });
        if (!photoResponse.ok) throw new Error('Failed to upload photo');
      }

      // Update profile
      const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          department: formData.department,
          phone_verified: formData.phone_verified
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      setProfile(data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
      <div className="user-profile-modal">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="modal-content">
              <div className="photo-section">
                <div className="photo-container">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="profile-photo" />
                  ) : (
                    <div className="photo-placeholder">No Photo</div>
                  )}
                </div>
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="photo-input"
                  />
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={profile?.email || ''} disabled className="form-input disabled" />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="phone_verified"
                        checked={formData.phone_verified}
                        onChange={handleInputChange}
                      />
                      Phone Verified
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-view">
                  <div className="info-row">
                    <span className="label">Full Name:</span>
                    <span className="value">{profile?.full_name || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{profile?.email || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{profile?.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Address:</span>
                    <span className="value">{profile?.address || 'Not provided'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Bio:</span>
                    <span className="value">{profile?.bio || 'Not provided'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Department:</span>
                    <span className="value">{profile?.department || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone Verified:</span>
                    <span className="value">{profile?.phone_verified ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Member Since:</span>
                    <span className="value">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</span>
                  </div>

                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default UserProfileModal;
