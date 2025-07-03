import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5678'
    : 'https://service-hunt-react-1.onrender.com';

function UserDashboard() {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        sport: '',
        location: ''
    });
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const loadProviders = async () => {
        try {
            const response = await axios.get(`${API_URL}/sportsInfo`, {
                withCredentials: true
            });
            if (response.data && Array.isArray(response.data)) {
                setProviders(response.data);
                setFilteredProviders(response.data);
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (error) {
            console.error('Error loading providers:', error);
            setError('Unable to load service providers. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProviders();
    }, []);

    const applyFilters = (currentFilters = filters) => {
        let result = [...providers];

        if (currentFilters.sport) {
            result = result.filter(provider => 
                provider.sport && provider.sport.toLowerCase() === currentFilters.sport.toLowerCase()
            );
        }

        if (currentFilters.location) {
            result = result.filter(provider => 
                provider.location?.toLowerCase().includes(currentFilters.location.toLowerCase())
            );
        }

        setFilteredProviders(result);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const resetFilters = () => {
        const defaultFilters = {
            sport: '',
            location: ''
        };
        setFilters(defaultFilters);
        setFilteredProviders(providers);
    };

    const getCityFromIP = async () => {
        try {
            const response = await axios.get('https://ipapi.co/json/', {
                withCredentials: false // Don't send credentials for external API
            });
            if (response.data && response.data.city) {
                const newFilters = { ...filters, location: response.data.city };
                setFilters(newFilters);
                applyFilters(newFilters);
            }
        } catch (error) {
            console.error('Location detection error:', error);
            // Don't show error to user as this is not critical
        }
    };

    return (
        <div className="min-vh-100 bg-light">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
                <div className="container-fluid">
                    <a 
                        href="/"
                        className="text-white text-decoration-none"
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Home
                    </a>
                    <span className="navbar-brand">Sports Buddy</span>
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <i className="fas fa-filter"></i>
                    </button>
                </div>
            </nav>

            <div className="container-fluid py-4">
                <div className="row">
                    {/* Filter Sidebar */}
                    <div className={`col-lg-3 mb-4 ${showFilters ? 'show' : 'd-none d-lg-block'}`}>
                        <div className="position-sticky" style={{ top: '76px' }}>
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="card-title mb-0">Filters</h5>
                                        <button 
                                            className="btn btn-outline-secondary btn-sm d-lg-none"
                                            onClick={() => setShowFilters(false)}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Sport Type</label>
                                        <select
                                            className="form-select"
                                            name="sport"
                                            value={filters.sport}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">All Sports</option>
                                            <option value="Marathon">Marathon</option>
                                            <option value="Running">Running</option>
                                            <option value="Cricket">Cricket</option>
                                            <option value="Football">Football</option>
                                            <option value="Kabaddi">Kabaddi</option>
                                            <option value="Chess">Chess</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Location</label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="location"
                                                value={filters.location}
                                                onChange={handleFilterChange}
                                                placeholder="Enter location"
                                            />
                                            <button 
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={getCityFromIP}
                                                title="Use Current Location"
                                            >
                                                <i className="fas fa-map-marker-alt"></i>
                                            </button>
                                        </div>
                                    </div>



                                    <button 
                                        className="btn btn-primary w-100 mb-2"
                                        onClick={() => applyFilters()}
                                    >
                                        Apply Filters
                                    </button>
                                    <button 
                                        className="btn btn-outline-secondary w-100"
                                        onClick={resetFilters}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-9">
                        {error && (
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                {error}
                                <button type="button" className="btn-close" onClick={() => setError('')}></button>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {filteredProviders.map((provider, index) => (
                                    <div key={provider.email || index} className="col-md-6 col-xl-4">
                                        <div className="card h-100 shadow-sm">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="card-title mb-1">
                                                            <i className="fas fa-running text-primary me-2"></i>
                                                            {provider.sport}
                                                        </h5>
                                                        <p className="card-text text-muted mb-0">
                                                            <i className="fas fa-map-marker-alt me-1"></i>
                                                            {provider.location || 'Location not specified'}
                                                        </p>
                                                        <p className="card-text text-muted mb-0">
                                                            <i className="fas fa-calendar me-1"></i>
                                                            {new Date(provider.date).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#providerModal"
                                                        onClick={() => setSelectedProvider(provider)}
                                                    >
                                                        <i className="fas fa-info-circle me-1"></i>Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Provider Details Modal */}
            <div className="modal fade" id="providerModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Sport Details</h5>
                            <button 
                                type="button" 
                                className="btn-close btn-close-white" 
                                data-bs-dismiss="modal"
                                onClick={() => setSelectedProvider(null)}
                            ></button>
                        </div>
                        {selectedProvider && (
                            <div className="modal-body">
                                <div className="mb-4">
                                    <h5 className="mb-1">
                                        <i className="fas fa-running text-primary me-2"></i>
                                        {selectedProvider.sport}
                                    </h5>
                                    <p className="text-muted mb-0">
                                        <i className="fas fa-map-marker-alt me-2"></i>
                                        {selectedProvider.location || 'Location not specified'}
                                    </p>
                                    <p className="text-muted mb-0">
                                        <i className="fas fa-calendar me-2"></i>
                                        {new Date(selectedProvider.date).toLocaleString()}
                                    </p>
                                </div>
                                
                                <div className="border-top pt-3">
                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <small className="text-muted d-block">Name</small>
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-user text-primary me-2"></i>
                                                <span>{selectedProvider.userName}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="col-12 mb-3">
                                            <small className="text-muted d-block">Email</small>
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-envelope text-primary me-2"></i>
                                                <span>{selectedProvider.email}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="col-12 mb-3">
                                            <small className="text-muted d-block">Mobile</small>
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-phone text-primary me-2"></i>
                                                <span>{selectedProvider.mobileNumber || 'Not provided'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                data-bs-dismiss="modal"
                                onClick={() => setSelectedProvider(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
