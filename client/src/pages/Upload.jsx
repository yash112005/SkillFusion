import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FilePlus, Brain, XCircle, CheckCircle, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';


const Upload = () => {
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [jdError, setJdError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    if (file.size > 5 * 1024 * 1024) return 'File size exceeds 5MB limit.';
    return '';
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    processFile(file, type);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processFile(file, type);
  };

  const processFile = (file, type) => {
    if (!file) return;
    const errorMsg = validateFile(file);
    if (type === 'resume') {
      setResumeError(errorMsg);
      if (!errorMsg) setResume(file);
      else setResume(null);
    } else {
      setJdError(errorMsg);
      if (!errorMsg) setJd(file);
      else setJd(null);
    }
  };

  const handleSubmit = async () => {
    if (!resume || !jd) {
      setError('Please upload both files.');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jd', jd);

    // Persist text for Skilly context
    const reader = new FileReader();
    reader.onload = (e) => {
      sessionStorage.setItem('last_resume_text', e.target.result);
    };
    if (resume.type === 'text/plain') reader.readAsText(resume);
    else sessionStorage.setItem('last_resume_text', `Resume: ${resume.name}`);

    const jdReader = new FileReader();
    jdReader.onload = (e) => {
      sessionStorage.setItem('last_jd_text', e.target.result);
    };
    if (jd.type === 'text/plain') jdReader.readAsText(jd);
    else sessionStorage.setItem('last_jd_text', `JD: ${jd.name}`);

    try {
      const res = await axios.post('/api/match', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token || ''}`
        }
      });
      clearInterval(progressInterval);
      setProgress(100);
      sessionStorage.setItem('last_match_score', res.data.score);
      setTimeout(() => {
        navigate('/results', { state: { matchResult: res.data } });
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.response?.data?.message || 'Error processing files. Please try again.');
      setLoading(false);
    }

  };

  const removeFile = (e, type) => {
    e.stopPropagation();
    if (type === 'resume') {
        setResume(null);
        setResumeError('');
    } else {
        setJd(null);
        setJdError('');
    }
  };
const UploadBox = ({ title, type, file, errorMsg, accept, handleDrop, handleFileChange, removeFile }) => {
  let borderColor = 'border-gray-300 dark:border-gray-700';
  let bgColor = 'bg-white dark:bg-dark-card';
  
  if (errorMsg) {
    borderColor = 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    bgColor = 'bg-red-50 dark:bg-red-900/10';
  } else if (file) {
    borderColor = 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
    bgColor = 'bg-green-50 dark:bg-green-900/10';
  }

  return (
    <div 
      className={`card border-2 border-dashed ${borderColor} ${bgColor} flex flex-col items-center justify-center p-10 transition-all duration-300 cursor-pointer relative overflow-hidden group min-h-[350px] w-full`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, type)}
    >
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        accept={accept}
        onChange={(e) => handleFileChange(e, type)}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/5 group-hover:to-primary-500/10 transition-colors duration-500"></div>

      {file ? (
        <div className="text-center z-20 animate-fade-in relative w-full flex flex-col items-center">
           <button onClick={(e) => removeFile(e, type)} className="absolute -top-6 -right-6 text-gray-400 hover:text-red-500 transition-colors z-30 bg-white dark:bg-dark-bg rounded-full">
              <XCircle className="w-7 h-7" />
           </button>
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center shadow-inner">
              <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2 truncate w-full px-4">{file.name}</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <span className="uppercase bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{file.name.split('.').pop()}</span>
              <span>•</span>
              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      ) : (
        <div className="text-center z-20 flex flex-col items-center w-full">
          <div className="w-20 h-20 mb-6 rounded-full bg-primary-50 dark:bg-dark-bg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
              <FilePlus className="w-10 h-10 text-primary-500" />
          </div>
          <p className="font-bold text-xl mb-3 text-gray-800 dark:text-gray-200">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-[220px]">Drag & drop your file here or click to browse</p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {accept.split(',').map(ext => (
              <span key={ext} className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-300 uppercase shadow-sm">
                {ext.replace('.','')}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 font-medium tracking-wide">MAX SIZE: 5MB</p>
          {errorMsg && (
              <div className="mt-5 text-red-600 dark:text-red-400 text-sm flex items-center justify-center bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-lg w-full animate-fade-in font-medium">
                  <XCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {errorMsg}
              </div>
          )}
        </div>
      )}
    </div>
  );
};

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-dark-bg py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-400/5 dark:bg-primary-600/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10 flex-grow flex flex-col items-center">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-indigo-500 to-purple-600 mb-6 tracking-tight">
            AI Profile Matcher
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Upload your resume and the target job description. Our advanced AI will analyze your fit and provide a comprehensive score.
          </p>
        </div>

        {error && (
            <div className="max-w-2xl mx-auto mb-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl flex items-center justify-center shadow-lg animate-fade-in">
                <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <p className="font-medium">{error}</p>
            </div>
        )}

        <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-10 lg:gap-6 relative mb-20 w-full">
          
          <div className="flex-1 w-full max-w-lg lg:max-w-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <UploadBox 
                title="Upload Resume" 
                type="resume" 
                file={resume} 
                errorMsg={resumeError} 
                accept=".pdf,.doc,.docx,.txt" 
                handleDrop={handleDrop}
                handleFileChange={handleFileChange}
                removeFile={removeFile}
            />
          </div>
          
          <div className="flex flex-col items-center justify-center py-10 lg:py-0 w-full lg:w-72 shrink-0 animate-fade-in z-20" style={{ animationDelay: '0.2s' }}>
            
            <div className="relative flex flex-col items-center w-full">
                <div className="relative mb-10 group">
                    {(resume && jd) && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse-slow scale-[1.8]"></div>
                            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse-slow scale-[1.8]" style={{ animationDelay: '1s' }}></div>
                        </>
                    )}
                    
                    {/* The Brain */}
                    <div className={`w-28 h-28 rounded-full glass border-2 flex items-center justify-center shadow-2xl relative z-10 transition-all duration-700
                        ${(resume && jd) ? 'border-primary-400 dark:border-primary-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] scale-110' : 'border-gray-200 dark:border-gray-700'}
                        ${loading ? 'animate-pulse' : ''}
                    `}>
                        <Brain className={`w-14 h-14 transition-colors duration-700 ${(resume && jd) ? 'text-primary-500 dark:text-primary-400 drop-shadow-lg' : 'text-gray-400'} ${loading ? 'animate-pulse' : ''}`} />
                        
                        {/* Connecting lines logic (visual only for desktop) */}
                        <div className={`hidden lg:block absolute top-1/2 left-[-40px] h-0.5 transition-all duration-700 ${(resume && jd) ? 'w-[40px] bg-gradient-to-r from-transparent to-primary-500 opacity-80' : 'w-0'}`}></div>
                        <div className={`hidden lg:block absolute top-1/2 right-[-40px] h-0.5 transition-all duration-700 ${(resume && jd) ? 'w-[40px] bg-gradient-to-l from-transparent to-primary-500 opacity-80' : 'w-0'}`}></div>
                    </div>
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={loading || !resume || !jd}
                    className={`
                        relative overflow-hidden group w-full max-w-[240px]
                        inline-flex items-center justify-center px-8 py-5 rounded-full font-bold text-lg text-white shadow-xl transition-all duration-300
                        ${(!resume || !jd) 
                            ? 'bg-gray-300 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-500 shadow-none' 
                            : 'bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-1 hover:scale-105 active:scale-95'
                        }
                    `}
                >
                    {(resume && jd && !loading) && (
                        <span className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-300"></span>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span className="text-sm font-bold tracking-widest uppercase">Analyzing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Zap className={`w-6 h-6 ${(!resume || !jd) ? 'opacity-50' : 'animate-pulse'}`} />
                            <span className="tracking-wide">FIND MATCH</span>
                        </div>
                    )}
                </button>

                {loading && (
                    <div className="w-full max-w-[240px] mt-8 animate-fade-in">
                        <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCA4TDggMFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-30 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3 font-semibold tracking-wide">{progress}% Complete</p>
                    </div>
                )}
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-md animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <UploadBox 
                title="Upload Job Description" 
                type="jd" 
                file={jd} 
                errorMsg={jdError} 
                accept=".pdf,.doc,.docx,.txt" 
                handleDrop={handleDrop}
                handleFileChange={handleFileChange}
                removeFile={removeFile}
            />
          </div>

        </div>

        {/* New Multi-JD Feature Link */}
        <div className="w-full max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="relative group overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all duration-500">
            <div className="relative bg-white dark:bg-dark-card rounded-[22px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-black uppercase tracking-wider mb-4">
                  <Sparkles className="w-3 h-3 mr-2" /> New Feature
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3">Multi-JD Comparison</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                  Not sure which role fits you best? Compare your resume against <span className="font-bold text-primary-600">multiple job descriptions</span> at once and get a ranked fit report.
                </p>
              </div>
              <Link 
                to="/multi-match"
                className="shrink-0 flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all hover:scale-105 active:scale-95 shadow-lg group/btn"
              >
                Try Multi-Match <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Upload;
