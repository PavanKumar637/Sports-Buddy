import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5678'
    : 'https://service-hunt-react-1.onrender.com';

function CreateProfile() {
    const navigate = useNavigate();
    const email = Cookies.get('email');
    const isEditing = window.location.pathname === '/edit-profile';

    const [formData, setFormData] = useState({
        userName: '',
        email: email || '',
        mobileNumber: '',
        sport: '',
        location: '',
        date: new Date().toISOString().slice(0, 16) // Set default date
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/login');
            return;
        }

        if (isEditing) {
            fetchExistingPost();
        } else {
            getCityFromIP();
        }
    }, [email, navigate, isEditing]);

    const fetchExistingPost = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/get-post/${email}`);
            if (response.data && response.data.success) {
                const post = response.data.post;
                setFormData({
                    userName: post.userName || '',
                    email: post.email || '',
                    mobileNumber: post.mobileNumber || '',
                    sport: post.sport || '',
                    location: post.location || '',
                    date: post.date || new Date().toISOString().slice(0, 16)
                });
                if (!post.location) {
                    getCityFromIP();
                }
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            setError('Failed to load post data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getCityFromIP = async () => {
        try {
            const response = await axios.get('https://ipapi.co/json/', {
                withCredentials: false
            });
            if (response.data && response.data.city) {
                setFormData(prev => ({
                    ...prev,
                    location: response.data.city
                }));
            }
        } catch (error) {
            console.error('Error fetching city:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = {
                email: email,
                userName: formData.userName,
                mobileNumber: formData.mobileNumber,
                sport: formData.sport,
                location: formData.location,
                date: formData.date
            };

            if (isEditing) {
                const response = await axios.put(`${API_URL}/edit-post/${email}`, data);
                if (response.data && response.data.success) {
                    alert('Sports post updated successfully!');
                    navigate('/provider-dashboard');
                } else {
                    throw new Error(response.data?.message || 'Failed to update sports post');
                }
            } else {
                const response = await axios.post(`${API_URL}/create-post`, data);
                if (response.data && response.data.success) {
                    alert('Sports post created successfully!');
                    navigate('/provider-dashboard');
                } else {
                    throw new Error(response.data?.message || 'Failed to create sports post');
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/provider-dashboard');
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card shadow-lg border-0 rounded-4 p-4 bg-white bg-opacity-95">
                            <div className="card-body">
                                <h2 className="text-center mb-4 text-primary fw-bold">{isEditing ? 'Edit Profile' : 'Create a Sport Post'}</h2>

                                {error && (
                                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        {error}
                                        <button type="button" className="btn-close" onClick={() => setError('')}></button>
                                    </div>
                                )}

                                
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg rounded-3"
                                                value={formData.userName}
                                                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                                placeholder="Your name"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg rounded-3"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="Your email"
                                                disabled
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Sport</label>
                                            <select
                                                className="form-select form-select-lg rounded-3"
                                                value={formData.sport}
                                                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                                                required
                                            >
                                                <option value="">Select a sport</option>
                                                <option value="Marathon">Marathon</option>
                                                <option value="Running">Running</option>
                                                <option value="Cricket">Cricket</option>
                                                <option value="Football">Football</option>
                                                <option value="Kabaddi">Kabaddi</option>
                                                <option value="Chess">Chess</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Mobile Number</label>
                                            <input
                                                type="tel"
                                                className="form-control form-control-lg rounded-3"
                                                value={formData.mobileNumber}
                                                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                                required
                                                pattern="[0-9]{10}"
                                                placeholder="10-digit mobile number"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Location</label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg rounded-3"
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    placeholder="Your location"
                                                    required
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={getCityFromIP}
                                                    id="btnGetLocation"
                                                >
                                                    Get Location
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Date</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control form-control-lg rounded-3"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="d-grid gap-2 mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg rounded-pill py-3"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    {isEditing ? 'Saving...' : 'Creating Profile...'}
                                                </>
                                            ) : (
                                                isEditing ? 'Save Changes' : 'Create Profile'
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-lg rounded-pill py-3"
                                            onClick={handleCancel}
                                            id={isEditing ? "btnCancelEdit" : "btnCancelCreate"}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateProfile;
