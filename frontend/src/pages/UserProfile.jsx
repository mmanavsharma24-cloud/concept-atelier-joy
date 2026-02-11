import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    bio: '',
    profile_photo: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setFormData({
        phone: data.phone || '',
        address: data.address || '',
        bio: data.bio || '',
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      setProfile(data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="user-profile-container"><p>Loading...</p></div>;

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!isEditing && (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="profile-content">
          <div className="profile-photo-section">
            <div className="photo-container">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="profile-photo" />
              ) : (
                <div className="photo-placeholder">
                  <span>No Photo</span>
                </div>
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

          <div className="profile-details">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={profile.full_name} disabled className="form-input disabled" />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={profile.email} disabled className="form-input disabled" />
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
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input type="text" value={profile.department} disabled className="form-input disabled" />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value={profile.role} disabled className="form-input disabled" />
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
                  <span className="value">{profile.full_name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{profile.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{profile.phone || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Address:</span>
                  <span className="value">{profile.address || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Bio:</span>
                  <span className="value">{profile.bio || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Department:</span>
                  <span className="value">{profile.department}</span>
                </div>
                <div className="info-row">
                  <span className="label">Role:</span>
                  <span className="value">{profile.role}</span>
                </div>
                <div className="info-row">
                  <span className="label">Member Since:</span>
                  <span className="value">{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
