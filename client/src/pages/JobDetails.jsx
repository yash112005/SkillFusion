import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, MapPin, Clock, Calendar, Award, 
  Briefcase, Building, ChevronRight, Edit, Trash2 
} from 'lucide-react';
import Loader from '../components/Loader';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`/api/jobs/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setJob(res.data);
      } catch (err) {
        console.error("Failed to fetch job", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user.token]);

  if (loading) return <Loader fullScreen={true} />;
  if (!job) return <div className="text-center py-20">Job not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="card overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                    {job.type}
                  </span>
                  <span className="text-primary-100 text-sm">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-2">{job.title}</h1>
                <p className="text-xl text-primary-50 flex items-center">
                  <Building className="w-5 h-5 mr-2" /> {job.company}
                </p>
              </div>
              
              {user.role === 'recruiter' && job.recruiterId === user._id && (
                <div className="flex gap-3">
                  <Link 
                    to={`/edit-job/${job._id}`}
                    className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-bold text-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" /> EDIT
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-primary-500" /> Job Description
                </h2>
                <div className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                  {job.description}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-primary-500" /> Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-xl font-medium border border-primary-100 dark:border-primary-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card bg-gray-50 dark:bg-gray-800/50 border-0 p-6 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-widest text-gray-400">Job Overview</h3>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Experience</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {job.experience.min} - {job.experience.max} Years
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Job Type</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{job.type}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Date Posted</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {user.role === 'candidate' && (
                <button className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary-200 dark:shadow-none">
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
