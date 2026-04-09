
import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardDocumentIcon, 
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  PrinterIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { refineDraft } from '../services/geminiService';

interface Props {
  initialContent: string;
  assignedTo: string;
  docType: string;
  initialAbstract?: string;
  onContentChange: (content: string) => void;
}

export const OfficialDocumentEditor: React.FC<Props> = ({ initialContent, assignedTo, docType, initialAbstract, onContentChange }) => {
  const [docNumber, setDocNumber] = useState('...   ');
  const [docSymbol, setDocSymbol] = useState('/UBND-VP'); 
  const [signerTitle, setSignerTitle] = useState('PHÓ CHỦ TỊCH');
  const [signerName, setSignerName] = useState('Nguyễn Ngọc Hòa'); 
  const [zoom, setZoom] = useState(100);
  const [content, setContent] = useState(initialContent);
  const [abstract, setAbstract] = useState(initialAbstract || ''); 
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialContent) setContent(initialContent);
    if (initialAbstract) setAbstract(initialAbstract);
  }, [initialContent, initialAbstract]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
    onContentChange(content);
  }, [content]);

  const today = new Date();
  const dateString = `Ea Kar, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

  const handleRefineWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsRefining(true);
    try {
      const refined = await refineDraft(content, aiPrompt, { docType, assignedTo });
      setContent(refined);
      setAiPrompt('');
    } catch (error) {
      alert("Lỗi: " + (error as Error).message);
    } finally {
      setIsRefining(false);
    }
  };

  const handleDownloadDoc = () => {
    const contentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Dự thảo Văn bản UBND Xã Ea Kar</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            mso-page-orientation: portrait;
            size: 21cm 29.7cm;
            margin: 2cm 1.5cm 2cm 3cm; 
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 14pt;
            line-height: 1.5;
            text-align: justify;
            color: #000;
          }
          .header-table { width: 100%; border: none; margin-bottom: 20pt; }
          .header-left { text-align: center; width: 40%; vertical-align: top; }
          .header-right { text-align: center; width: 60%; vertical-align: top; }
          .bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .italic { font-style: italic; }
          .line { border-top: 1pt solid black; width: 60pt; margin: 2pt auto; }
          .abstract { margin-top: 15pt; margin-bottom: 20pt; font-weight: bold; }
          .footer-table { width: 100%; border: none; margin-top: 40pt; }
          .footer-left { width: 45%; font-size: 11pt; vertical-align: top; font-style: italic; }
          .footer-right { width: 55%; text-align: center; vertical-align: top; }
        </style>
      </head>
      <body>
          <div class="header-table">
            <div class="header-left" style="display: inline-block; width: 40%; vertical-align: top; text-align: center;">
              <p style="margin:0; font-size: 13pt;">ỦY BAN NHÂN DÂN</p>
              <p class="bold uppercase" style="margin:0; font-size: 13pt;">XÃ EA KAR</p>
              <div class="line" style="width: 40pt; border-top: 1pt solid black; margin: 2pt auto;"></div>
              <p style="margin:0; font-size: 13pt;">Số: ${docNumber}${docSymbol}</p>
              
              <div style="margin-top: 15pt; text-align: center;">
                <p style="margin:0; font-size: 12pt; font-style: italic;">V/v ${abstract}</p>
                <div class="line" style="width: 30pt; border-top: 1pt solid black; margin: 2pt auto 0 auto;"></div>
              </div>
            </div>
            <div class="header-right" style="display: inline-block; width: 55%; vertical-align: top; text-align: center;">
              <p class="bold" style="margin:0; font-size: 12pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p class="bold" style="margin:0; font-size: 13pt;">Độc lập - Tự do - Hạnh phúc</p>
              <div class="line" style="width: 100pt; border-top: 1pt solid black; margin: 2pt auto;"></div>
              <p class="italic" style="margin:0; font-size: 14pt;">${dateString}</p>
            </div>
          </div>

          ${['Công văn', 'Giấy mời', 'Thông báo'].includes(docType) ? `<div style="text-align:center; margin-top: 30pt; margin-bottom: 25pt;"><span class="bold">Kính gửi:</span> ${assignedTo}</div>` : '<div style="margin-top: 20pt;"></div>'}

          <div style="text-align: justify; line-height: 1.5; font-size: 14pt;">
            ${content.split('\n').map(line => line.trim() ? `<p style="margin: 0 0 10pt 0; text-indent: 35pt;">${line.trim()}</p>` : '<p style="margin: 0 0 10pt 0;">&nbsp;</p>').join('')}
          </div>

          <table class="footer-table" style="width: 100%; border: none; margin-top: 40pt;">
            <tr>
              <td class="footer-left" style="width: 45%; font-size: 11pt; vertical-align: top; font-style: italic;">
                <p class="bold" style="margin:0;">Nơi nhận:</p>
                <p style="margin:0;">- Như trên;</p>
                <p style="margin:0;">- CT, các PCT UBND xã (b/c);</p>
                <p style="margin:0;">- Lưu: VT.</p>
              </td>
              <td class="footer-right" style="width: 55%; text-align: center; vertical-align: top;">
                <p class="bold uppercase" style="margin:0; font-size: 13pt;">TM. ỦY BAN NHÂN DÂN</p>
                <p class="bold uppercase" style="margin:0; font-size: 13pt;">${signerTitle}</p>
                <br/><br/><br/><br/><br/>
                <p class="bold" style="margin:0; font-size: 14pt;">${signerName}</p>
              </td>
            </tr>
          </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', contentHtml], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Tham_muu_EaKar_${Date.now()}.doc`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-xl overflow-hidden shadow-inner">
      {/* TOOLBAR */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1.5 hover:bg-white rounded transition"><MagnifyingGlassMinusIcon className="w-4 h-4 text-slate-600" /></button>
            <span className="text-xs font-bold w-12 text-center text-slate-700">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1.5 hover:bg-white rounded transition"><MagnifyingGlassPlusIcon className="w-4 h-4 text-slate-600" /></button>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <button onClick={handleDownloadDoc} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition shadow-sm">
            <ArrowDownTrayIcon className="w-4 h-4" /> Tải file (.doc) chuẩn
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-sm">
            <PrinterIcon className="w-4 h-4" /> In / PDF
          </button>
        </div>

        <div className="flex-1 max-w-xl mx-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SparklesIcon className="w-4 h-4 text-indigo-500" />
            </div>
            <input 
              type="text" 
              value={aiPrompt} 
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRefineWithAI()}
              placeholder="Gõ yêu cầu: 'Thêm mục 4 giao Văn phòng đôn đốc', 'Sửa lại căn cứ huyện'..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-32 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none shadow-sm"
            />
            <button 
              onClick={handleRefineWithAI}
              disabled={isRefining || !aiPrompt.trim()}
              className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isRefining ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : null}
              {isRefining ? 'ĐANG HIỆU CHỈNH...' : 'HIỆU CHỈNH DỰ THẢO'}
            </button>
          </div>
        </div>

        <button onClick={() => { navigator.clipboard.writeText(content); alert('Đã sao chép nội dung'); }} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition shadow-md">
          <ClipboardDocumentIcon className="w-4 h-4" /> Sao chép
        </button>
      </div>

      {/* PAPER CANVAS */}
      <div className="flex-1 overflow-y-auto p-12 bg-slate-200/50 flex flex-col items-center custom-scrollbar">
        <div 
          className="bg-white shadow-2xl transition-transform origin-top duration-300 ring-1 ring-slate-300" 
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            padding: '20mm 15mm 20mm 30mm', 
            transform: `scale(${zoom / 100})`,
            fontFamily: '"Times New Roman", Times, serif',
            color: '#000'
          }}
        >
          {/* HEADER */}
          <div className="flex justify-between items-start mb-6">
            <div className="text-center w-[40%]">
              <p className="text-[13pt] leading-tight mb-0 uppercase">ỦY BAN NHÂN DÂN</p>
              <p className="text-[13pt] leading-tight font-bold mb-1 uppercase">XÃ EA KAR</p>
              <div className="flex justify-center mb-1"><div className="border-t border-black w-[40pt]"></div></div>
              <div className="text-[13pt]">Số: <input value={docNumber} onChange={e => setDocNumber(e.target.value)} className="w-12 text-center border-none focus:ring-0 p-0" />{docSymbol}</div>
              
              {/* ABSTRACT UNDER NUMBER */}
              <div className="mt-4 flex flex-col items-center">
                <div className="flex items-start gap-1 w-full justify-center">
                  <span className="text-[12pt] italic shrink-0">V/v</span>
                  <textarea 
                    value={abstract} 
                    onChange={e => setAbstract(e.target.value)} 
                    className="w-full text-[12pt] italic leading-tight border-none focus:ring-0 p-0 resize-none overflow-hidden text-center" 
                    rows={2} 
                  />
                </div>
                <div className="border-t border-black w-[30pt] mt-1"></div>
              </div>
            </div>
            <div className="text-center w-[55%]">
              <p className="text-[12pt] font-bold leading-tight mb-0">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-[13pt] font-bold leading-tight mb-1">Độc lập - Tự do - Hạnh phúc</p>
              <div className="flex justify-center mb-2"><div className="border-t border-black w-[100pt]"></div></div>
              <p className="text-[14pt] italic">{dateString}</p>
            </div>
          </div>

          {/* RECIPIENT */}
          {['Công văn', 'Giấy mời', 'Thông báo'].includes(docType) && (
            <div className="mb-6 text-center text-[14pt] mt-10">
              <span className="font-bold">Kính gửi: </span>
              <span>{assignedTo}</span>
            </div>
          )}

          {/* CONTENT */}
          <div className="relative">
            <textarea 
              ref={textareaRef} 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              className={`w-full text-[14pt] leading-[1.5] text-justify border-none focus:ring-0 p-0 resize-none overflow-hidden bg-transparent transition-opacity duration-500 whitespace-pre-wrap ${isRefining ? 'opacity-40' : 'opacity-100'}`}
              spellCheck={false}
              disabled={isRefining}
              placeholder="Bắt đầu bằng: 'Căn cứ Công văn số... ngày... của...'"
            />
          </div>

          {/* SIGNATURE */}
          <div className="mt-16 flex justify-between">
            <div className="w-[45%] text-[11pt] italic leading-tight">
              <p className="font-bold mb-1">Nơi nhận:</p>
              <p className="m-0">- Như trên;</p>
              <p className="m-0">- CT, các PCT UBND xã (b/c);</p>
              <p className="m-0">- Lưu: VT.</p>
            </div>
            <div className="w-[50%] text-center">
              <p className="text-[13pt] font-bold uppercase mb-0">TM. ỦY BAN NHÂN DÂN</p>
              <input 
                value={signerTitle} 
                onChange={e => setSignerTitle(e.target.value)} 
                className="text-[13pt] font-bold uppercase w-full text-center border-none focus:ring-0 p-0 mb-20" 
              />
              <input 
                value={signerName} 
                onChange={e => setSignerName(e.target.value)} 
                className="text-[14pt] font-bold w-full text-center border-none focus:ring-0 p-0" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
