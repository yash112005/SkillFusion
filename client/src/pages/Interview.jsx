import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { usePDF } from '@react-pdf/renderer';
import InterviewReport from '../components/InterviewReport';
import { 
  Briefcase, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Send, 
  BrainCircuit, 
  User, 
  History,
  ArrowRight,
  RefreshCw,
  Trophy,
  MessageSquare,
  Download
} from 'lucide-react';

const Interview = () => {
  const { user } = useAuth();
  const [step, setStep] = useState('setup'); // 'setup' | 'interview' | 'feedback' | 'summary'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    level: 'Mid',
    type: 'Mixed',
    count: 3
  });
  const [questions, setQuestions] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [currentEval, setCurrentEval] = useState(null);

  const levels = ['Entry', 'Mid', 'Senior', 'Lead'];
  const types = ['Technical', 'Behavioral', 'System Design', 'Mixed'];
  const counts = [3, 5, 8];

  const greatCount = evaluations.filter(e => e.evaluation?.score === 'great').length;
  const score = questions.length > 0 ? Math.round((greatCount / questions.length) * 100) : 0;

  const reportData = useMemo(() => ({
    role: formData.role,
    level: formData.level,
    type: formData.type,
    evaluations,
    overallScore: score
  }), [formData.role, formData.level, formData.type, evaluations, score]);

  const pdfDocument = useMemo(() => (
    step === 'summary' ? <InterviewReport data={reportData} /> : null
  ), [step, reportData]);

  const [pdfInstance, updatePdf] = usePDF({
    document: pdfDocument
  });

  useEffect(() => {
    if (pdfDocument) {
      updatePdf(pdfDocument);
    }
  }, [pdfDocument, updatePdf]);

  const handleDownload = () => {
    if (!pdfInstance || pdfInstance.loading || pdfInstance.error) return;
    if (pdfInstance.url) {
      const link = document.createElement('a');
      link.href = pdfInstance.url;
      link.download = `Interview-Report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/interview/start', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setQuestions(res.data.questions);
      setInterviewId(res.data.interviewId);
      setStep('interview');
    } catch (err) {
      console.error("Failed to start interview", err);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/interview/evaluate', {
        interviewId: interviewId,
        question: questions[currentIdx],
        answer: answer
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCurrentEval(res.data);
      setStep('feedback');
    } catch (err) {
      console.error("Failed to evaluate answer", err);
      alert("Evaluation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    const updatedEvaluations = [...evaluations, { question: questions[currentIdx], answer, evaluation: currentEval }];
    setEvaluations(updatedEvaluations);
    setAnswer('');
    setCurrentEval(null);
    
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setStep('interview');
    } else {
      // Calculate overall score
      const greatCount = updatedEvaluations.filter(e => e.evaluation.score === 'great').length;
      const overallScore = Math.round((greatCount / questions.length) * 100);
      
      try {
        await axios.post('/api/interview/complete', {
          interviewId: interviewId,
          overallScore: overallScore
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } catch (err) {
        console.error("Failed to save final progress", err);
      }
      
      setStep('summary');
    }
  };

  const renderSetup = () => (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
          Mock Interview <span className="text-primary-600">Simulator</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Sharpen your skills with our AI-driven interview coach. 
          Get real-time feedback on your answers.
        </p>
      </div>

      <div className="card p-8 shadow-xl border-gray-100 dark:border-dark-border">
        <form onSubmit={handleStart} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Target Job Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Developer"
                  className="input-field pl-11"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Experience Level
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {levels.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setFormData({ ...formData, level: l })}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      formData.level === l 
                        ? 'bg-white dark:bg-dark-card text-primary-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Interview Type
              </label>
              <select
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Number of Questions
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {counts.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, count: c })}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      formData.count === c 
                        ? 'bg-white dark:bg-dark-card text-primary-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center group"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Start My Mock Interview
                <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  const renderInterview = () => (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <span className="text-primary-600 font-bold uppercase tracking-widest text-sm">Question {currentIdx + 1} of {questions.length}</span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">Challenge Your Skills</h2>
        </div>
        <div className="flex-1 max-w-[200px] ml-8 mb-2">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="card p-10 bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-gray-900 shadow-2xl border-none">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <BrainCircuit className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
            {questions[currentIdx]}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Your Response
          </label>
          <textarea
            className="w-full h-64 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all resize-none text-lg leading-relaxed shadow-inner"
            placeholder="Structure your answer clearly. For behavioral questions, try the STAR method (Situation, Task, Action, Result)..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          ></textarea>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmitAnswer}
            disabled={loading || !answer.trim()}
            className="btn-primary px-10 py-4 text-lg flex items-center disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
            ) : (
              <>
                Submit & Evaluate
                <Send className="w-5 h-5 ml-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <div className={`inline-flex items-center px-4 py-2 rounded-full mb-4 font-bold text-sm uppercase tracking-widest ${
          currentEval.score === 'great' ? 'bg-green-100 text-green-700' :
          currentEval.score === 'good' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {currentEval.score === 'great' && <Trophy className="w-4 h-4 mr-2" />}
          Evaluation: {currentEval.score}
        </div>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white">Expert Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-8 bg-white dark:bg-dark-card border-l-8 border-l-primary-600">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-3 text-primary-500" /> Feedback from AI Coach
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic">
              "{currentEval.feedback}"
            </p>
          </div>

          <div className="card p-8 bg-gray-50 dark:bg-gray-800/50 border-none">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Original Question</h3>
            <p className="text-gray-900 dark:text-white font-medium">{questions[currentIdx]}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-br from-primary-600 to-indigo-600 text-white border-none shadow-xl">
            <h3 className="text-center font-bold text-sm uppercase tracking-widest opacity-80 mb-2">Confidence Level</h3>
            <div className="text-5xl font-black text-center mb-4">
              {currentEval.score === 'great' ? '95%' : currentEval.score === 'good' ? '75%' : '45%'}
            </div>
            <p className="text-xs text-center opacity-70">Based on structured response analysis and domain relevancy.</p>
          </div>

          <button
            onClick={handleNext}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center"
          >
            {currentIdx + 1 < questions.length ? 'Next Question' : 'Finish Interview'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-2">Interview Complete!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xl">Here is how you performed across all rounds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card p-6 text-center">
            <div className="text-3xl font-black text-primary-600 mb-1">{questions.length}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Questions</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-black text-green-500 mb-1">{greatCount}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Great Answers</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-black text-yellow-500 mb-1">{evaluations.filter(e => e.evaluation.score === 'good').length}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Good Answers</div>
          </div>
          <div className="card p-6 text-center border-t-4 border-t-primary-600">
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{score}%</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Overall Score</div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
            <History className="w-6 h-6 mr-3 text-primary-500" /> Detailed Review
          </h3>
          {evaluations.map((item, idx) => (
            <div key={idx} className="card p-8 bg-white dark:bg-dark-card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="max-w-2xl">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Question {idx + 1}</h4>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{item.question}</p>
                </div>
                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                  item.evaluation.score === 'great' ? 'bg-green-100 text-green-700' :
                  item.evaluation.score === 'good' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {item.evaluation.score}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                    <User className="w-3 h-3 mr-2" /> Your Answer
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-400 line-clamp-4">{item.answer}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                    <BrainCircuit className="w-3 h-3 mr-2" /> AI Feedback
                  </h5>
                  <p className="text-sm text-primary-700 dark:text-primary-400 font-medium">{item.evaluation.feedback}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6">
          <button
            onClick={handleDownload}
            disabled={!pdfInstance || pdfInstance.loading}
            className={`btn-primary py-4 px-10 flex items-center bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 ${
              (!pdfInstance || pdfInstance.loading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {pdfInstance?.loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Download className="w-5 h-5 mr-2" /> Download Report</>
            )}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="btn-primary py-4 px-10 flex items-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" /> Start New Session
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/candidate'}
            className="px-10 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-16 px-4">
      {step === 'setup' && renderSetup()}
      {step === 'interview' && renderInterview()}
      {step === 'feedback' && renderFeedback()}
      {step === 'summary' && renderSummary()}
    </div>
  );
};

export default Interview;
