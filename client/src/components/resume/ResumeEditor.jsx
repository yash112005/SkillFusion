import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Wand2 } from 'lucide-react';
import FormSection from './FormSection';

const ResumeEditor = ({ data, dispatch, overrides }) => {

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const newOrder = Array.from(overrides.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects']);
    const [removed] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, removed);

    dispatch({ type: 'UPDATE_OVERRIDES', payload: { sectionOrder: newOrder } });
  };

  const handlePersonalInfoChange = (key, value) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { [key]: value } });
  };

  // Reorder sections based on overrides.sectionOrder
  const sectionsToRender = (overrides.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects']).filter(s => overrides.visibleSections.includes(s));

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Personal Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(data.personalInfo).map(key => {
            if (key === '_id') return null;
            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{key}</label>
                <input 
                  type="text" 
                  value={data.personalInfo[key]} 
                  onChange={(e) => handlePersonalInfoChange(key, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-white"
                />
              </div>
            )
          })}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="resume-sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
              {sectionsToRender.map((sectionId, index) => (
                <Draggable key={sectionId} draggableId={sectionId} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative group bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
                    >
                      <div 
                        {...provided.dragHandleProps}
                        className="absolute left-2 top-6 text-gray-400 hover:text-primary-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className="pl-10">
                        {sectionId === 'summary' && (
                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Professional Summary</h3>
                            <textarea 
                              value={data.summary}
                              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', payload: { field: 'summary', value: e.target.value } })}
                              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-white h-32"
                            />
                            <div className="flex justify-end mt-2">
                              <button 
                                onClick={() => dispatch({ type: 'GENERATE_SUMMARY' })}
                                className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                              >
                                <Wand2 className="w-4 h-4 mr-1" /> AI Suggest
                              </button>
                            </div>
                          </div>
                        )}

                        {sectionId === 'experience' && (
                          <div className="pr-6 pt-6">
                            <FormSection 
                              title="Experience" 
                              type="experience" 
                              data={data.experience} 
                              onChange={(newData) => dispatch({ type: 'UPDATE_FIELD', payload: { field: 'experience', value: newData } })} 
                            />
                          </div>
                        )}

                        {sectionId === 'education' && (
                          <div className="pr-6 pt-6">
                            <FormSection 
                              title="Education" 
                              type="education" 
                              data={data.education} 
                              onChange={(newData) => dispatch({ type: 'UPDATE_FIELD', payload: { field: 'education', value: newData } })} 
                            />
                          </div>
                        )}

                        {sectionId === 'skills' && (
                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Skills</h3>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comma-separated skills</label>
                            <textarea 
                              value={data.skills.join(', ')}
                              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', payload: { field: 'skills', value: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
                              placeholder="e.g. React, Node.js, Project Management"
                              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-white h-24"
                            />
                          </div>
                        )}

                        {sectionId === 'projects' && (
                          <div className="pr-6 pt-6">
                            <FormSection 
                              title="Projects" 
                              type="projects" 
                              data={data.projects} 
                              onChange={(newData) => dispatch({ type: 'UPDATE_FIELD', payload: { field: 'projects', value: newData } })} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ResumeEditor;
