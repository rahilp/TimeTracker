export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  startTime: string;
  duration: number;
} 