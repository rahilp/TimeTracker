import { Project } from '@/types';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface AddProjectFormProps {
  onSubmit: (project: Omit<Project, 'id' | 'createdAt'>) => void;
}

export default function AddProjectForm({ onSubmit }: AddProjectFormProps) {
  const [newProjectName, setNewProjectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    onSubmit({
      name: newProjectName,
      color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
    });
    setNewProjectName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
        placeholder="Enter project name"
        className="flex-1 pl-3 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
      />
      <button
        type="submit"
        disabled={!newProjectName.trim()}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
          newProjectName.trim()
            ? 'bg-[#00283c] text-white hover:bg-blue-600'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <PlusIcon className="h-4 w-4" />
        Add Project
      </button>
    </form>
  );
} 