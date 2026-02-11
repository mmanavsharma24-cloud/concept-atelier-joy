import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Modal from './Modal';

const UserProfileModal = ({ userId, isOpen, onClose, onUpdate }) => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '', bio: '', department: '', phone_verified: false, profile_photo: null });

  useEffect(() => { if (isOpen && userId) fetchProfile(); }, [isOpen, userId]);

  const fetchProfile = async () => {
    try { setLoading(true); const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`, { headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw new Error('Failed to fetch profile'); const data = await response.json(); setProfile(data); setFormData({ full_name: data.full_name || '', phone: data.phone || '', address: data.address || '', bio: data.bio || '', department: data.department || '', phone_verified: data.phone_verified || false, profile_photo: null }); if (data.profile_photo) setPhotoPreview(`http://localhost:5000${data.profile_photo}`); setLoading(false); }
    catch (err) { setError(err.message); setLoading(false); }
  };

  const handleInputChange = (e) => { const { name, value, type, checked } = e.target; setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };
  const handlePhotoChange = (e) => { const file = e.target.files[0]; if (file) { setFormData(prev => ({ ...prev, profile_photo: file })); const reader = new FileReader(); reader.onloadend = () => setPhotoPreview(reader.result); reader.readAsDataURL(file); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      if (formData.profile_photo) { const photoFormData = new FormData(); photoFormData.append('profile_photo', formData.profile_photo); const photoResponse = await fetch('http://localhost:5000/api/users/profile/upload-photo', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: photoFormData }); if (!photoResponse.ok) throw new Error('Failed to upload photo'); }
      const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ full_name: formData.full_name, phone: formData.phone, address: formData.address, bio: formData.bio, department: formData.department, phone_verified: formData.phone_verified }) });
      if (!response.ok) throw new Error('Failed to update profile'); const data = await response.json(); setProfile(data.user); setIsEditing(false); setSuccess('Profile updated successfully'); if (onUpdate) onUpdate(); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
  };

  if (!isOpen) return null;

  const inputClass = "py-2 px-2.5 border border-gray-300 rounded-md text-[13px] font-inherit transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
      <div className="p-5">
        {loading ? <p>Loading...</p> : (
          <>
            {error && <div className="py-3 px-4 rounded-md mb-5 text-sm bg-red-100 text-red-800 border border-red-200">{error}</div>}
            {success && <div className="py-3 px-4 rounded-md mb-5 text-sm bg-green-100 text-green-800 border border-green-200">{success}</div>}

            <div className="grid grid-cols-[150px_1fr] gap-8 max-sm:grid-cols-1">
              <div className="flex flex-col items-center gap-3">
                <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-[3px] border-gray-300 flex items-center justify-center bg-gray-50">
                  {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center">No Photo</div>}
                </div>
                {isEditing && <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full p-1.5 border border-gray-300 rounded-md text-xs" />}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                  {[
                    { name: 'full_name', label: 'Full Name', type: 'text' },
                    { name: 'email', label: 'Email', type: 'email', value: profile?.email || '', disabled: true },
                    { name: 'phone', label: 'Phone', type: 'tel' },
                    { name: 'address', label: 'Address', type: 'text' },
                    { name: 'bio', label: 'Bio', type: 'textarea' },
                    { name: 'department', label: 'Department', type: 'text' },
                  ].map((field, i) => (
                    <div key={field.name} className={`flex flex-col gap-1.5 ${i >= 2 ? 'col-span-full' : ''}`}>
                      <label className="font-semibold text-gray-700 text-[13px]">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea name={field.name} value={formData[field.name]} onChange={handleInputChange} className={`${inputClass} resize-y min-h-[80px]`} rows="3" />
                      ) : (
                        <input type={field.type} name={field.name} value={field.disabled ? field.value : formData[field.name]} onChange={field.disabled ? undefined : handleInputChange} disabled={field.disabled} className={`${inputClass} ${field.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`} />
                      )}
                    </div>
                  ))}
                  <div className="col-span-full flex flex-row items-center gap-2">
                    <label className="flex items-center gap-2 font-semibold text-gray-700 text-[13px]">
                      <input type="checkbox" name="phone_verified" checked={formData.phone_verified} onChange={handleInputChange} className="w-4 h-4 cursor-pointer" />
                      Phone Verified
                    </label>
                  </div>
                  <div className="col-span-full flex gap-2.5 mt-4">
                    <button type="submit" className="py-2 px-4 border-none rounded-md cursor-pointer text-[13px] font-medium transition-all bg-blue-500 text-white hover:bg-blue-700">Save Changes</button>
                    <button type="button" className="py-2 px-4 border-none rounded-md cursor-pointer text-[13px] font-medium transition-all bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                  {[
                    { label: 'Full Name', value: profile?.full_name || '-' },
                    { label: 'Email', value: profile?.email || '-' },
                    { label: 'Phone', value: profile?.phone || 'Not provided' },
                    { label: 'Address', value: profile?.address || 'Not provided' },
                    { label: 'Bio', value: profile?.bio || 'Not provided' },
                    { label: 'Department', value: profile?.department || '-' },
                    { label: 'Phone Verified', value: profile?.phone_verified ? 'Yes' : 'No' },
                    { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 p-2.5 bg-gray-50 rounded-md">
                      <span className="font-semibold text-gray-500 text-[11px] uppercase">{item.label}:</span>
                      <span className="text-gray-800 text-[13px]">{item.value}</span>
                    </div>
                  ))}
                  <button className="col-span-full mt-2.5 py-2 px-4 border-none rounded-md cursor-pointer text-[13px] font-medium transition-all bg-blue-500 text-white hover:bg-blue-700" onClick={() => setIsEditing(true)}>Edit Profile</button>
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
