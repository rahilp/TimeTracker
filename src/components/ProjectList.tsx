import { Project } from '@/types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import DeleteProjectModal from './DeleteProjectModal';

interface ProjectListProps {
  projects: Project[];
  onDelete: (id: string) => void;
  onUpdate: (project: Project) => void;
  onDeleteWithEntries: (id: string) => void;
}

export default function ProjectList({
  projects,
  onDelete,
  onUpdate,
  onDeleteWithEntries,
}: ProjectListProps) {
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  const handleEditProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEditingProject(projectId);
      setEditingName(project.name);
    }
  };

  const handleSaveEdit = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && editingName.trim()) {
      onUpdate({
        ...project,
        name: editingName.trim()
      });
    }
    setEditingProject(null);
    setEditingName('');
  };

  const handleDeleteProject = (projectId: string) => {
    setDeletingProject(projectId);
  };

  return (
    <div className="divide-y divide-gray-100">
      {projects
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((project) => (
        <div
          key={project.id}
          className="py-4 first:pt-0 last:pb-0 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              {editingProject === project.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleSaveEdit(project.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(project.id)}
                  className="px-2 py-1 border rounded text-gray-900"
                  autoFocus
                />
              ) : (
                <span className="font-medium text-gray-900">{project.name}</span>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEditProject(project.id)}
                className="text-gray-400 p-1 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Edit project"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteProject(project.id)}
                className="text-gray-400 p-1 hover:text-red-600 rounded-full hover:bg-red-50"
                title="Delete project"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {deletingProject && (
        <DeleteProjectModal
          projectName={projects.find(p => p.id === deletingProject)?.name || ''}
          onDeleteWithEntries={() => {
            onDeleteWithEntries(deletingProject);
            setDeletingProject(null);
          }}
          onKeepEntries={() => {
            onDelete(deletingProject);
            setDeletingProject(null);
          }}
          onCancel={() => setDeletingProject(null)}
        />
      )}
    </div>
  );
} 