import React from 'react';

function ProfileTemplate({ profile }) {
    return (
        <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
                <div className="text-center mb-5">
                    <div className="display-1 text-primary mb-3">
                        <i className="fas fa-user-circle"></i>
                    </div>
                    <h2 className="card-title mb-0">{profile.UserName}</h2>
                    <p className="text-muted">Provider Profile</p>
                </div>

                <div className="mb-4">
                    <div className="p-4 rounded-4 bg-light">
                        <div className="mb-3">
                            <i className="fas fa-envelope text-primary me-2"></i>
                            <strong>Email:</strong>
                            <p className="ms-4 mb-0">{profile.Email}</p>
                        </div>
                        <div className="mb-3">
                            <i className="fas fa-phone text-primary me-2"></i>
                            <strong>Mobile:</strong>
                            <p className="ms-4 mb-0">{profile.Mobile}</p>
                        </div>
                        <div className="mb-3">
                            <i className="fas fa-map-marker-alt text-primary me-2"></i>
                            <strong>Location:</strong>
                            <p className="ms-4 mb-0">{profile.Location || "Not Provided"}</p>
                        </div>
                        <div className="mb-3">
                            <i className="fas fa-calendar-alt text-primary me-2"></i>
                            <strong>Date of Sport:</strong>
                            <p className="ms-4 mb-0">{profile.Date || "Not Provided"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileTemplate;
