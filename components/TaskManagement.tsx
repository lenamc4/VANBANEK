import React, { useState } from 'react';
import { Assignment, TaskStatus } from '../types';
import { PencilSquareIcon, LinkIcon, MagnifyingGlassIcon, FunnelIcon, PaperClipIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { DEPARTMENTS } from '../constants';

interface Props {
  tasks: Assignment[];
  onUpdateTask: (task: Assignment) => void;
}

export const TaskManagement: React.FC<Props> = ({ tasks, onUpdateTask }) => {
  const [filterDept, setFilterDept] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'evidence' | 'explanation' | null>(null);
  const [tempValue, setTempValue] = useState('');

  const filteredTasks = tasks.filter(t => {
      const matchDept = filterDept === 'ALL' || t.assignedTo === filterDept;
      const matchSearch = t.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.officialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.summary.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchSearch;
  });

  const handleStatusChange = (task: Assignment, newStatus: TaskStatus) => {
    const updates: Partial<Assignment> = { status: newStatus };
    if (newStatus === TaskStatus.COMPLETED && !task.completedDate) {
        updates.completedDate = new Date().toISOString().split('T')[0];
    }
    onUpdateTask({ ...task, ...updates });
  };

  const startEditing = (task: Assignment, type: 'evidence' | 'explanation') => {
    setEditingId(task.id);
    setEditType(type);
    setTempValue(type === 'evidence' ? (task.evidenceLink || '') : (task.explanation || ''));
  };

  const saveEdit = (task: Assignment) => {
    if (editType === 'evidence') {
        onUpdateTask({ ...task, evidenceLink: tempValue });
    } else if (editType === 'explanation') {
        onUpdateTask({ ...task, explanation: tempValue });
    }
    setEditingId(null);
    setEditType(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, task: Assignment) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          saveEdit(task);
      }
  };

  const getStatusColor = (status: TaskStatus) => {
      switch(status) {
          case TaskStatus.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
          case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200';
          case TaskStatus.OVERDUE: return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
  }

  const renderAttachments = (task: Assignment) => {
      if (task.attachments && task.attachments.length > 0) {
          return (
              <div className="flex flex-col gap-1 mt-1">
                  {task.attachments.map((att, idx) => (
                      <a 
                        key={idx} 
                        href={att.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-100 transition-colors w-fit"
                      >
                          <PaperClipIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[150px]" title={att.name}>{att.name}</span>
                      </a>
                  ))}
              </div>
          );
      }
      return (
          <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
              <DocumentIcon className="w-3 h-3" />
              <span>{task.documentTitle}</span>
          </div>
      );
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Theo dõi thực hiện nhiệm vụ</h2>
        <div className="flex gap-2">
            <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm theo số ký hiệu, nội dung..." 
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-64"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="relative">
                <FunnelIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <select 
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    value={filterDept}
                    onChange={e => setFilterDept(e.target.value)}
                >
                    <option value="ALL">Tất cả đơn vị</option>
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
            </div>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 border-b">Số đến / Ngày</th>
              <th className="px-4 py-3 border-b w-64">Văn bản gốc</th>
              <th className="px-4 py-3 border-b">Nội dung chỉ đạo</th>
              <th className="px-4 py-3 border-b w-40">Đơn vị chủ trì</th>
              <th className="px-4 py-3 border-b w-32">Hạn xử lý</th>
              <th className="px-4 py-3 border-b w-32">Trạng thái</th>
              <th className="px-4 py-3 border-b w-64">Kết quả / Minh chứng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTasks.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Không tìm thấy dữ liệu</td></tr>
            ) : filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 align-top">
                        <div className="font-bold text-gray-900">#{task.arrivalNumber}</div>
                        <div className="text-xs text-gray-500">{new Date(task.arrivalDate).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                        <div className="font-bold text-blue-700">{task.officialNumber}</div>
                        <div className="text-xs text-gray-600 mb-1">{task.issuingBody}</div>
                        <div className="text-xs text-gray-500 line-clamp-3 italic mb-2" title={task.summary}>{task.summary}</div>
                        
                        {/* Attachments List */}
                        {renderAttachments(task)}
                    </td>
                    <td className="px-4 py-3 align-top">
                        <div className="text-gray-800 bg-yellow-50 p-2 rounded border border-yellow-100 text-xs">
                            {task.draftContent}
                        </div>
                    </td>
                    <td className="px-4 py-3 align-top font-medium text-gray-700">
                        {task.assignedTo}
                    </td>
                    <td className="px-4 py-3 align-top">
                        <span className={`font-medium ${new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED ? 'text-red-600' : 'text-gray-600'}`}>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : '---'}
                        </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                        <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                            className={`text-xs font-bold px-2 py-1 rounded border appearance-none cursor-pointer w-full text-center ${getStatusColor(task.status)}`}
                        >
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </td>
                    <td className="px-4 py-3 align-top">
                        {/* Explanation Field */}
                        <div className="mb-2">
                            {editingId === task.id && editType === 'explanation' ? (
                                <div className="flex flex-col gap-1">
                                    <textarea 
                                        className="w-full text-xs border p-1 rounded focus:ring-blue-500" 
                                        value={tempValue} 
                                        onChange={e => setTempValue(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, task)}
                                        rows={3}
                                        placeholder="Nhập kết quả thực hiện (Enter để lưu)..."
                                        autoFocus
                                    />
                                    <div className="flex gap-1 justify-end">
                                        <button onClick={() => setEditingId(null)} className="text-gray-500 text-[10px]">Hủy</button>
                                        <button onClick={() => saveEdit(task)} className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded">Lưu</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="group relative min-h-[20px] cursor-pointer" onClick={() => startEditing(task, 'explanation')}>
                                    <p className="text-xs text-gray-700 whitespace-pre-wrap">
                                        {task.explanation || <span className="text-gray-400 italic">Chưa có báo cáo...</span>}
                                    </p>
                                    <button className="hidden group-hover:block absolute -top-1 -right-1 text-blue-500 bg-white rounded-full p-0.5 shadow"><PencilSquareIcon className="w-3 h-3"/></button>
                                </div>
                            )}
                        </div>

                        {/* Evidence Link */}
                        <div>
                            {editingId === task.id && editType === 'evidence' ? (
                                <div className="flex gap-1 items-center">
                                    <input 
                                        className="w-full text-xs border p-1 rounded" 
                                        value={tempValue} 
                                        onChange={e => setTempValue(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, task)}
                                        placeholder="Link file (Enter để lưu)..."
                                        autoFocus
                                    />
                                    <button onClick={() => saveEdit(task)} className="text-green-600 hover:text-green-800"><CheckIcon className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <div className="group flex items-center gap-2">
                                    {task.evidenceLink ? (
                                        <a href={task.evidenceLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                                            <LinkIcon className="w-3 h-3"/> File đính kèm
                                        </a>
                                    ) : null}
                                    <button onClick={() => startEditing(task, 'evidence')} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500" title="Đính kèm file"><LinkIcon className="w-3 h-3"/></button>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper icon
const CheckIcon = ({className}:{className?:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
    </svg>
)