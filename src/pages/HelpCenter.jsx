import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FAQS = [
  {
    question: "How do I request a new room allocation?",
    answer: "You can request a new room allocation by navigating to the Room Allocation dashboard and submitting an application, or by reaching out to the Guest House manager directly."
  },
  {
    question: "What should I do if a maintenance complaint is taking too long?",
    answer: "If a complaint is marked as 'In Progress' for over 48 hours, you can escalate it by submitting a High Severity ticket here in the Help Center."
  },
  {
    question: "How are the canteen meal numbers calculated?",
    answer: "Canteen numbers are aggregated daily from the swipe system at each dining facility. The dashboard updates every morning at 8:00 AM."
  },
  {
    question: "I forgot my password, how can I reset it?",
    answer: "Currently, you must contact the system administrator to reset your password. You can raise a ticket using the form below."
  }
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    severity: 'Normal',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitStatus({ type: 'success', message: 'Ticket submitted successfully! We will get back to you soon.' });
        setFormData({ name: '', department: '', severity: 'Normal', subject: '', message: '' });
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Failed to submit ticket.' });
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '60px' }}>
      {/* Navigation */}
      <nav className="dashboard-nav nav-scrolled" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <img src="/images/jsw_logo_clean.png" alt="JSW" className="nav-logo-img" />
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ fontSize: '32px', color: '#1C1917', marginBottom: '8px', fontWeight: '800' }}>
            Help Center & Support
          </h1>
          <p style={{ color: '#71717A', fontSize: '16px', marginBottom: '40px' }}>
            Find answers to common questions or raise a support ticket.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 style={{ fontSize: '20px', color: '#1C1917', marginBottom: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#7C3AED' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FAQS.map((faq, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '8px', 
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#1C1917'
                    }}
                  >
                    {faq.question}
                    <svg 
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div style={{ padding: '0 16px 16px', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Ticket Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <h2 style={{ fontSize: '20px', color: '#1C1917', marginBottom: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#D946EF' }}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Raise a Ticket
            </h2>
            
            {submitStatus && (
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '6px', 
                marginBottom: '20px', 
                fontSize: '14px',
                backgroundColor: submitStatus.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: submitStatus.type === 'success' ? '#065F46' : '#991B1B',
                border: `1px solid ${submitStatus.type === 'success' ? '#A7F3D0' : '#FECACA'}`
              }}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Your Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px' }} placeholder="John Doe" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px' }} placeholder="e.g. Civil, IT" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Subject *</label>
                  <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px' }} placeholder="Brief description" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Severity</label>
                  <select name="severity" value={formData.severity} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', backgroundColor: '#FFF' }}>
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Message *</label>
                <textarea required name="message" value={formData.message} onChange={handleInputChange} rows="5" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', resize: 'vertical' }} placeholder="Describe your issue in detail..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  marginTop: '8px', 
                  backgroundColor: '#7C3AED', 
                  color: '#FFF', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  fontWeight: '600', 
                  fontSize: '15px', 
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#6D28D9')}
                onMouseOut={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#7C3AED')}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    Send Ticket
                  </>
                )}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
