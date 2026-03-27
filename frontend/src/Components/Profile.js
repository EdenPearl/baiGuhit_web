import React, { useState, useEffect } from 'react';
const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";
const Profile = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    bio: '',
    phone: '',
    address: '',
    nation: '',
    gender: '',
    language: 'English',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setError('No session ID found. Please log in.');
          return;
        }

        // Fetch user data (username, user_id, email)
        const userResponse = await fetch(
          url_t + 'auth/user_profile',
          {
            method: 'GET',
            headers: {
              'session-id': sessionId,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`);
        }

        const userResult = await userResponse.json();
        if (!userResult.user) {
          setError('User data not found');
          return;
        }

        // Store user_id and update formData with user data
        const userId = userResult.user.id;
        localStorage.setItem('userId', userId.toString());
        setFormData((prev) => ({
          ...prev,
          username: userResult.user.username || '',
          email: userResult.user.email || '',
        }));

        // Fetch profile data using /profile/get/:user_id
        const profileResponse = await fetch(url_t +
          `profile/get/${userId}`,
          {
            method: 'GET',
            headers: {
              'session-id': sessionId,
            },
          }
        );

        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            // Profile not found; keep default form values for insert
            console.warn('Profile not found for user_id:', userId);
          } else {
            throw new Error(`HTTP error! status: ${profileResponse.status}`);
          }
        } else {
          const profileResult = await profileResponse.json();
          if (profileResult.profile) {
            setFormData((prev) => ({
              ...prev,
              firstname: profileResult.profile.firstname || '',
              lastname: profileResult.profile.lastname || '',
              email: profileResult.profile.email || prev.email, // Prefer /auth/user_profile email if present
              bio: profileResult.profile.bio || '',
              phone: profileResult.profile.phone || '',
              address: profileResult.profile.address || '',
              nation: profileResult.profile.nation || '',
              gender: profileResult.profile.gender || '',
              language: profileResult.profile.language || 'English',
            }));
            if (profileResult.profile.profile_image) {
              setProfileImagePreview(
                url_t + `Uploads/${profileResult.profile.profile_image}`
              );
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user or profile data:', error);
        setError(`Error fetching data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Only JPEG, PNG, or GIF images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(file);
      setProfileImagePreview(previewUrl);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    const sessionId = localStorage.getItem('sessionId');
    const userId = localStorage.getItem('userId');
    if (!sessionId || !userId) {
      setError('No session ID or user ID found. Please log in.');
      setIsLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.firstname || !formData.lastname || !formData.email) {
      setError('First Name, Last Name, and Email are required');
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('user_id', userId);
    formDataToSend.append('firstname', formData.firstname);
    formDataToSend.append('lastname', formData.lastname);
    formDataToSend.append('email', formData.email);
    if (formData.password) {
      formDataToSend.append('password', formData.password);
    }
    formDataToSend.append('bio', formData.bio);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('nation', formData.nation);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('language', formData.language);
    if (profileImage) {
      formDataToSend.append('profile_image', profileImage);
    }

    try {
      const response = await fetch(url_t +'profile/insert', {
        method: 'POST',
        headers: {
          'session-id': sessionId,
        },
        body: formDataToSend,
      });

      const contentType = response.headers.get('content-type');
      console.log('Response status:', response.status);
      console.log('Response content-type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Expected JSON, received ${contentType || 'no content-type'}: ${text}`);
      }

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message || 'Profile saved successfully');
        setFormData((prev) => ({ ...prev, password: '' }));
        // Optionally refetch profile data to update UI
        const profileResponse = await fetch(url_t +
          `profile/get/${userId}`,
          {
            method: 'GET',
            headers: {
              'session-id': sessionId,
            },
          }
        );
        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          if (profileResult.profile) {
            setFormData((prev) => ({
              ...prev,
              firstname: profileResult.profile.firstname || '',
              lastname: profileResult.profile.lastname || '',
              email: profileResult.profile.email || prev.email,
              bio: profileResult.profile.bio || '',
              phone: profileResult.profile.phone || '',
              address: profileResult.profile.address || '',
              nation: profileResult.profile.nation || '',
              gender: profileResult.profile.gender || '',
              language: profileResult.profile.language || 'English',
            }));
            if (profileResult.profile.profile_image) {
              setProfileImagePreview(url_t +
                `Uploads/${profileResult.profile.profile_image}`
              );
            }
          }
        }
      } else {
        setError(result.error || `Failed to save profile (status: ${response.status})`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(`Error saving profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // JSX remains the same as your original code
  return (
    <>
      <style>{`
          .profile-wrapper {
            display: flex;
            min-height: 100vh;
            background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .main-content {
            flex: 1;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            position: relative;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .header-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #ffffff;
          }
          .header-actions {
            display: flex;
            gap: 10px;
          }
          .save-button {
            padding: 10px 20px;
            background: #28A745;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s ease, transform 0.2s ease;
          }
          .save-button:hover {
            background: #218838;
            transform: translateY(-2px);
          }
          .cancel-link {
            padding: 10px;
            color: #ffffff;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
          }
          .cancel-link:hover {
            color: rgba(255, 255, 255, 0.8);
          }
          .profile-container {
            display: flex;
            gap: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          .profile-image-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          .profile-image-container {
            position: relative;
          }
          .profile-image {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            object-fit: cover;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          .profile-image-placeholder {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            background: rgba(255, 255, 255, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.8);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          .edit-icon {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: #28A745;
            color: #ffffff;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
          }
          .profile-form {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .form-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #ffffff;
          }
          .form-input, .form-select {
            padding: 10px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
            font-size: 14px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .form-input:focus, .form-select:focus {
            outline: none;
            border-color: #ffffff;
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
          }
          .password-container {
            position: relative;
            display: flex;
            align-items: center;
          }
          .password-toggle {
            position: absolute;
            right: 10px;
            background: none;
            border: none;
            color: #ffffff;
            cursor: pointer;
            font-size: 14px;
          }
          .message {
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
          .error {
            background: rgba(255, 0, 0, 0.2);
            color: #ffffff;
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid rgba(255, 0, 0, 0.5);
          }
          .spinner {
            display: inline-block;
            width: 1.25rem;
            height: 1.25rem;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 0.5rem;
          }
          .loading-container {
            display: flex;
            justify-content: center;
            padding: 1.5rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @media (max-width: 768px) {
            .profile-container {
              flex-direction: column;
              align-items: center;
            }
            .profile-form {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      <div className="profile-wrapper">
        <div className="main-content">
          <div className="header">
            <h1 className="header-title">My Profile</h1>
            <div className="header-actions">
              <button className="save-button" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <span>
                    <span className="spinner"></span>
                    Saving...
                  </span>
                ) : 'Save'}
              </button>
              <a href="/home" className="cancel-link">Cancel</a>
            </div>
          </div>
          {message && <div className="message">{message}</div>}
          {error && <div className="error">{error}</div>}
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="profile-container">
              <div className="profile-image-section">
                <div className="profile-image-container">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="User profile" className="profile-image" />
                  ) : (
                    <div className="profile-image-placeholder">No Image</div>
                  )}
                  <label className="edit-icon">
                    ✏️
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="password-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter new password (optional)"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <input
                    type="text"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nation</label>
                  <input
                    type="text"
                    name="nation"
                    value={formData.nation}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="English">English</option>
                    <option value="Filipino">Filipino</option>
                    <option value="Bisaya">Bisaya</option>
                  </select>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;