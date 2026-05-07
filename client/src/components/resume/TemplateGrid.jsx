import React from 'react';
import { Check } from 'lucide-react';

const TemplateGrid = ({ selected, onSelect }) => {
  const templates = [
    { id: 'classic', name: 'Classic (ATS Best)', desc: 'Single-column, serif/sans-serif mix, standard headers.' },
    { id: 'modern', name: 'Modern Clean', desc: 'Slightly stylized headers, clean spacing, sans-serif.' },
    { id: 'hybrid', name: 'Hybrid (Skills First)', desc: 'Prioritizes skills section at the top.' }
  ];

  return (
    <div className="mb-8 p-6 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Choose Template</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map(tpl => (
          <div 
            key={tpl.id}
            onClick={() => onSelect(tpl.id)}
            className={`cursor-pointer border-2 rounded-lg p-4 transition-all relative ${
              selected === tpl.id 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}
          >
            {selected === tpl.id && (
              <div className="absolute top-2 right-2 bg-primary-500 rounded-full p-1">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded mb-3 flex items-center justify-center text-gray-400">
              Preview
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{tpl.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tpl.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGrid;
