import React from 'react';

const CustomizationPanel = ({ overrides, onChange }) => {
  const fonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Calibri', value: 'Calibri, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' }
  ];

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#333333' },
    { name: 'Dark Blue', value: '#1A365D' },
    { name: 'Navy', value: '#000080' }
  ];

  const margins = ['0.5in', '0.75in', '1in'];

  const allSections = ['summary', 'experience', 'education', 'skills', 'projects'];

  const toggleSection = (section) => {
    const newSections = overrides.visibleSections.includes(section)
      ? overrides.visibleSections.filter(s => s !== section)
      : [...overrides.visibleSections, section];
    onChange({ visibleSections: newSections });
  };

  return (
    <div className="p-6 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Customization</h3>
      
      <div className="space-y-6">
        {/* Fonts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Typography</label>
          <select 
            value={overrides.font}
            onChange={(e) => onChange({ font: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
          </select>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accent Color (ATS Safe)</label>
          <div className="flex gap-3">
            {colors.map(c => (
              <button
                key={c.value}
                onClick={() => onChange({ color: c.value })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${overrides.color === c.value ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Margins */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Margins</label>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {margins.map(m => (
              <button
                key={m}
                onClick={() => onChange({ margins: m })}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  overrides.margins === m ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Visible Sections */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Visible Sections</label>
          <div className="space-y-2">
            {allSections.map(section => (
              <label key={section} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrides.visibleSections.includes(section)}
                  onChange={() => toggleSection(section)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{section}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomizationPanel;
