import { useState, useMemo } from 'react';
import { Project, TimeEntry } from '@/types';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval } from 'date-fns';
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

interface ReportsProps {
  timeEntries: TimeEntry[];
  projects: Project[];
}

export default function Reports({ timeEntries, projects }: ReportsProps) {
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Generate list of available weeks
  const weeks = useMemo(() => {
    const uniqueWeeks = new Set<string>();
    timeEntries.forEach(entry => {
      const weekStart = startOfWeek(new Date(entry.startTime));
      uniqueWeeks.add(weekStart.toISOString());
    });
    return Array.from(uniqueWeeks)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());
  }, [timeEntries]);

  // Filter entries for selected week and aggregate by project
  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(selectedWeek);
    const weekEnd = endOfWeek(selectedWeek);

    const filteredEntries = timeEntries.filter(entry =>
      isWithinInterval(new Date(entry.startTime), { start: weekStart, end: weekEnd })
    );

    const projectAggregates = new Map<string, { totalDuration: number; entries: TimeEntry[] }>();

    filteredEntries.forEach(entry => {
      const current = projectAggregates.get(entry.projectId) || { totalDuration: 0, entries: [] };
      projectAggregates.set(entry.projectId, {
        totalDuration: current.totalDuration + entry.duration,
        entries: [...current.entries, entry]
      });
    });

    return Array.from(projectAggregates.entries())
      .map(([projectId, data]) => ({
        projectId,
        project: projects.find(p => p.id === projectId),
        ...data
      }))
      .sort((a, b) => (a.project?.name || '').localeCompare(b.project?.name || ''));
  }, [timeEntries, projects, selectedWeek]);

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatTimeRange = (startTime: string, duration: number): string => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 1000);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Weekly Reports</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div className="relative">
              <select
                value={selectedWeek.toISOString()}
                onChange={(e) => setSelectedWeek(new Date(e.target.value))}
                className="w-full pl-8 pr-8 py-1.5 appearance-none bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              >
                {weeks.map(week => (
                  <option key={week.toISOString()} value={week.toISOString()}>
                    {format(week, 'MMM d')} - {format(endOfWeek(week), 'MMM d, yyyy')}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CalendarIcon className="h-4 w-4" />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronUpDownIcon className="h-4 w-4" />
              </div>
            </div>
            <button
              onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {weeklyData.map(({ projectId, project, totalDuration, entries }) => (
            <div key={projectId} className="border rounded-lg">
              <button
                onClick={() => toggleProject(projectId)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: project?.color || '#CBD5E1' }}
                  />
                  <span className="font-medium">{project?.name || 'Unknown Project'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">{formatDuration(totalDuration)}</span>
                  {expandedProjects.has(projectId) ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedProjects.has(projectId) && (
                <div className="border-t px-4 py-3">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Time</th>
                        <th className="pb-2 text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {entries.map(entry => (
                        <tr key={entry.id} className="border-t first:border-t-0">
                          <td className="py-2">{format(new Date(entry.startTime), 'MMM d, yyyy')}</td>
                          <td className="py-2">{formatTimeRange(entry.startTime, entry.duration)}</td>
                          <td className="py-2 text-right">{formatDuration(entry.duration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {weeklyData.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No time entries for this week
            </div>
          )}

          {weeklyData.length > 0 && (
            <div className="border-t mt-4 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Total Time</span>
                <span className="text-gray-900">
                  {formatDuration(weeklyData.reduce((sum, { totalDuration }) => sum + totalDuration, 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 