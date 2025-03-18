'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Project, TimeEntry } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { generateId } from '@/utils/id';
import { format } from 'date-fns';

interface TimeTrackerContextType {
  projects: Project[];
  timeEntries: TimeEntry[];
  activeEntry?: TimeEntry;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  deleteProject: (id: string) => void;
  deleteProjectWithEntries: (id: string) => void;
  updateProject: (project: Project) => void;
  startTimer: (projectId: string) => void;
  stopTimer: () => void;
  deleteTimeEntry: (id: string) => void;
  updateTimeEntry: (entry: TimeEntry) => void;
  addTimeEntry: (entry: { projectId: string; startTime: string; duration: number }) => void;
  deleteAllData: () => void;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined);

// Helper functions to handle localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Helper function to send webhook
const sendWebhook = async (url: string, data: any) => {
  if (!url) return;
  
  try {
    console.log('Sending webhook data:', data); // Debug log
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        data: data,
        timestamp: new Date().toISOString(),
        event: 'time_entry_update'
      }),
    });
    
    if (!response.ok) {
      console.error('Webhook failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        data: data
      });
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    console.log('Webhook sent successfully:', {
      status: response.status,
      url: url
    });
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
};

// Helper function to format time entry for webhook
const formatTimeEntryForWebhook = (entry: TimeEntry, project: Project) => {
  const startTime = new Date(entry.startTime);
  const endTime = new Date(startTime.getTime() + (entry.duration * 1000));
  
  const formattedData = {
    uniqueId: entry.id,
    projectName: project.name,
    projectId: project.id,
    startTime: format(startTime, 'HH:mm:ss'),
    endTime: format(endTime, 'HH:mm:ss'),
    date: format(startTime, 'yyyy-MM-dd'),
    duration: entry.duration,
    createdAt: entry.createdAt
  };

  console.log('Formatted webhook data:', formattedData); // Debug log
  return formattedData;
};

export function TimeTrackerProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | undefined>();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjects = loadFromStorage<Project[]>('projects', []);
    const savedEntries = loadFromStorage<TimeEntry[]>('timeEntries', []);
    const savedEntry = loadFromStorage<TimeEntry | undefined>('activeEntry', undefined);

    setProjects(savedProjects);
    setTimeEntries(savedEntries);
    setActiveEntry(savedEntry);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveToStorage('projects', projects);
  }, [projects]);

  useEffect(() => {
    saveToStorage('timeEntries', timeEntries);
  }, [timeEntries]);

  useEffect(() => {
    saveToStorage('activeEntry', activeEntry);
  }, [activeEntry]);

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const deleteProjectWithEntries = (id: string) => {
    // Delete all time entries for this project
    setTimeEntries(prev => prev.filter(entry => entry.projectId !== id));
    // Delete the project itself
    setProjects(prev => prev.filter(p => p.id !== id));
    // If there's an active entry for this project, stop it
    if (activeEntry?.projectId === id) {
      setActiveEntry(undefined);
    }
  };

  const addTimeEntry = async (entry: { projectId: string; startTime: string; duration: number }) => {
    const project = projects.find(p => p.id === entry.projectId);
    if (!project) return;

    const newEntry: TimeEntry = {
      id: uuidv4(),
      projectId: entry.projectId,
      projectName: project.name,
      projectColor: project.color,
      startTime: entry.startTime,
      duration: entry.duration,
      createdAt: new Date().toISOString(),
    };
    setTimeEntries(prev => [...prev, newEntry]);

    // Send webhook for new entry
    const settings = loadFromStorage('userSettings', { webhookUrl: '' });
    if (settings.webhookUrl) {
      const webhookData = formatTimeEntryForWebhook(newEntry, project);
      await sendWebhook(settings.webhookUrl, webhookData);
    }
  };

  const updateProject = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    
    // Update project name and color in time entries
    setTimeEntries(prev => prev.map(entry => 
      entry.projectId === project.id 
        ? { ...entry, projectName: project.name, projectColor: project.color }
        : entry
    ));

    // Update active entry if it exists
    if (activeEntry?.projectId === project.id) {
      setActiveEntry(prev => prev ? { ...prev, projectName: project.name, projectColor: project.color } : undefined);
    }
  };

  const startTimer = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newEntry: TimeEntry = {
      id: uuidv4(),
      projectId,
      projectName: project.name,
      projectColor: project.color,
      startTime: new Date().toISOString(),
      duration: 0,
      createdAt: new Date().toISOString(),
    };
    setActiveEntry(newEntry);
  };

  const stopTimer = async () => {
    if (activeEntry) {
      const duration = Math.floor((new Date().getTime() - new Date(activeEntry.startTime).getTime()) / 1000);
      const completedEntry = { ...activeEntry, duration };
      setTimeEntries(prev => [...prev, completedEntry]);
      setActiveEntry(undefined);

      // Send webhook for completed timer entry
      const settings = loadFromStorage('userSettings', { webhookUrl: '' });
      if (settings.webhookUrl) {
        const project = projects.find(p => p.id === completedEntry.projectId);
        if (project) {
          const webhookData = formatTimeEntryForWebhook(completedEntry, project);
          await sendWebhook(settings.webhookUrl, webhookData);
        }
      }
    }
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const updateTimeEntry = async (entry: TimeEntry) => {
    setTimeEntries(prev => prev.map(e => e.id === entry.id ? entry : e));

    // Send webhook for updated entry
    const settings = loadFromStorage('userSettings', { webhookUrl: '' });
    if (settings.webhookUrl) {
      const project = projects.find(p => p.id === entry.projectId);
      if (project) {
        const webhookData = formatTimeEntryForWebhook(entry, project);
        await sendWebhook(settings.webhookUrl, webhookData);
      }
    }
  };

  const deleteAllData = () => {
    setProjects([]);
    setTimeEntries([]);
    setActiveEntry(undefined);
    localStorage.removeItem('projects');
    localStorage.removeItem('timeEntries');
    localStorage.removeItem('activeEntry');
  };

  return (
    <TimeTrackerContext.Provider
      value={{
        projects,
        timeEntries,
        activeEntry,
        addProject,
        deleteProject,
        deleteProjectWithEntries,
        updateProject,
        startTimer,
        stopTimer,
        deleteTimeEntry,
        updateTimeEntry,
        addTimeEntry,
        deleteAllData,
      }}
    >
      {children}
    </TimeTrackerContext.Provider>
  );
}

export function useTimeTracker() {
  const context = useContext(TimeTrackerContext);
  if (context === undefined) {
    throw new Error('useTimeTracker must be used within a TimeTrackerProvider');
  }
  return context;
} 