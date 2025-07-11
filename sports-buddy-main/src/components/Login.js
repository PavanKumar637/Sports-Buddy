import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

// Configure axios
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5678'
    : 'https://service-hunt-react-1.onrender.com';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        
        setLoading(true);
        setError('');

        try {
            const { email, password } = formData;

            // Basic validation
            if (!email || !password) {
                setError('Please enter both email and password');
                setLoading(false);
                return;
            }

            console.log('Sending login request...');
            const response = await axios.post('/api/login', { email, password });
            console.log('Login response:', response.data);
            
            if (response.data && response.data.success) {
                // Store user info in cookies
                Cookies.set('email', email);
                Cookies.set('username', email.split('@')[0]);
                console.log('Cookies set:', { email: Cookies.get('email'), username: Cookies.get('username') });
                // Redirect to create profile page
                navigate('/create-profile');
            } else {
                setError(response.data?.message || 'Invalid credentials. Please check your email and password.');
            }
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            if (error.response?.status === 401) {
                setError('Invalid email or password');
            } else {
                setError(error.response?.data?.message || 'Server error. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg border-0 rounded-4 p-4 bg-white bg-opacity-95">
                            <div className="card-body">
                                <h2 className="text-primary fw-bold text-center mb-4">Login</h2>
                                
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            required
                                            disabled={loading}
                                            placeholder='Email'
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            required
                                            disabled={loading}
                                            placeholder='Password'
                                        />
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary btn-lg rounded-pill py-3"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Signing in...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-sign-in-alt me-2"></i>
                                                    Sign In
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary btn-lg rounded-pill py-3"
                                            onClick={handleBack}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-arrow-left me-2"></i>
                                            Back
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

export default Login;
