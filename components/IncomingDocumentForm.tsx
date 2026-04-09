
import { useState, useRef } from 'react';
import React from 'react';
import { 
    CloudArrowUpIcon, 
    DocumentTextIcon, 
    ArrowPathIcon,
    TrashIcon,
    SparklesIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    ShieldCheckIcon,
    ScaleIcon
} from '@heroicons/react/24/solid';
import { 
    StarIcon as StarOutline,
    DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { analyzeDocument } from '../services/geminiService';
import { GeminiAnalysisResult, Assignment, TaskStatus, DocumentType, DraftOption, AnalysisFile } from '../types';
import { OfficialDocumentEditor } from './OfficialDocumentEditor';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onTaskCreated: (task: Assignment) => void;
}

export const IncomingDocumentForm: React.FC<Props> = ({ onTaskCreated }) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'SELECTION' | 'EDITOR'>('INFO');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{file: File, isMain: boolean}[]>([]);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Assignment>>({
    officialNumber: '',
    issuingBody: '',
    documentType: 'Công văn',
    summary: '',
    assignedTo: '',
    draftContent: '',
    deadline: '',
    priority: 'Bình thường'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files).map((f, i) => ({
            file: f,
            isMain: uploadedFiles.length === 0 && i === 0
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
        e.target.value = '';
    }
  };

  const setMainFile = (index: number) => {
    setUploadedFiles(prev => prev.map((f, i) => ({ ...f, isMain: i === index })));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
        const updated = prev.filter((_, i) => i !== index);
        if (updated.length > 0 && !updated.some(f => f.isMain)) {
            updated[0].isMain = true;
        }
        return updated;
    });
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const fileDataPromises = uploadedFiles.map(async ({file, isMain}) => {
          return new Promise<AnalysisFile>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  resolve({
                      data: (reader.result as string).split(',')[1],
                      mimeType: file.type,
                      fileName: file.name,
                      isMain
                  });
              };
              reader.readAsDataURL(file);
          });
      });

      const filesToAnalyze = await Promise.all(fileDataPromises);
      const result = await analyzeDocument(filesToAnalyze, formData.documentType || 'Công văn');
      
      setAnalysisResult(result);
      setFormData(prev => ({
          ...prev,
          officialNumber: result.officialNumber || '',
          issuingBody: result.issuingBody || '',
          summary: result.summary || '',
          assignedTo: result.targetDepartment || '',
          priority: result.priority || 'Bình thường',
          deadline: result.suggestedDeadline || ''
      }));
      setActiveTab('SELECTION');
    } catch (error) {
      alert("Lỗi: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectOption = (option: DraftOption) => {
    setFormData(prev => ({ ...prev, draftContent: option.content }));
    setActiveTab('EDITOR');
  };

  const handleSubmit = () => {
    if (uploadedFiles.length === 0) return alert("Chưa có tệp tin hồ sơ.");
    const newTask: Assignment = {
      id: uuidv4(),
      documentTitle: uploadedFiles.find(f => f.isMain)?.file.name || uploadedFiles[0].file.name,
      attachments: uploadedFiles.map(f => ({ id: uuidv4(), name: f.file.name, url: URL.createObjectURL(f.file), type: f.file.type, size: f.file.size })),
      arrivalNumber: 'VB-' + Date.now().toString().slice(-4),
      arrivalDate: new Date().toISOString(),
      officialNumber: formData.officialNumber || '',
      issuingBody: formData.issuingBody || '',
      documentType: (formData.documentType || 'Công văn') as DocumentType,
      summary: formData.summary || '',
      assignedTo: formData.assignedTo || '',
      draftContent: formData.draftContent || '',
      priority: (formData.priority as any) || 'Bình thường',
      deadline: formData.deadline || '',
      createdAt: new Date().toISOString(),
      status: TaskStatus.PENDING,
    };
    onTaskCreated(newTask);
  };

  return (
    <div className="bg-white rounded-lg shadow-portal border border-gray-200 h-full flex flex-col overflow-hidden">
        {/* HEADER TAB */}
        <div className="px-6 py-4 bg-eakar-bg border-b border-gray-200 flex justify-between items-center shrink-0">
            <h2 className="text-sm font-bold text-eakar-primary flex items-center gap-2 uppercase">
                <ScaleIcon className="w-5 h-5" />
                Tiếp nhận & Tham mưu Văn bản
            </h2>
            <div className="flex bg-gray-200 p-1 rounded-md">
                {[
                    { id: 'INFO', label: '1. TIẾP NHẬN' },
                    { id: 'SELECTION', label: '2. CHIẾN LƯỢC' },
                    { id: 'EDITOR', label: '3. DỰ THẢO' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        disabled={tab.id !== 'INFO' && !analysisResult}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-1.5 text-[10px] font-bold rounded transition-all ${activeTab === tab.id ? 'bg-white text-eakar-primary shadow-sm' : 'text-gray-500 disabled:opacity-30'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 bg-white overflow-hidden relative">
            {activeTab === 'INFO' && (
                <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 text-sm">HỒ SƠ VĂN BẢN ĐẾN</h3>
                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-eakar-primary text-white rounded text-[10px] font-bold shadow-lg shadow-eakar-primary/20 transition-all flex items-center gap-2">
                                <CloudArrowUpIcon className="w-4 h-4" /> THÊM TỆP TIN
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                        </div>

                        {uploadedFiles.length === 0 ? (
                            <div onClick={() => fileInputRef.current?.click()} className="py-16 flex flex-col items-center justify-center text-gray-400 cursor-pointer">
                                <DocumentMagnifyingGlassIcon className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">Click hoặc kéo thả tệp tin vào đây</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {uploadedFiles.map((item, i) => (
                                    <div key={i} className={`flex items-center justify-between p-3 rounded border ${item.isMain ? 'bg-white border-eakar-primary shadow-sm' : 'bg-white border-gray-200'}`}>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <DocumentTextIcon className={`w-6 h-6 ${item.isMain ? 'text-eakar-primary' : 'text-gray-400'}`} />
                                            <div className="truncate">
                                                <p className="text-xs font-bold text-gray-800 truncate">{item.file.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">{item.isMain ? 'VĂN BẢN CHÍNH' : 'PHỤ LỤC / BẢNG BIỂU'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!item.isMain && <button onClick={() => setMainFile(i)} className="text-[10px] font-bold text-blue-600 hover:underline">Đặt làm chính</button>}
                                            <button onClick={() => removeFile(i)} className="p-1 text-gray-300 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-6 flex justify-center">
                                    <button onClick={handleAnalyze} disabled={isProcessing} className="px-8 py-3 bg-eakar-primary text-white rounded-md font-bold text-xs shadow-xl hover:scale-105 disabled:opacity-50 flex items-center gap-2 transition-all">
                                        {isProcessing ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                                        PHÂN TÍCH & DỰ THẢO THAM MƯU
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase border-b pb-1">Chi tiết rà soát</div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Số hiệu văn bản</label>
                            <input value={formData.officialNumber} onChange={e => setFormData({...formData, officialNumber: e.target.value})} className="w-full border-gray-200 rounded p-2 text-sm focus:ring-1 focus:ring-eakar-primary outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Cơ quan ban hành</label>
                            <input value={formData.issuingBody} onChange={e => setFormData({...formData, issuingBody: e.target.value})} className="w-full border-gray-200 rounded p-2 text-sm focus:ring-1 focus:ring-eakar-primary outline-none" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tổng hợp nội dung (Từ đa văn bản)</label>
                            <textarea rows={3} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full border-gray-200 rounded p-2 text-sm focus:ring-1 focus:ring-eakar-primary outline-none" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'SELECTION' && analysisResult && (
                <div className="h-full overflow-y-auto p-8 max-w-6xl mx-auto">
                    <h3 className="text-xl font-bold text-center text-gray-800 mb-8 uppercase tracking-wide">05 Phương án Tham mưu cho lãnh đạo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {(analysisResult.draftOptions || []).map((opt, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-eakar-primary hover:shadow-xl transition-all flex flex-col h-[500px]">
                                <div className="p-4 bg-gray-50 border-b border-gray-200">
                                    <div className="text-[10px] font-bold text-eakar-primary mb-1 uppercase tracking-tighter">PHƯƠNG ÁN {idx + 1}</div>
                                    <h4 className="text-xs font-bold text-gray-800 line-clamp-2 h-8">{opt.title}</h4>
                                </div>
                                <div className="p-4 flex-1 text-[11px] text-gray-600 italic line-clamp-[12] text-justify leading-relaxed whitespace-pre-wrap">
                                    {opt.content}
                                </div>
                                <div className="p-4">
                                    <button onClick={() => selectOption(opt)} className="w-full py-3 bg-eakar-primary text-white rounded font-bold text-[10px] uppercase shadow-md transition-all flex items-center justify-center gap-1">
                                        CHỌN PHƯƠNG ÁN <ChevronRightIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'EDITOR' && (
                <OfficialDocumentEditor 
                    initialContent={formData.draftContent || ''}
                    assignedTo={formData.assignedTo || ''}
                    docType={formData.documentType || 'Công văn'} 
                    initialAbstract={formData.summary || ''}
                    onContentChange={(val) => setFormData({...formData, draftContent: val})}
                />
            )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
            <span className="text-[10px] text-gray-400 font-bold uppercase italic">Hệ thống tham mưu UBND Xã Ea Kar - Năm 2025</span>
            <div className="flex gap-3">
                <button onClick={() => { setUploadedFiles([]); setAnalysisResult(null); setActiveTab('INFO'); }} className="px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-200 rounded transition">LÀM MỚI</button>
                <button 
                    onClick={handleSubmit} 
                    disabled={activeTab !== 'EDITOR'} 
                    className="px-8 py-2 bg-green-600 text-white font-bold rounded text-[10px] uppercase shadow-lg disabled:opacity-30 flex items-center gap-2"
                >
                    <CheckCircleIcon className="w-4 h-4" /> PHÁT HÀNH DỰ THẢO
                </button>
            </div>
        </div>
    </div>
  );
};
