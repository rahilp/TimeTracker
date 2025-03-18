import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteProjectModalProps {
  projectName: string;
  onDeleteWithEntries: () => void;
  onKeepEntries: () => void;
  onCancel: () => void;
}

export default function DeleteProjectModal({
  projectName,
  onDeleteWithEntries,
  onKeepEntries,
  onCancel,
}: DeleteProjectModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[420px] max-w-full mx-4">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-1.5">
                Delete Project
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Do you want to delete the project "{projectName}"?
              </p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>• Delete the project and all its time entries</p>
                <p>• Delete only the project but keep its time entries</p>
                <p>• Cancel this operation</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t px-4 py-3 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onKeepEntries}
            className="w-full sm:w-auto px-3 py-1.5 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Keep All Entries
          </button>
          <button
            onClick={onDeleteWithEntries}
            className="w-full sm:w-auto px-3 py-1.5 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            Delete All Entries
          </button>
        </div>
      </div>
    </div>
  );
} 