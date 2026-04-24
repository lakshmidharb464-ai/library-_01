import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { motion } from 'framer-motion';

const OTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP, addToast } = useLibrary();
  const email = location.state?.email;
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/auth');
      return;
    }
    
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return setError('Please enter a 6-digit code');
    
    setLoading(true);
    setError('');
    try {
      const user = await verifyOTP(email, otpString);
      if (user) {
        navigate(`/${user.role?.toLowerCase()}`);
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await resendOTP(email);
      setTimer(30);
      setError('');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (err) {
      setError('Failed to resend OTP');
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
            border: '1px solid #6366f1',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)'
          }}>
            <ShieldAlert size={32} color="#6366f1" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '8px' }}>Identity Shield</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
            We've dispatched a secure code to <br/>
            <span style={{ color: 'white', fontWeight: 600 }}>{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'center', 
            marginBottom: '32px' 
          }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{ 
                  width: '45px', 
                  height: '60px', 
                  textAlign: 'center', 
                  fontSize: '1.5rem', 
                  fontWeight: 700,
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            ))}
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
            {loading ? 'Verifying...' : 'Verify & Decrypt'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          {timer > 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              New signal available in <span style={{ color: '#6366f1', fontWeight: 600 }}>{timer}s</span>
            </p>
          ) : (
            <button 
              onClick={handleResend}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#6366f1', 
                cursor: 'pointer', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                fontSize: '0.9rem'
              }}
            >
              <RefreshCw size={16} /> Resend Signal
            </button>
          )}
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/auth')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              margin: '0 auto'
            }}
          >
            <ArrowLeft size={16} /> Change Email
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPPage;
