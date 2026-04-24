import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, CheckCircle, ShieldCheck } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { resetPassword, addToast } = useLibrary();
  const { token } = useParams();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters');

    setLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/auth'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nexus-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#020617',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ 
          maxWidth: '480px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'rgba(99, 102, 241, 0.1)', 
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)'
          }}>
            <ShieldCheck size={32} color="#6366f1" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '8px' }}>Identity Update</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Choose a strong, unique password</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: '#10b981', 
              padding: '20px', 
              borderRadius: '12px', 
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.95rem'
            }}>
              <CheckCircle size={32} />
              Protocol updated. Access restored. Redirecting to login...
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="new-password" style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.85rem' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={18} 
                  color="#94a3b8" 
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
                />
                <input 
                  id="new-password"
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 48px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="confirm-password" style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.85rem' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={18} 
                  color="#94a3b8" 
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
                />
                <input 
                  id="confirm-password"
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 48px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', 
                padding: '12px', 
                borderRadius: '8px', 
                fontSize: '0.85rem',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s, opacity 0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
