import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

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

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setFormData({ phone: data.phone || '', address: data.address || '', bio: data.bio || '', profile_photo: null });
      if (data.profile_photo) setPhotoPreview(`http://localhost:5000${data.profile_photo}`);
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
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: formData.phone, address: formData.address, bio: formData.bio })
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

  if (loading) return <div className="p-5 max-w-[900px] mx-auto"><p>Loading...</p></div>;

  const inputClasses = "p-2.5 px-3 border border-gray-300 rounded-md text-sm font-inherit transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10";
  const disabledInputClasses = `${inputClasses} bg-gray-50 text-gray-500 cursor-not-allowed`;

  return (
    <div className="p-5 max-w-[900px] mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 max-md:p-5">
        <div className="flex justify-between items-center mb-8 border-b-2 border-gray-100 pb-5 max-md:flex-col max-md:gap-4 max-md:items-start">
          <h1 className="text-[28px] text-blue-800 m-0">My Profile</h1>
          {!isEditing && (
            <button className="bg-blue-500 text-white border-none px-5 py-2.5 rounded-md cursor-pointer text-sm font-medium transition-colors duration-300 hover:bg-blue-700" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="p-3 rounded-md mb-5 text-sm bg-red-100 text-red-800 border border-red-200">{error}</div>}
        {success && <div className="p-3 rounded-md mb-5 text-sm bg-green-100 text-green-800 border border-green-200">{success}</div>}

        <div className="grid grid-cols-[200px_1fr] gap-10 max-md:grid-cols-1">
          <div className="flex flex-col items-center gap-4">
            <div className="w-[180px] h-[180px] rounded-full overflow-hidden border-[3px] border-gray-200 flex items-center justify-center bg-gray-50">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                  <span>No Photo</span>
                </div>
              )}
            </div>
            {isEditing && (
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full p-2 border border-gray-300 rounded-md text-xs" />
            )}
          </div>

          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-600 text-sm">Full Name</label>
                  <input type="text" value={profile.full_name} disabled className={disabledInputClasses} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-600 text-sm">Email</label>
                  <input type="email" value={profile.email} disabled className={disabledInputClasses} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-600 text-sm">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClasses} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-600 text-sm">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={inputClasses} />
                </div>
                <div className="flex flex-col gap-2 col-span-full">
                  <label className="font-semibold text-gray-600 text-sm">Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} className={`${inputClasses} resize-y min-h-[100px]`} rows="4" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-600 text-sm">Department</label>
                  <input type="text" value={profile.department} disabled className={disabledInputClasses} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-600 text-sm">Role</label>
                  <input type="text" value={profile.role} disabled className={disabledInputClasses} />
                </div>
                <div className="col-span-full flex gap-3 mt-5">
                  <button type="submit" className="px-5 py-2.5 bg-blue-500 text-white border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-300 hover:bg-blue-700">Save Changes</button>
                  <button type="button" className="px-5 py-2.5 bg-gray-200 text-gray-700 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-300 hover:bg-gray-300" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                {[
                  ['Full Name', profile.full_name],
                  ['Email', profile.email],
                  ['Phone', profile.phone || 'Not provided'],
                  ['Address', profile.address || 'Not provided'],
                  ['Bio', profile.bio || 'Not provided'],
                  ['Department', profile.department],
                  ['Role', profile.role],
                  ['Member Since', new Date(profile.created_at).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1.5 p-3 bg-gray-50 rounded-md">
                    <span className="font-semibold text-gray-500 text-xs uppercase">{label}:</span>
                    <span className="text-gray-900 text-sm">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
