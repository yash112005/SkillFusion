import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Check } from 'lucide-react';

const TemplateSelector = ({ selected, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get('/api/resume/templates');
        setTemplates(res.data);
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = filter === 'all' ? templates : templates.filter(t => t.style === filter);

  return (
    <div className="mb-8 p-6 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Template Gallery</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Select an ATS-friendly design</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {['all', 'professional', 'creative', 'tech'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === f 
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {filteredTemplates.map(tpl => (
          <div 
            key={tpl.id}
            onClick={() => onSelect(tpl.id, tpl.layout, tpl.colors)}
            className={`relative group cursor-pointer border-2 rounded-xl overflow-hidden transition-all duration-300 ${
              selected === tpl.id 
                ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50' 
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-lg'
            }`}
          >
            {/* Thumbnail Placeholder */}
            <div className="aspect-[1/1.4] bg-gray-50 dark:bg-gray-800 p-4 flex flex-col relative overflow-hidden">
              {/* Fake Resume Layout lines based on style */}
              <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 mb-4 rounded mx-auto"></div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 mb-2 rounded"></div>
              <div className="h-2 w-5/6 bg-gray-200 dark:bg-gray-700 mb-6 rounded"></div>
              
              <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-600 mb-2 rounded"></div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 mb-1 rounded"></div>
              <div className="h-2 w-4/5 bg-gray-200 dark:bg-gray-700 mb-4 rounded"></div>

              <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-600 mb-2 rounded"></div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 mb-1 rounded"></div>
              <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 mb-4 rounded"></div>

              {/* Hover Overlay */}
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${selected === tpl.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {selected === tpl.id ? (
                  <div className="bg-primary-500 text-white rounded-full p-2">
                    <Check className="w-6 h-6" />
                  </div>
                ) : (
                  <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    Select
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-0.5">{tpl.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{tpl.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
