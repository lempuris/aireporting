import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, User, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmailSupportForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    // Create mailto link
    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}\n\n---\nSent from BI Application Support Chat`
    );
    const mailtoLink = `mailto:support@bi.com?subject=${subject}&body=${body}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success message
    toast.success('Opening your email client...');

    // Reset form and close
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-full max-w-md rounded-lg shadow-xl overflow-hidden"
              style={{
                backgroundColor: 'rgb(var(--color-bg-secondary))',
                borderColor: 'rgb(var(--color-border))'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between p-6 border-b"
                style={{ borderColor: 'rgb(var(--color-border))' }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'rgb(var(--color-primary))', color: 'white' }}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>
                      Contact Support
                    </h3>
                    <p className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      We'll help you with your question
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" style={{ color: 'rgb(var(--color-text-secondary))' }} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name field */}
                <div>
                  <label 
                    htmlFor="name" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'rgb(var(--color-text-primary))' }}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Your Name</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    style={{
                      backgroundColor: 'rgb(var(--color-bg-primary))',
                      borderColor: 'rgb(var(--color-border))',
                      color: 'rgb(var(--color-text-primary))'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email field */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'rgb(var(--color-text-primary))' }}
                  >
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    style={{
                      backgroundColor: 'rgb(var(--color-bg-primary))',
                      borderColor: 'rgb(var(--color-border))',
                      color: 'rgb(var(--color-text-primary))'
                    }}
                    placeholder="your.email@company.com"
                  />
                </div>

                {/* Subject field */}
                <div>
                  <label 
                    htmlFor="subject" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'rgb(var(--color-text-primary))' }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    style={{
                      backgroundColor: 'rgb(var(--color-bg-primary))',
                      borderColor: 'rgb(var(--color-border))',
                      color: 'rgb(var(--color-text-primary))'
                    }}
                    placeholder="Brief description of your issue"
                  />
                </div>

                {/* Message field */}
                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'rgb(var(--color-text-primary))' }}
                  >
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Message</span>
                    </div>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                    style={{
                      backgroundColor: 'rgb(var(--color-bg-primary))',
                      borderColor: 'rgb(var(--color-border))',
                      color: 'rgb(var(--color-text-primary))'
                    }}
                    placeholder="Please describe your question or issue in detail..."
                  />
                </div>

                {/* Info message */}
                <div 
                  className="p-3 rounded-lg border-l-4 text-sm"
                  style={{
                    backgroundColor: 'rgb(var(--color-bg-tertiary))',
                    borderLeftColor: 'rgb(var(--color-primary))',
                    color: 'rgb(var(--color-text-secondary))'
                  }}
                >
                  📧 This will open your default email client with the form pre-filled to send to support@bi.com
                </div>

                {/* Submit button */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border rounded-lg font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                    style={{
                      borderColor: 'rgb(var(--color-border))',
                      color: 'rgb(var(--color-text-primary))'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    style={{
                      backgroundColor: 'rgb(var(--color-primary))'
                    }}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailSupportForm;