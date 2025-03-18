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
        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#00283c] text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <PlusIcon className="h-5 w-5" />
        Add Project
      </button>
    </form>
  );
} 