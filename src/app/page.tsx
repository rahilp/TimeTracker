'use client';

import { useState } from 'react';
import { format, endOfWeek } from 'date-fns';
import { useTimeTracker } from '@/contexts/TimeTrackerContext';
import { exportTimeEntriesToCSV, getAvailableWeeks } from '@/utils/export';
import ProjectList from '@/components/ProjectList';
import TimeEntryList from '@/components/TimeEntryList';
import AddProjectForm from '@/components/AddProjectForm';
import Timer from '@/components/Timer';
import { ClockIcon, FolderIcon, ArrowDownTrayIcon, PlayIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import Reports from '@/components/Reports';
import Settings from '@/components/Settings';

type Tab = 'entries' | 'projects' | 'reports' | 'settings';

export default function Home() {
  const {
    projects,
    timeEntries,
    activeEntry,
    addProject,
    deleteProject,
    updateProject,
    startTimer,
    stopTimer,
    deleteTimeEntry,
    updateTimeEntry,
    addTimeEntry,
    deleteProjectWithEntries,
  } = useTimeTracker();

  const [activeTab, setActiveTab] = useState<Tab>('entries');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const availableWeeks = getAvailableWeeks();

  const handleExport = () => {
    if (!selectedWeek) return;
    exportTimeEntriesToCSV(timeEntries, projects, selectedWeek);
    setShowExportModal(false);
  };

  const handleStartTimer = () => {
    if (selectedProjectId) {
      startTimer(selectedProjectId);
      setSelectedProjectId('');
    }
  };

  // If there's no data yet, show a loading state
  if (!projects || !timeEntries) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00283c] border-b border-[#003351]">
        <div className="container mx-auto px-4 py-4 pb-0">
          <div className="flex justify-between items-center" id="logo">
            <img src="https://cms.jibecdn.com/prod/insightglobal/assets/HEADER-NAV_LOGO-en-us-1689829053363.png" alt="logo" width={150} />
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 bg-white/10 text-white px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mt-6">
            <button
              onClick={() => setActiveTab('entries')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'entries'
                  ? 'bg-gray-50 text-[#00283c] font-medium'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <ClockIcon className="h-5 w-5" />
              Time Entries
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'projects'
                  ? 'bg-gray-50 text-[#00283c] font-medium'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <FolderIcon className="h-5 w-5" />
              Projects
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'reports'
                  ? 'bg-gray-50 text-[#00283c] font-medium'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <ChartBarIcon className="h-5 w-5" />
              Reports
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-gray-50 text-[#00283c] font-medium'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-6">
        {activeTab === 'projects' ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Project</h2>
              <AddProjectForm onSubmit={addProject} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Projects</h2>
              <ProjectList
                projects={projects}
                onDelete={deleteProject}
                onUpdate={updateProject}
                onDeleteWithEntries={deleteProjectWithEntries}
              />
            </div>
          </div>
        ) : activeTab === 'reports' ? (
          <Reports
            timeEntries={timeEntries}
            projects={projects}
          />
        ) : activeTab === 'settings' ? (
          <Settings />
        ) : (
          <div className="space-y-6">
            <TimeEntryList
              timeEntries={timeEntries}
              projects={projects}
              activeEntry={activeEntry}
              onDelete={deleteTimeEntry}
              onUpdate={updateTimeEntry}
              onStopTimer={stopTimer}
              onAddTimeEntry={addTimeEntry}
              onStartTimer={startTimer}
            />
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Export Weekly Report</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Week
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a week</option>
                {availableWeeks.map((week) => (
                  <option key={week} value={week}>
                    {week}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={!selectedWeek}
                className={`px-4 py-2 rounded ${
                  selectedWeek
                    ? 'bg-[#00283c] text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
