import React, { useReducer, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { Download, Save } from 'lucide-react';

import TemplateSelector from '../components/resume/TemplateSelector';
import CustomizationPanel from '../components/resume/CustomizationPanel';
import ResumeEditor from '../components/resume/ResumeEditor';
import ResumePreview from '../components/resume/ResumePreview';
import Loader from '../components/Loader';

const initialState = {
  data: {
    personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    selectedTemplate: 'classic',
    customOverrides: {
      font: 'Arial, sans-serif',
      color: '#000000',
      margins: '1in',
      visibleSections: ['summary', 'experience', 'education', 'skills', 'projects'],
      sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects']
    }
  },
  history: [], // For undo/redo
  historyIndex: -1
};

function resumeReducer(state, action) {
  let newData;
  switch (action.type) {
    case 'SET_FULL_DATA':
      return { ...state, data: { ...state.data, ...action.payload } };
    case 'UPDATE_PERSONAL_INFO':
      newData = {
        ...state.data,
        personalInfo: { ...state.data.personalInfo, ...action.payload }
      };
      break;
    case 'UPDATE_FIELD':
      newData = {
        ...state.data,
        [action.payload.field]: action.payload.value
      };
      break;
    case 'UPDATE_OVERRIDES':
      newData = {
        ...state.data,
        customOverrides: { ...state.data.customOverrides, ...action.payload }
      };
      break;
    case 'SET_TEMPLATE':
      newData = {
        ...state.data,
        selectedTemplate: action.payload.id,
        customOverrides: {
          ...state.data.customOverrides,
          font: action.payload.layout.fonts.body,
          margins: action.payload.layout.margins,
          sectionOrder: action.payload.layout.sections,
          color: action.payload.colors.accent
        }
      };
      break;
    default:
      return state;
  }

  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(newData);
  
  return {
    data: newData,
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
}

const ResumeBuilder = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const printRef = useRef(null);

  const [state, dispatch] = useReducer(resumeReducer, initialState);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get('/api/resume', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.data) {
          const mergedData = {
            ...initialState.data,
            ...res.data,
            customOverrides: {
              ...initialState.data.customOverrides,
              ...(res.data.customOverrides || {})
            }
          };
          dispatch({ type: 'SET_FULL_DATA', payload: mergedData });
        }
      } catch (err) {
        console.log("No existing resume found or error fetching");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('/api/resume/save', state.data, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Draft saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const element = printRef.current;
    const opt = {
      margin:       0,
      filename:     `${state.data.personalInfo.name || 'resume'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleTemplateSelect = (id, layout, colors) => {
    dispatch({ type: 'SET_TEMPLATE', payload: { id, layout, colors } });
  };

  if (loading) return <Loader fullScreen={true} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Top: Template Gallery */}
        <TemplateSelector 
          selected={state.data.selectedTemplate}
          onSelect={handleTemplateSelect}
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Customization & Editor */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            
            <div className="flex justify-between items-center bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Resume Editor</h2>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-secondary flex items-center">
                  <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button onClick={handleDownload} className="btn-primary flex items-center">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </button>
              </div>
            </div>

            <CustomizationPanel 
              overrides={state.data.customOverrides} 
              onChange={(payload) => dispatch({ type: 'UPDATE_OVERRIDES', payload })}
            />

            <ResumeEditor 
              data={state.data}
              dispatch={dispatch}
              overrides={state.data.customOverrides}
            />

          </div>

          {/* RIGHT: Live Preview */}
          <div className="w-full lg:w-1/2 flex justify-center bg-gray-200 dark:bg-gray-800 p-8 rounded-xl overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="shadow-2xl">
              <ResumePreview ref={printRef} data={state.data} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};



export default ResumeBuilder;
