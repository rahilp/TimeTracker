import { Project, TimeEntry } from '@/types';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks, parse, formatDistanceStrict } from 'date-fns';
import { PencilIcon, TrashIcon, ClockIcon, CalendarIcon, ChevronUpDownIcon, StopIcon, PlayIcon } from '@heroicons/react/24/outline';
import { ClockIcon as ClockIconSolid, PencilIcon as PencilIconSolid } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import Timer from '@/components/Timer';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  projects: Project[];
  activeEntry?: TimeEntry;
  onDelete: (id: string) => void;
  onUpdate: (entry: TimeEntry) => void;
  onStopTimer: () => void;
  onAddTimeEntry: (entry: { projectId: string; startTime: string; duration: number }) => void;
  onStartTimer: (projectId: string) => void;
}

type EntryMethod = 'timer' | 'manual';

export default function TimeEntryList({
  timeEntries,
  projects,
  activeEntry,
  onDelete,
  onUpdate,
  onStopTimer,
  onAddTimeEntry,
  onStartTimer
}: TimeEntryListProps) {
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editingDuration, setEditingDuration] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [entryMethod, setEntryMethod] = useState<EntryMethod>('timer');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newEntry, setNewEntry] = useState({
    projectId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), 'HH:mm'),
    endTime: format(new Date(), 'HH:mm'),
  });

  // Get available weeks (current week and past 11 weeks)
  const availableWeeks = Array.from({ length: 12 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    return weekStart;
  });

  // Filter entries for selected week
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  
  const weeklyEntries = timeEntries.filter(entry =>
    isWithinInterval(new Date(entry.startTime), { start: weekStart, end: weekEnd })
  );

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry.id);
    setEditingDuration(Math.round(entry.duration / 60).toString());
  };

  const handleSaveEdit = (entry: TimeEntry) => {
    const minutes = parseInt(editingDuration, 10);
    if (!isNaN(minutes) && minutes >= 0) {
      onUpdate({
        ...entry,
        duration: minutes * 60 // Convert minutes to seconds
      });
    }
    setEditingEntry(null);
    setEditingDuration('');
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      onDelete(id);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
        <ClockIcon />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries yet</h3>
      <p className="text-gray-500 mb-6">Time to get productive! Start tracking your work time.</p>
      <div className="text-4xl mb-4">⏰ 💪 ✨</div>
    </div>
  );

  const calculateDuration = (start: Date, end: Date) => {
    let endDateTime = end;
    // If end time is earlier than start time, assume it's the next day
    if (end < start) {
      endDateTime = new Date(end.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
    }
    const durationInSeconds = Math.max(0, (endDateTime.getTime() - start.getTime()) / 1000);
    if (durationInSeconds === 0) return '';
    return formatDistanceStrict(endDateTime, start);
  };

  const handleAddEntry = () => {
    const startDateTime = parse(
      `${newEntry.date} ${newEntry.startTime}`,
      'yyyy-MM-dd HH:mm',
      new Date()
    );
    
    let endDateTime = parse(
      `${newEntry.date} ${newEntry.endTime}`,
      'yyyy-MM-dd HH:mm',
      new Date()
    );

    // If end time is earlier than start time, assume it's the next day
    if (endDateTime < startDateTime) {
      endDateTime = new Date(endDateTime.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
    }

    // Calculate duration in seconds
    const duration = Math.max(0, (endDateTime.getTime() - startDateTime.getTime()) / 1000);
    
    onAddTimeEntry({
      projectId: newEntry.projectId,
      startTime: startDateTime.toISOString(),
      duration,
    });

    setNewEntry({
      projectId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: format(new Date(), 'HH:mm'),
      endTime: format(new Date(), 'HH:mm'),
    });
  };

  const handleStartTimer = () => {
    if (selectedProjectId) {
      onStartTimer(selectedProjectId);
      setSelectedProjectId('');
    }
  };

  return (
    <div className="space-y-6">
      {!activeEntry && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Time Entry</h2>
              <div className="flex bg-gray-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setEntryMethod('timer')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all duration-200 ${
                    entryMethod === 'timer'
                      ? 'bg-white bg-[#00283c] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {entryMethod === 'timer' ? (
                    <ClockIconSolid className="h-4 w-4" />
                  ) : (
                    <ClockIcon className="h-4 w-4" />
                  )}
                  Timer
                </button>
                <button
                  onClick={() => setEntryMethod('manual')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all duration-200 ${
                    entryMethod === 'manual'
                      ? 'bg-white bg-[#00283c] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {entryMethod === 'manual' ? (
                    <PencilIconSolid className="h-4 w-4" />
                  ) : (
                    <PencilIcon className="h-4 w-4" />
                  )}
                  Manual
                </button>
              </div>
            </div>

            <div className="relative min-h-[60px]">
              <div className={`transform transition-all duration-300 ${
                entryMethod === 'timer' ? 'translate-x-0 opacity-100 relative' : '-translate-x-full opacity-0 absolute'
              } inset-0`}>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full pl-8 pr-4 py-1.5 appearance-none bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                    >
                      <option value="">Select a project to track time</option>
                      {projects
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: selectedProjectId 
                            ? projects.find(p => p.id === selectedProjectId)?.color 
                            : '#9CA3AF'
                        }}
                      />
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronUpDownIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <button
                    onClick={handleStartTimer}
                    disabled={!selectedProjectId}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors text-sm ${
                      selectedProjectId
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <PlayIcon className="h-5 w-5" />
                    Start Timer
                  </button>
                </div>
              </div>

              <div className={`transform transition-all duration-300 ${
                entryMethod === 'manual' ? 'translate-x-0 opacity-100 relative' : 'translate-x-full opacity-0 absolute'
              } inset-0`}>
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative w-full lg:w-[45%]">
                    <select
                      value={newEntry.projectId}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, projectId: e.target.value }))}
                      className="w-full pl-8 pr-4 py-1.5 appearance-none bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                    >
                      <option value="">Select a project</option>
                      {projects
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                    </select>
                    <div className="absolute left-3 top-[45%] -translate-y-1/2 pointer-events-none flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ 
                          backgroundColor: newEntry.projectId 
                            ? projects.find(p => p.id === newEntry.projectId)?.color 
                            : '#9CA3AF'
                        }}
                      />
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronUpDownIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full lg:w-[55%]">
                    <div className="relative w-[25%]">
                      <input
                        type="date"
                        value={newEntry.date}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full pl-8 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="relative w-[50%]">
                      <div className="flex">
                        <div className="relative flex-1">
                          <input
                            type="time"
                            value={newEntry.startTime}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, startTime: e.target.value }))}
                            className="w-full pl-8 pr-2 py-1.5 bg-white border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 border-r-0"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ClockIcon className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex items-center px-2 bg-white border-t border-b border-gray-200">
                          <div className="text-gray-400">-</div>
                        </div>
                        <input
                          type="time"
                          value={newEntry.endTime}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, endTime: e.target.value }))}
                          className="flex-1 pl-2 pr-2 py-1.5 bg-white border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 border-l-0"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddEntry}
                      disabled={!newEntry.projectId || !newEntry.startTime || !newEntry.endTime}
                      className={`w-[25%] px-4 py-1.5 rounded-lg transition-colors text-sm ${
                        newEntry.projectId && newEntry.startTime && newEntry.endTime
                          ? 'bg-[#00283c] text-white hover:bg-blue-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add Entry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="mb-4">
          <div className="relative">
            <select
              value={selectedWeek.toISOString()}
              onChange={(e) => setSelectedWeek(new Date(e.target.value))}
              className="w-full pl-8 pr-8 py-1.5 appearance-none bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            >
              {availableWeeks.map((week) => (
                <option key={week.toISOString()} value={week.toISOString()}>
                  {format(week, "'Week of' MMM d, yyyy")}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronUpDownIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        {activeEntry && (
          <ActiveTimeEntry
            entry={activeEntry}
            onStop={onStopTimer}
          />
        )}

        {weeklyEntries.length === 0 && !activeEntry ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-gray-100">
            {weeklyEntries.slice().reverse().map((entry) => (
              <div
                key={entry.id}
                className="py-4 first:pt-0 last:pb-0 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.projectColor }}
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {entry.projectName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(entry.startTime), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {editingEntry === entry.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editingDuration}
                            onChange={(e) => setEditingDuration(e.target.value)}
                            onBlur={() => handleSaveEdit(entry)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(entry)}
                            className="w-20 px-2 py-1 border rounded"
                            min="0"
                            autoFocus
                          />
                          <span className="text-gray-500">minutes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          {formatDuration(entry.duration)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="text-gray-400 p-1 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        title="Edit duration"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-gray-400 p-1 hover:text-red-600 rounded-full hover:bg-red-50"
                        title="Delete entry"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ActiveTimeEntryProps {
  entry: TimeEntry;
  onStop: () => void;
}

function ActiveTimeEntry({ entry, onStop }: ActiveTimeEntryProps) {
  const [elapsedTime, setElapsedTime] = useState(entry.duration);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(entry.startTime);
      setElapsedTime(Math.floor((now.getTime() - start.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [entry.startTime]);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.projectColor }}
            />
            <div>
              <div className="font-medium text-sm text-blue-900">
                {entry.projectName}
              </div>
              <div className="text-xs">
                Started at {format(new Date(entry.startTime), 'h:mm a')}
              </div>
            </div>
          </div>
          <button
            onClick={onStop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            <StopIcon className="h-4 w-4" />
            Stop Timer
          </button>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-3xl font-mono text-blue-700 tabular-nums">
            {formatElapsedTime(elapsedTime)}
          </div>
        </div>
      </div>
    </div>
  );
} 