
export enum TaskStatus {
  PENDING = 'Chưa xử lý',
  IN_PROGRESS = 'Đang thực hiện',
  COMPLETED = 'Đã hoàn thành',
  OVERDUE = 'Quá hạn'
}

export type DocumentType = 'Công văn' | 'Kế hoạch' | 'Báo cáo' | 'Thông báo' | 'Tờ trình' | 'Quyết định' | 'Giấy mời';

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Assignment {
  id: string;
  arrivalNumber: string;
  arrivalDate: string;
  officialNumber: string;
  issuingBody: string;
  documentType: DocumentType;
  documentTitle: string;
  attachments: Attachment[];
  summary: string;
  assignedTo: string;
  draftContent: string;
  priority: 'Bình thường' | 'Khẩn' | 'Hỏa tốc';
  deadline: string;
  createdAt: string;
  completedDate?: string; 
  status: TaskStatus;
  explanation?: string;
  evidenceLink?: string;
}

export interface DraftOption {
  title: string;
  content: string;
  description: string;
  tag: string;
}

export interface GeminiAnalysisResult {
  officialNumber: string;
  issuingBody: string;
  summary: string;
  targetDepartment: string;
  draftOptions: DraftOption[]; // Trả về 5 phương án
  priority: 'Bình thường' | 'Khẩn' | 'Hỏa tốc';
  suggestedDeadline: string; 
  documentType: DocumentType;
}

export interface AnalysisFile {
  data: string;
  mimeType: string;
  fileName: string;
  isMain: boolean;
}
