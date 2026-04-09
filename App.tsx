
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardStats } from './components/DashboardStats';
import { StatisticalReport } from './components/StatisticalReport';
import { IncomingDocumentForm } from './components/IncomingDocumentForm';
import { TaskManagement } from './components/TaskManagement';
import { Assignment } from './types';
import { CheckCircleIcon, Cog6ToothIcon, KeyIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Assignment[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('eakar_tasks');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setTasks(Array.isArray(parsed) ? parsed : []); 
      } catch (e) { console.error(e); }
    }
    if (apiKey) { (window as any).GEMINI_API_KEY = apiKey; }
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('eakar_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
  };

  const handleTaskCreated = (newTask: Assignment) => {
    setTasks(prev => [newTask, ...prev]);
    showToast('Đã phát hành văn bản và giao nhiệm vụ thành công!');
    setCurrentView('tasks');
  };

  const handleUpdateTask = (updatedTask: Assignment) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const saveApiKey = () => {
      localStorage.setItem('gemini_api_key', apiKey);
      (window as any).GEMINI_API_KEY = apiKey;
      showToast('Đã lưu cấu hình API Key!');
  };

  const SettingsView = () => (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-portal border border-gray-200 mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
              <Cog6ToothIcon className="w-7 h-7 text-eakar-primary" />
              CẤU HÌNH HỆ THỐNG
          </h2>
          
          <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Gemini API Key (Google AI)</label>
              <div className="flex gap-2">
                  <input 
                      type="password" 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-eakar-primary outline-none"
                  />
                  <button onClick={saveApiKey} className="px-6 py-2 bg-eakar-primary text-white rounded-lg hover:bg-eakar-sidebar font-bold transition">
                      LƯU CẤU HÌNH
                  </button>
              </div>
          </div>
          
          <div className="pt-4 text-xs text-gray-500">
              <p>Phiên bản tác nghiệp: 3.5.0</p>
              <p>Bản quyền thuộc về: UBND Xã Ea Kar - Tỉnh Đắk Lắk</p>
          </div>
      </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Trang chủ điều hành</h2>
                <span className="text-sm font-medium text-gray-500">Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
            </div>
            <DashboardStats tasks={tasks} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-portal border border-gray-200">
                    <h3 className="font-bold text-gray-700 border-b pb-3 mb-4 uppercase text-sm text-eakar-primary">Văn bản chờ xử lý</h3>
                    <ul className="space-y-3">
                        {tasks.filter(t => t.status === 'Chưa xử lý').slice(0, 5).map(t => (
                            <li key={t.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <div className="truncate pr-4">
                                    <p className="text-sm font-bold text-gray-800 truncate">{t.documentTitle}</p>
                                    <p className="text-[10px] text-gray-500">{t.issuingBody} • {t.officialNumber}</p>
                                </div>
                                <button onClick={() => setCurrentView('tasks')} className="shrink-0 px-3 py-1 bg-eakar-primary text-white text-[10px] font-bold rounded">XỬ LÝ</button>
                            </li>
                        ))}
                        {tasks.length === 0 && <p className="text-center text-gray-400 py-10 italic">Hệ thống đang chờ tiếp nhận văn bản mới</p>}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-portal border border-gray-200 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-eakar-bg rounded-full flex items-center justify-center mb-4">
                        <CheckCircleIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-700 mb-2 uppercase text-sm">Hiệu suất công việc</h3>
                    <p className="text-sm text-gray-500 mb-4">Tỷ lệ hoàn thành nhiệm vụ trong tháng đạt {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Đã hoàn thành').length / tasks.length) * 100) : 0}%</p>
                    <button onClick={() => setCurrentView('reports')} className="px-6 py-2 bg-eakar-primary text-white rounded font-bold text-xs uppercase shadow-lg hover:shadow-eakar-primary/20 transition">Xem chi tiết báo cáo</button>
                </div>
            </div>
          </div>
        );
      case 'reception':
        return <IncomingDocumentForm onTaskCreated={handleTaskCreated} />;
      case 'tasks':
        return <TaskManagement tasks={tasks} onUpdateTask={handleUpdateTask} />;
      case 'reports':
        return <StatisticalReport tasks={tasks} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans flex overflow-hidden">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* CONTENT AREA */}
        <div className="flex-1 p-8 overflow-y-auto bg-[#f1f5f9]">
            {notification && (
                <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in border-l-4 ${notification.type === 'success' ? 'bg-white border-green-600 text-green-800' : 'bg-white border-red-600 text-red-800'}`}>
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    <span className="font-bold">{notification.message}</span>
                </div>
            )}

            {!apiKey && (
                <div className="bg-white border-l-4 border-yellow-500 p-4 mb-6 rounded shadow-portal flex justify-between items-center animate-fade-in">
                    <p className="text-sm text-gray-700">
                        <strong className="text-yellow-700">Cảnh báo:</strong> Hệ thống AI chưa được kích hoạt. Hãy cấu hình API Key để sử dụng tính năng tham mưu tự động.
                    </p>
                    <button onClick={() => setCurrentView('settings')} className="text-xs font-bold bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200 transition">CẤU HÌNH NGAY</button>
                </div>
            )}

            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
