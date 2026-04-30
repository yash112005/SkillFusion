import { useState } from 'react';
import axios from 'axios';
import { Mail, Phone } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await axios.post('/api/contact', formData);
      console.log(res.data);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(null), 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Have questions about SkillFusion? We're here to help.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8 animate-slide-up">
            <div className="card flex items-start space-x-4">
              <div className="p-3 bg-primary-100 text-primary-600 rounded-full dark:bg-primary-900/30">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-1">Email Us</h4>
                <p className="text-gray-600 dark:text-gray-400">ynamdeo248@gmail.com</p>
                <p className="text-gray-600 dark:text-gray-400">support@skillfusion.ai</p>
              </div>
            </div>

            <div className="card flex items-start space-x-4">
              <div className="p-3 bg-primary-100 text-primary-600 rounded-full dark:bg-primary-900/30">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-1">Call Us</h4>
                <p className="text-gray-600 dark:text-gray-400">+91 8269142883</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card animate-slide-up" style={{animationDelay: '100ms'}}>
            <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
            
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                Something went wrong. Please try again.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field" 
                  placeholder="John Doe" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field" 
                  placeholder="john@example.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input 
                  type="text" 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="input-field" 
                  placeholder="How can we help?" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="input-field resize-none" 
                  placeholder="Your message here..." 
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={status === 'sending'}
                className="btn-primary w-full py-3"
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
