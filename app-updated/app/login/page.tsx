'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setAuth, endDashboardSession } from '@/utils/auth';
import { apiUrl } from '@/utils/api';
import { fetchLoginRoles, requestPasswordReset } from '@/utils/adminManagementApi';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleSlug, setRoleSlug] = useState('');
  const [roles, setRoles] = useState<{ name: string; slug: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetNote, setResetNote] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [emailHint, setEmailHint] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    endDashboardSession();
  }, []);

  useEffect(() => {
    fetchLoginRoles()
      .then((items) => setRoles(items))
      .catch(() => setRoles([]));
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const completeLogin = (data: { token?: string; admin?: { roleSlug?: string; isSuperAdmin?: boolean } }) => {
    if (!data.admin || (!data.admin.roleSlug && !data.admin.isSuperAdmin)) {
      endDashboardSession();
      router.replace('/unauthorized');
      return;
    }
    setAuth(data.token as string, data.admin as Parameters<typeof setAuth>[1]);
    router.replace('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setOtpInfo('');
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, roleSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Login failed');
        return;
      }

      if (data.requiresOtp && data.challengeId) {
        setChallengeId(data.challengeId);
        setEmailHint(data.emailHint || email);
        setOtp('');
        setOtpStep(true);
        setOtpInfo(data.message || 'A verification code has been sent to your email.');
        setResendCooldown(30);
        return;
      }

      completeLogin(data);
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpInfo('');
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          challengeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Invalid verification code');
        if (String(data?.message || '').toLowerCase().includes('sign in again')) {
          setOtpStep(false);
          setChallengeId('');
          setOtp('');
        }
        return;
      }

      completeLogin(data);
    } catch (err) {
      console.error('OTP verify error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setError('');
    setOtpInfo('');
    setResendLoading(true);

    try {
      const response = await fetch(apiUrl('/api/auth/resend-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          challengeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Failed to resend code');
        if (String(data?.message || '').toLowerCase().includes('sign in again')) {
          setOtpStep(false);
          setChallengeId('');
          setOtp('');
        }
        return;
      }

      if (data.challengeId) {
        setChallengeId(data.challengeId);
      }
      if (data.emailHint) {
        setEmailHint(data.emailHint);
      }
      setOtp('');
      setOtpInfo(data.message || 'A new verification code has been sent to your email.');
      setResendCooldown(30);
    } catch (err) {
      console.error('OTP resend error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setOtpStep(false);
    setOtp('');
    setChallengeId('');
    setEmailHint('');
    setOtpInfo('');
    setError('');
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');
    setResetLoading(true);

    try {
      const message = await requestPasswordReset({
        email: email.trim(),
        note: resetNote.trim(),
      });
      setResetMessage(message);
      setShowResetForm(false);
      setResetNote('');
    } catch (err) {
      setResetMessage(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setResetLoading(false);
    }
  };

  const fieldLabel: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    color: '#591727',
    fontFamily: 'var(--font-seasons-reg)',
    fontSize: '14px',
  };
  const fieldInput: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    marginBottom: '18px',
    fontSize: '14px',
    fontFamily: 'var(--font-seasons-reg)',
    boxSizing: 'border-box',
  };
  const primaryButton: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#711C31',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '15px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-seasons-reg)',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#f3f3f3', borderRadius: '16px', padding: '32px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginBottom: '24px', color: '#711C31', fontFamily: 'var(--font-seasons-reg)', fontSize: '28px', textAlign: 'center' }}>
          {otpStep ? 'Verify Login' : 'Admin Login'}
        </h1>

        {otpStep ? (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ marginBottom: '18px', color: '#591727', fontSize: '14px', lineHeight: 1.5, fontFamily: 'var(--font-seasons-reg)', textAlign: 'center' }}>
              Enter the 6-digit code sent to <strong>{emailHint || email}</strong>
            </p>

            <label style={fieldLabel}>Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              placeholder="000000"
              style={{
                ...fieldInput,
                letterSpacing: '0.35em',
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 600,
              }}
            />

            {error && (
              <div style={{ marginBottom: '16px', color: '#c33', background: '#fee', padding: '12px 14px', borderRadius: '10px' }}>
                {error}
              </div>
            )}

            {otpInfo && (
              <div style={{ marginBottom: '16px', color: '#2f6b2f', background: '#eef8ee', padding: '12px 14px', borderRadius: '10px' }}>
                {otpInfo}
              </div>
            )}

            <button type="submit" disabled={loading || otp.length !== 6} style={primaryButton}>
              {loading ? 'Verifying...' : 'Verify & continue'}
            </button>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => void handleResendOtp()}
                disabled={resendLoading || resendCooldown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#591727',
                  fontSize: '13px',
                  cursor: resendLoading || resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline',
                  opacity: resendLoading || resendCooldown > 0 ? 0.6 : 1,
                }}
              >
                {resendLoading
                  ? 'Sending...'
                  : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend code'}
              </button>
              <button
                type="button"
                onClick={handleBackToCredentials}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#591727',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Back to sign in
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <label style={fieldLabel}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="drghita101@gmail.com"
                style={fieldInput}
              />

              <label style={fieldLabel}>Password</label>
              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    fontFamily: 'var(--font-seasons-reg)',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#711C31',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <label style={fieldLabel}>Role</label>
              <select
                value={roleSlug}
                onChange={(e) => setRoleSlug(e.target.value)}
                required
                style={{
                  ...fieldInput,
                  backgroundColor: '#fff',
                  color: '#591727',
                }}
              >
                <option value="" disabled>
                  Select your assigned role
                </option>
                {roles.map((role) => (
                  <option key={role.slug} value={role.slug}>
                    {role.name}
                  </option>
                ))}
              </select>

              {error && (
                <div style={{ marginBottom: '16px', color: '#c33', background: '#fee', padding: '12px 14px', borderRadius: '10px' }}>
                  {error}
                </div>
              )}

              {resetMessage && (
                <div style={{ marginBottom: '16px', color: '#2f6b2f', background: '#eef8ee', padding: '12px 14px', borderRadius: '10px' }}>
                  {resetMessage}
                </div>
              )}

              <button type="submit" disabled={loading} style={primaryButton}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div style={{ marginTop: '18px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowResetForm((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#591727',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Forgot password? Request reset from Super Admin
              </button>
            </div>

            {showResetForm && (
              <form onSubmit={handlePasswordResetRequest} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#591727', fontSize: '13px' }}>
                  Optional note for Super Admin
                </label>
                <textarea
                  value={resetNote}
                  onChange={(e) => setResetNote(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                    marginBottom: '12px',
                    fontSize: '13px',
                    resize: 'vertical',
                  }}
                />
                <button
                  type="submit"
                  disabled={resetLoading || !email.trim()}
                  style={{
                    width: '100%',
                    backgroundColor: '#591727',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '14px',
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {resetLoading ? 'Submitting...' : 'Submit password reset request'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
