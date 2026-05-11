import { useState } from 'react';
import axios from 'axios';
import { Star, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const categories = ['General', 'Bug Report', 'Feature Request', 'UI/UX', 'Interview Experience'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/feedback', 
        { rating, comment, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center py-12 animate-scale-in">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your feedback helps us make SkillFusion better for everyone. We appreciate your time!
          </p>
          <button 
            onClick={() => setSuccess(false)}
            className="btn-primary px-8"
          >
            Submit More Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
          Share Your Experience
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your insights drive our innovation. Let us know how we're doing.
        </p>
      </div>

      <div className="card shadow-2xl border border-white/10 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating Stars */}
          <div className="text-center">
            <label className="block text-sm font-semibold mb-4 uppercase tracking-wider text-gray-500">
              Overall Rating
            </label>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-all duration-300 transform hover:scale-125 focus:outline-none"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hover || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {error && rating === 0 && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
              Feedback Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-600/50'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Box */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Detailed Feedback
            </label>
            <textarea
              className="input-field min-h-[150px] resize-none"
              placeholder="Tell us what you liked or what we can improve..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>

          {error && rating !== 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 group overflow-hidden relative"
          >
            {loading ? (
              <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Submit Feedback</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Logged in as <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.email}</span></p>
      </div>
    </div>
  );
};

export default Feedback;
