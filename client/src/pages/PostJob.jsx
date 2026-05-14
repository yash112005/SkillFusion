import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Building, MapPin, Clock, Award, 
  FileText, Plus, X, ArrowLeft, Save, AlertCircle, Sparkles, ShieldCheck
} from 'lucide-react';
import Loader from '../components/Loader';
import JDBiasAnalyzer from '../components/JDBiasAnalyzer';

const PostJob = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    skills: [],
    experience: { min: 0, max: 0 },
    description: ''
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [biasAnalysis, setBiasAnalysis] = useState(null);
  const [biasLoading, setBiasLoading] = useState(false);
  const [lastAnalyzedText, setLastAnalyzedText] = useState('');

  useEffect(() => {
    if (isEditMode && user?.token) {
      const fetchJob = async () => {
        try {
          const res = await axios.get(`/api/jobs/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const jobData = res.data;
          setFormData({
            ...jobData,
            skills: jobData.skills || [],
            experience: jobData.experience || { min: 0, max: 0 }
          });
          // Trigger initial analysis for edit mode
          if (jobData.description) {
            analyzeText(jobData.description);
          }
        } catch (err) {
          console.error("Fetch job error:", err);
          setError(err.response?.data?.message || "Failed to fetch job details");
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    } else if (isEditMode && !user?.token) {
        Promise.resolve().then(() => setLoading(false));
    }
  }, [id, isEditMode, user?.token]);

  // Debounced Analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.description && formData.description !== lastAnalyzedText && formData.description.length > 20) {
        analyzeText(formData.description);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [formData.description]);

  const analyzeText = async (text) => {
    if (!user?.token) return;
    setBiasLoading(true);
    try {
      const res = await axios.post('/api/jobs/analyze-bias', { description: text }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBiasAnalysis(res.data);
      setLastAnalyzedText(text);
    } catch (err) {
      console.error("Bias Analysis Error:", err);
    } finally {
      setBiasLoading(false);
    }
  };

  const handleAutoFix = async () => {
    if (!user?.token || !formData.description) return;
    setBiasLoading(true);
    try {
      const res = await axios.post('/api/jobs/fix-bias', { description: formData.description }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFormData(prev => ({ ...prev, description: res.data.rewrittenText }));
      // Analysis will re-trigger via useEffect
    } catch (err) {
      console.error("Auto Fix Error:", err);
      alert("Failed to apply auto-fix. Please try again.");
    } finally {
      setBiasLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('experience.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        experience: { ...prev.experience, [field]: parseInt(value) || 0 }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      setError("You must be logged in to post a job.");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    try {
      if (isEditMode) {
        await axios.put(`/api/jobs/${id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post('/api/jobs', formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/recruiter'), 2000);
    } catch (err) {
      console.error("Submit job error:", err);
      setError(err.response?.data?.message || "Something went wrong while saving the job");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen={true} />;

  if (user && user.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only recruiters can access this page.</p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard/recruiter')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6 transition-colors font-medium group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card shadow-2xl overflow-hidden border-0 animate-fade-in h-full">
              <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 text-white">
                <h1 className="text-3xl font-bold flex items-center">
                  <Briefcase className="mr-3 w-8 h-8" />
                  {isEditMode ? 'Edit Job Description' : 'Post a New Job'}
                </h1>
                <p className="mt-2 text-primary-100 opacity-90">
                  {isEditMode 
                    ? 'Update the details to reach more relevant candidates.' 
                    : 'Fill in the details below to find your perfect match.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center animate-shake">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl flex items-center animate-fade-in">
                    <Save className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="font-medium">Job {isEditMode ? 'updated' : 'posted'} successfully! Redirecting...</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Job Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-primary-500" /> Job Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. Senior Frontend Developer"
                      className="input-field"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-primary-500" /> Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      required
                      placeholder="e.g. SkillFusion Inc."
                      className="input-field"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary-500" /> Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="e.g. San Francisco, CA or Remote"
                      className="input-field"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-primary-500" /> Job Type
                    </label>
                    <select
                      name="type"
                      className="input-field"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                    <Award className="w-4 h-4 mr-2 text-primary-500" /> Experience Range (Years)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Minimum</span>
                      <input
                        type="number"
                        name="experience.min"
                        min="0"
                        className="input-field"
                        value={formData.experience?.min || 0}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Maximum</span>
                      <input
                        type="number"
                        name="experience.max"
                        min="0"
                        className="input-field"
                        value={formData.experience?.max || 0}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                    <Plus className="w-4 h-4 mr-2 text-primary-500" /> Required Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a skill and press Enter"
                      className="input-field flex-grow"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
                    />
                    <button
                      type="button"
                      onClick={() => addSkill()}
                      className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skills && formData.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="flex items-center bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-xl text-sm font-bold border border-primary-100 dark:border-primary-800 transition-all hover:scale-105"
                      >
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-primary-500" /> Job Description
                    </label>
                    <span className="text-[10px] font-black uppercase text-indigo-500 flex items-center animate-pulse">
                      <ShieldCheck className="w-3 h-3 mr-1" /> AI Bias Guardian Active
                    </span>
                  </div>
                  <textarea
                    name="description"
                    required
                    rows="10"
                    placeholder="Describe the role, responsibilities, and requirements in detail..."
                    className="input-field resize-none min-h-[300px] border-2 focus:border-primary-500"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full md:w-auto px-12 py-4 text-lg flex items-center justify-center shadow-primary-500/20"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        {isEditMode ? 'Updating...' : 'Posting...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {isEditMode ? 'Update Job' : 'Post Job'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1 h-[calc(100vh-200px)] sticky top-8">
            <JDBiasAnalyzer 
              analysis={biasAnalysis} 
              loading={biasLoading} 
              onFix={handleAutoFix}
              originalDescription={formData.description}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
