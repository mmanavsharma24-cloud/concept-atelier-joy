const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

// Get own profile
exports.getOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, full_name, email, phone, address, bio, department, role, profile_photo, phone_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Get user profile (admin/hr only)
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is admin or hr
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'SELECT id, full_name, email, phone, address, bio, department, role, profile_photo, phone_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update own profile
exports.updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, address, bio } = req.body;

    const result = await pool.query(
      'UPDATE users SET phone = $1, address = $2, bio = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, full_name, email, phone, address, bio, department, role, profile_photo, phone_verified, created_at',
      [phone || null, address || null, bio || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Update user profile (admin/hr only)
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, phone, address, bio, department, phone_verified } = req.body;

    // Check if user is admin or hr
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), address = COALESCE($3, address), bio = COALESCE($4, bio), department = COALESCE($5, department), phone_verified = COALESCE($6, phone_verified), updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING id, full_name, email, phone, address, bio, department, role, profile_photo, phone_verified, created_at',
      [full_name, phone, address, bio, department, phone_verified, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

// Upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    const photoPath = `/uploads/profiles/${req.file.filename}`;

    const result = await pool.query(
      'UPDATE users SET profile_photo = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING profile_photo',
      [photoPath, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Photo uploaded successfully', profile_photo: result.rows[0].profile_photo });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

// Update last login
exports.updateLastLogin = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Last login updated' });
  } catch (error) {
    console.error('Error updating last login:', error);
    res.status(500).json({ error: 'Failed to update last login' });
  }
};
