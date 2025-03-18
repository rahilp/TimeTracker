import { TimeEntry, Project } from '@/types';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, subMonths } from 'date-fns';

interface WeeklyAggregate {
  projectId: string;
  totalHours: number;
  totalMinutes: number;
}

export function getAvailableWeeks(): string[] {
  const now = new Date();
  const threeMonthsAgo = subMonths(now, 3);
  
  const weeks = eachWeekOfInterval(
    {
      start: threeMonthsAgo,
      end: now
    },
    { weekStartsOn: 0 }
  );

  return weeks.map(week => {
    const weekEnd = endOfWeek(week, { weekStartsOn: 0 });
    return `${format(week, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
  }).reverse(); // Return weeks in descending order
}

function escapeCsvValue(value: string | number): string {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function exportTimeEntriesToCSV(timeEntries: TimeEntry[], projects: Project[], weekLabel: string) {
  // Parse the week label to get start and end dates
  const [startStr, endStr] = weekLabel.split(' - ');
  const year = endStr.split(', ')[1];
  const startDate = new Date(`${startStr}, ${year}`);
  const endDate = new Date(endStr);

  // Filter time entries for the selected week
  const weekEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= startDate && entryDate <= endDate;
  });

  // Aggregate time per project
  const projectAggregates = new Map<string, WeeklyAggregate>();
  let totalHours = 0;
  let totalMinutes = 0;

  weekEntries.forEach(entry => {
    const duration = entry.duration / 60; // Convert seconds to minutes
    const hours = Math.floor(duration / 60);
    const minutes = Math.round(duration % 60);

    let aggregate = projectAggregates.get(entry.projectId);
    if (!aggregate) {
      aggregate = { projectId: entry.projectId, totalHours: 0, totalMinutes: 0 };
      projectAggregates.set(entry.projectId, aggregate);
    }

    aggregate.totalHours += hours;
    aggregate.totalMinutes += minutes;

    // Carry over minutes to hours if they exceed 60
    if (aggregate.totalMinutes >= 60) {
      aggregate.totalHours += Math.floor(aggregate.totalMinutes / 60);
      aggregate.totalMinutes = aggregate.totalMinutes % 60;
    }

    totalHours += hours;
    totalMinutes += minutes;
  });

  // Carry over total minutes to hours if they exceed 60
  if (totalMinutes >= 60) {
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;
  }

  // Create CSV content
  let csvContent = 'Project,Total Hours,Total Minutes\n';

  // Add project rows
  Array.from(projectAggregates.values()).forEach(aggregate => {
    const project = projects.find(p => p.id === aggregate.projectId);
    csvContent += `${escapeCsvValue(project?.name || 'Deleted Project')},${aggregate.totalHours},${aggregate.totalMinutes}\n`;
  });

  // Add total row
  csvContent += `Total,${totalHours},${totalMinutes}\n`;

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const filename = `timetracker_${weekLabel.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
  
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 