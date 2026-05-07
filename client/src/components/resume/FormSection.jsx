import React, { useState } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const FormSection = ({ title, type, data, onChange, onAIGenerate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAddField = () => {
    let newItem = {};
    if (type === 'experience') {
      newItem = { title: '', company: '', startDate: '', endDate: '', description: '' };
    } else if (type === 'education') {
      newItem = { degree: '', school: '', startDate: '', endDate: '', gpa: '' };
    } else if (type === 'projects') {
      newItem = { name: '', description: '', link: '' };
    }
    onChange([...data, newItem]);
  };

  const handleRemoveField = (index) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    onChange(newData);
  };

  const handleAIBullets = async (index) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/resume/generate-ai', {
        promptType: 'bullets',
        data: data[index]
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const bullets = response.data.result.join('\n• ');
      handleChange(index, 'description', `• ${bullets}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAIRefine = async (index) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/resume/generate-ai', {
        promptType: 'bullets', // Reusing bullets prompt to refine it ATS friendly
        data: data[index],
        jobDescription: 'Software Developer, ATS optimized' // Or pass real JD
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const bullets = response.data.result.join('\n• ');
      handleChange(index, 'description', `• ${bullets}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!Array.isArray(data)) return null;

  return (
    <div className="mb-8 p-6 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
      
      {data.map((item, index) => (
        <div key={index} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative group">
          <button 
            onClick={() => handleRemoveField(index)}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(item).map((key) => {
              if (key === '_id') return null;
              if (key === 'description') {
                return (
                  <div key={key} className="md:col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{key}</label>
                    <textarea 
                      value={item[key]}
                      onChange={(e) => handleChange(index, key, e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-white h-32"
                    />
                    {type === 'experience' && (
                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <button 
                          onClick={() => handleAIBullets(index)}
                          disabled={loading}
                          className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                        >
                          <Wand2 className="w-4 h-4 mr-1" /> AI Bullets
                        </button>
                        <button 
                          onClick={() => handleAIRefine(index)}
                          disabled={loading}
                          className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          <Wand2 className="w-4 h-4 mr-1" /> Refine ATS
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input 
                    type={key.includes('Date') ? 'month' : 'text'}
                    value={item[key]}
                    onChange={(e) => handleChange(index, key, e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-white"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      <button 
        onClick={handleAddField}
        className="flex items-center text-primary-600 hover:text-primary-700 font-medium mt-2"
      >
        <Plus className="w-4 h-4 mr-1" /> Add {title}
      </button>
    </div>
  );
};

export default FormSection;
