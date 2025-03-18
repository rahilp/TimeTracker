export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  startTime: string;
  duration: number; // in seconds
  createdAt: string;
}

export interface TimeTrackerContextType {
  projects: Project[];
  timeEntries: TimeEntry[];
  activeEntry?: TimeEntry;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  deleteProject: (id: string) => void;
  deleteProjectWithEntries: (id: string) => void;
  updateProject: (project: Project) => void;
  startTimer: (projectId: string, notes?: string) => void;
  stopTimer: () => void;
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  deleteTimeEntry: (id: string) => void;
  updateTimeEntry: (entry: TimeEntry) => void;
} 