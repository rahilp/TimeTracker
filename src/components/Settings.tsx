import { useState, useEffect } from 'react';
import { useTimeTracker } from '@/contexts/TimeTrackerContext';

export default function Settings() {
  const { deleteAllData } = useTimeTracker();
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    webhookUrl: ''
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  const handleSave = (field: keyof typeof settings, value: string) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleReset = () => {
    if (showResetConfirm) {
      deleteAllData();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
        
        <div className="space-y-6">
          {/* Name Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => handleSave('name', e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00283c] focus:border-transparent"
            />
          </div>

          {/* Email Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleSave('email', e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00283c] focus:border-transparent"
            />
          </div>

          {/* Webhook URL Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={settings.webhookUrl}
              onChange={(e) => handleSave('webhookUrl', e.target.value)}
              placeholder="Enter webhook URL"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00283c] focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Notifications will be sent to this URL when time entries are created or updated.
            </p>
          </div>

          {/* Reset Application */}
          <div className="pt-6 border-t">
            <h3 className="text-base font-medium text-gray-900 mb-2">Reset Application</h3>
            <p className="text-sm text-gray-500 mb-4">
              This will permanently delete all projects and time entries. This action cannot be undone.
            </p>
            <button
              onClick={handleReset}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showResetConfirm
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {showResetConfirm ? 'Click again to confirm reset' : 'Reset Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 