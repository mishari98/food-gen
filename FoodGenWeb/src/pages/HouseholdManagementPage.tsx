import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';

export default function HouseholdManagementPage() {
  const navigate = useNavigate();
  const {
    household,
    householdRole,
    householdMembers,
    pendingJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
    inviteUser,
    regenerateInviteCode,
    leaveHousehold,
  } = useMealPlan();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [localError, setLocalError] = useState('');

  if (!household || householdRole !== 'admin') {
    return (
      <div className="page-container">
        <div className="header">
          <button className="icon-btn" onClick={() => navigate('/settings')}>←</button>
          <div className="header-title"><span className="app-title">⚙️ Household</span></div>
          <div style={{ width: 40 }} />
        </div>
        <div className="content-area">
          <p>Only admins can manage household settings.</p>
        </div>
      </div>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!inviteEmail.trim()) return;
    try {
      await inviteUser(inviteEmail, inviteRole);
      setInviteEmail('');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send invite');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button className="icon-btn" onClick={() => navigate('/settings')}>←</button>
        <div className="header-title"><span className="app-title">⚙️ Manage Household</span></div>
        <div style={{ width: 40 }} />
      </div>

      <div className="content-area">
        {localError && <div className="error-message">{localError}</div>}

        {/* Household Info */}
        <div className="settings-section">
          <h3>🏠 {household.name}</h3>
          <p>📍 {household.address.city}, {household.address.state}</p>
          <p>👥 {householdMembers.length} / {household.maxMembers} members</p>
          <p>📅 Week starts on {household.weekStartDay}</p>
          <p>🔗 Invite Code: <strong>{household.inviteCode}</strong></p>
        </div>

        {/* Members */}
        <div className="settings-section">
          <h3>Members</h3>
          {householdMembers.map(member => (
            <div key={member.uid} className="member-row">
              <span className="member-name">👤 {member.displayName || member.email}</span>
              <span className="role-badge">{member.role}</span>
            </div>
          ))}
        </div>

        {/* Pending Requests */}
        {pendingJoinRequests.length > 0 && (
          <div className="settings-section">
            <h3>Pending Requests</h3>
            {pendingJoinRequests.map(request => (
              <div key={request.uid} className="request-row">
                <div className="request-info">
                  <span className="member-name">👤 {request.displayName}</span>
                  <span className="request-email">({request.email})</span>
                  <span className="role-badge">{request.requestedRole}</span>
                </div>
                <div className="button-group">
                  <button onClick={() => acceptJoinRequest(request.uid)} className="accept-button">Accept</button>
                  <button onClick={() => rejectJoinRequest(request.uid)} className="reject-button">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invite Form */}
        <div className="settings-section">
          <h3>Invite Member</h3>
          <form onSubmit={handleInvite}>
            <div className="form-group">
              <label className="form-label" htmlFor="inviteEmail">Email Address</label>
              <input
                id="inviteEmail"
                className="form-input"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="inviteRole">Role</label>
              <select
                id="inviteRole"
                className="form-input"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
              >
                <option value="viewer">Viewer (view only)</option>
                <option value="editor">Editor (can plan meals)</option>
              </select>
            </div>
            <button type="submit" className="primary-btn" style={{ width: '100%' }}>
              Send Invite
            </button>
          </form>
        </div>

        {/* Regenerate Code */}
        <div className="settings-section">
          <button onClick={regenerateInviteCode} className="secondary-btn" style={{ width: '100%' }}>
            🔄 Regenerate Invite Code
          </button>
        </div>

        {/* Leave */}
        <div className="settings-section">
          <button onClick={() => {
            if (window.confirm('Leave this household?')) {
              leaveHousehold();
              navigate('/dashboard');
            }
          }} className="danger-btn" style={{ width: '100%' }}>
            Leave Household
          </button>
        </div>
      </div>
    </div>
  );
}