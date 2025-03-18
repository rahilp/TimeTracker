import { Project, TimeEntry } from '@/types';
import { StopIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

interface TimerProps {
  entry: TimeEntry;
  project?: Project;
  onStop: () => void;
}

export default function Timer({ entry, project, onStop }: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const startTime = new Date(entry.startTime).getTime();
    setElapsedTime(Math.floor((Date.now() - startTime) / 1000));

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [entry.startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <span className="text-lg font-semibold">
          {project?.name || 'Deleted Project'}
        </span>
        <span className="text-2xl font-mono">
          {formatTime(elapsedTime)}
        </span>
      </div>
      <button
        onClick={onStop}
        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
      >
        <StopIcon className="h-6 w-6" />
      </button>
    </div>
  );
} 