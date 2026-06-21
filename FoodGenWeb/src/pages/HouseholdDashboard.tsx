import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HouseholdDashboard() {
  const {
    user,
    household,
    householdRole,
    householdMembers,
    pendingJoinRequests,
    pendingInvites,
    createHousehold,
    joinHousehold,
    acceptInvite,
    rejectInvite,
    leaveHousehold,
    isLoading,
    error,
  } = useMealPlan();

  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('viewer');
  const [localError, setLocalError] = useState('');

  // Redirect if no user
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-area">
          <LoadingSpinner text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // User has a household
  if (household) {
    return (
      <div className="page-container">
        <div className="header">
          <div className="header-title">
            <span className="app-title">🏠 Household</span>
          </div>
        </div>
        <div className="content-area">
          <div className="household-dashboard">
            <div className="dashboard-header">
              <h1>Welcome, {user.displayName}!</h1>
              <p className="household-name">🏠 {household.name}</p>
              <span className="role-badge">{householdRole}</span>
            </div>

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <div className="pending-invites">
                <h2>Pending Invites</h2>
                {pendingInvites.map((invite) => (
                  <div key={invite.inviteId} className="invite-card">
                    <p>
                      <strong>{invite.invitedByName}</strong> invited you to join as{' '}
                      <em>{invite.role}</em>
                    </p>
                    <div className="button-group">
                      <button
                        onClick={() => acceptInvite(invite.inviteId)}
                        className="accept-button"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectInvite(invite.inviteId)}
                        className="reject-button"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Household Info */}
            <div className="household-info">
              <h2>Household Details</h2>
              <p>📍 {household.address.city}, {household.address.state}</p>
              <p>👥 {householdMembers.length} / {household.maxMembers} members</p>
              <p>📅 Week starts on {household.weekStartDay}</p>
            </div>

            {/* Actions */}
            <div className="dashboard-actions">
              <button
                onClick={() => navigate('/day')}
                className="primary-btn"
              >
                📅 Go to Meal Plans
              </button>

              {householdRole === 'admin' && (
                <button
                  onClick={() => navigate('/household/manage')}
                  className="secondary-btn"
                >
                  ⚙️ Manage Household
                </button>
              )}

              <button
                onClick={leaveHousehold}
                className="danger-btn"
              >
                Leave Household
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has no household
  return (
    <div className="page-container">
      <div className="header">
        <div className="header-title">
          <span className="app-title">🏠 Household</span>
        </div>
      </div>
      <div className="content-area">
        <div className="household-dashboard">
          <div className="dashboard-header">
            <h1>Welcome, {user.displayName}!</h1>
            <p>You're not part of a household yet.</p>
          </div>

          {(error || localError) && (
            <div className="error-message">{error || localError}</div>
          )}

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="pending-invites">
              <h2>Pending Invites</h2>
              {pendingInvites.map((invite) => (
                <div key={invite.inviteId} className="invite-card">
                  <p>
                    <strong>{invite.invitedByName}</strong> invited you to join as{' '}
                    <em>{invite.role}</em>
                  </p>
                  <div className="button-group">
                    <button
                      onClick={() => acceptInvite(invite.inviteId)}
                      className="accept-button"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectInvite(invite.inviteId)}
                      className="reject-button"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="dashboard-actions">
            <button
              onClick={() => setShowCreateForm(true)}
              className="primary-btn"
            >
              ➕ Create Household
            </button>
            <button
              onClick={() => setShowJoinForm(true)}
              className="secondary-btn"
            >
              🔗 Join Household
            </button>
          </div>

          {/* Create Household Form */}
          {showCreateForm && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Create Household</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLocalError('');
                    try {
                      await createHousehold({
                        name: householdName,
                        address: {
                          street: '',
                          city: '',
                          state: '',
                          postcode: '',
                          country: '',
                        },
                        maxMembers: 10,
                        weekStartDay: 'monday',
                        description: '',
                      });
                      setShowCreateForm(false);
                      setHouseholdName('');
                    } catch (err: any) {
                      setLocalError(err.message || 'Failed to create household');
                    }
                  }}
                >
                  <div className="form-group">
                    <label className="form-label" htmlFor="householdName">Household Name</label>
                    <input
                      id="householdName"
                      className="form-input"
                      type="text"
                      value={householdName}
                      onChange={(e) => setHouseholdName(e.target.value)}
                      placeholder="My Family"
                      required
                    />
                  </div>
                  <div className="button-group">
                    <button type="submit" className="primary-btn">
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="secondary-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Join Household Form */}
          {showJoinForm && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Join Household</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLocalError('');
                    try {
                      await joinHousehold(inviteCode, selectedRole);
                      setShowJoinForm(false);
                      setInviteCode('');
                    } catch (err: any) {
                      setLocalError(err.message || 'Failed to join household');
                    }
                  }}
                >
                  <div className="form-group">
                    <label className="form-label" htmlFor="inviteCode">Invite Code</label>
                    <input
                      id="inviteCode"
                      className="form-input"
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="ABC12345"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="role">Role</label>
                    <select
                      id="role"
                      className="form-input"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as 'editor' | 'viewer')}
                    >
                      <option value="viewer">Viewer (view only)</option>
                      <option value="editor">Editor (can plan meals)</option>
                    </select>
                  </div>
                  <div className="button-group">
                    <button type="submit" className="primary-btn">
                      Join
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowJoinForm(false)}
                      className="secondary-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}