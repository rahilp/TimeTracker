'use client';

import React, { useState, useEffect } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { formatDuration } from '@/lib/utils';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

const Timer = () => {
  const {
    projects,
    activeTimeEntry,
    startTimeEntry,
    stopTimeEntry,
  } = useProjects();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Update the selected project when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Set form values if there's an active time entry
  useEffect(() => {
    if (activeTimeEntry) {
      setSelectedProjectId(activeTimeEntry.projectId);
      setDescription(activeTimeEntry.description || '');
    }
  }, [activeTimeEntry]);

  // Update elapsed time every second if there's an active time entry
  useEffect(() => {
    if (!activeTimeEntry) {
      setElapsedTime(0);
      return;
    }

    // Initialize with current elapsed time
    const now = new Date();
    const initialElapsed = Math.floor(
      (now.getTime() - activeTimeEntry.startTime.getTime()) / 1000
    );
    setElapsedTime(initialElapsed);

    // Update every second
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor(
        (now.getTime() - activeTimeEntry.startTime.getTime()) / 1000
      );
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimeEntry]);

  const handleStartTimer = () => {
    if (!selectedProjectId) return;
    
    startTimeEntry({
      projectId: selectedProjectId,
      description,
      startTime: new Date(),
    });
  };

  const handleStopTimer = () => {
    if (activeTimeEntry) {
      stopTimeEntry(activeTimeEntry.id);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  return (
    <div className="bg-white rounded-sm border border-[#DFE1E6] shadow-sm">
      <div className="p-6">
        <h2 className="text-[#172B4D] text-xl font-semibold mb-6">Time Tracker</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="text-4xl font-mono font-semibold text-[#172B4D]">
              {formatDuration(elapsedTime)}
            </div>
          </div>
          
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-[#42526E] mb-1">
              Project
            </label>
            <select
              id="project"
              className="w-full rounded-sm border-2 border-[#DFE1E6] bg-white text-[#172B4D] hover:bg-[#FAFBFC] focus:border-[#4C9AFF] focus:bg-white transition-colors"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={!!activeTimeEntry}
            >
              <option value="" disabled>
                Select a project
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            
            {projects.length === 0 && (
              <p className="mt-1 text-sm text-[#FF5630]">
                Please create a project first.
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#42526E] mb-1">
              Description (optional)
            </label>
            <input
              id="description"
              type="text"
              className="w-full rounded-sm border-2 border-[#DFE1E6] bg-white text-[#172B4D] hover:bg-[#FAFBFC] focus:border-[#4C9AFF] focus:bg-white transition-colors"
              placeholder="What are you working on?"
              value={description}
              onChange={handleDescriptionChange}
              disabled={!!activeTimeEntry}
            />
          </div>
          
          <div className="flex justify-center pt-2">
            {!activeTimeEntry ? (
              <button
                className={`inline-flex items-center px-4 py-2 rounded-sm font-medium transition-colors ${
                  !selectedProjectId || projects.length === 0
                    ? 'bg-[#091E420F] text-[#A5ADBA] cursor-not-allowed'
                    : 'bg-[#0052CC] text-white hover:bg-[#0065FF]'
                }`}
                onClick={handleStartTimer}
                disabled={!selectedProjectId || projects.length === 0}
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Start Timer
              </button>
            ) : (
              <button
                className="inline-flex items-center px-4 py-2 rounded-sm font-medium bg-[#FF5630] text-white hover:bg-[#FF7452] transition-colors"
                onClick={handleStopTimer}
              >
                <PauseIcon className="h-5 w-5 mr-2" />
                Stop Timer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer; 