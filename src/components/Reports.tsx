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

  // Generate list of available weeks (current week and past 11 weeks)
  const availableWeeks = Array.from({ length: 12 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    return weekStart;
  });

  // Filter entries for selected week and aggregate by project
  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

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

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const totalSeconds = weeklyData.reduce((sum, { totalDuration }) => sum + totalDuration, 0);
  const activeProjects = weeklyData.length;
  const totalEntries = weeklyData.reduce((sum, { entries }) => sum + entries.length, 0);

  const projectSummary = useMemo(() => {
    const summary = weeklyData.map(({ projectId, project, totalDuration, entries }) => ({
      projectId,
      projectName: project?.name || 'Unknown Project',
      projectColor: project?.color || '#CBD5E1',
      totalSeconds: totalDuration,
      entries: entries.length
    }));
    return summary;
  }, [weeklyData]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Reports</h2>
        
        {/* Week Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedWeek(prev => subWeeks(prev, 1))}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div className="relative flex-1">
              <select
                value={selectedWeek.toISOString()}
                onChange={(e) => setSelectedWeek(new Date(e.target.value))}
                className="w-full pl-8 pr-8 py-1.5 appearance-none bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              >
                {availableWeeks.map((week) => (
                  <option key={week.toISOString()} value={week.toISOString()}>
                    Week ending {format(endOfWeek(week, { weekStartsOn: 1 }), 'MMM d, yyyy')}
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
              onClick={() => setSelectedWeek(prev => addWeeks(prev, 1))}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              disabled={selectedWeek >= startOfWeek(new Date(), { weekStartsOn: 1 })}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Total Hours */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
            <p className="text-2xl font-semibold text-gray-900">{formatDuration(totalSeconds)}</p>
          </div>
          
          {/* Active Projects */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
            <p className="text-2xl font-semibold text-gray-900">{activeProjects}</p>
          </div>
          
          {/* Total Entries */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Entries</h3>
            <p className="text-2xl font-semibold text-gray-900">{totalEntries}</p>
          </div>
        </div>

        {/* Project Summary Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entries
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectSummary.map((summary) => (
                <tr key={summary.projectId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: summary.projectColor }} />
                      <div className="text-sm font-medium text-gray-900">{summary.projectName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {formatDuration(summary.totalSeconds)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {summary.entries}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {((summary.totalSeconds / totalSeconds) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 