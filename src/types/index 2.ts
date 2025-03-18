export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyReport {
  startDate: Date;
  endDate: Date;
  entries: TimeEntry[];
  totalDuration: number;
  projectBreakdown: {
    [projectId: string]: number;
  };
} 