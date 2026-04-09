
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, DEPARTMENTS } from '../constants';
import { GeminiAnalysisResult, AnalysisFile } from '../types';

const getGeminiClient = () => {
  // Ưu tiên lấy từ biến môi trường (được cấu hình lúc build trên Netlify/Vercel)
  // Sau đó mới lấy từ window (do người dùng nhập trong Settings và lưu vào localStorage)
  const apiKey = 
    (typeof process !== 'undefined' ? (process.env.GEMINI_API_KEY || process.env.API_KEY) : null) || 
    (window as any).GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key chưa được cấu hình. Vui lòng vào phần Cài đặt hoặc cấu hình biến môi trường GEMINI_API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeDocument = async (
  files: AnalysisFile[],
  docTypeInput: string 
): Promise<GeminiAnalysisResult> => {
  try {
    const ai = getGeminiClient();
    const departmentContext = DEPARTMENTS.map(d => `- ${d.name}: ${d.description}`).join('\n');

    const mainFile = files.find(f => f.isMain) || files[0];
    const otherFiles = files.filter(f => f !== mainFile);

    const parts = [
      ...files.map(f => ({
        inlineData: { mimeType: f.mimeType, data: f.data }
      })),
      { text: `HỆ THỐNG TRỢ LÝ THƯ KÝ UBND XÃ EA KAR - PHÂN TÍCH VÀ THAM MƯU CHUYÊN SÂU
        
        Tệp tin tiếp nhận:
        - Văn bản chính: ${mainFile.fileName}
        - Phụ lục dữ liệu: ${otherFiles.map(f => f.fileName).join(', ') || 'Không có'}
        
        NHIỆM VỤ CỐT LÕI:
        1. Trích xuất chính xác: Số hiệu, Ngày, Cơ quan ban hành, Trích yếu của văn bản gốc.
        2. CHIẾN LƯỢC PHÂN TÍCH "SÁT - ĐỦ - CHUYÊN NGHIỆP": 
           - Tìm chính xác các mục giao nhiệm vụ cho "UBND các xã, phường, thị trấn" hoặc "UBND các địa phương" trong văn bản gốc. 
           - Triển khai nội dung chi tiết, không viết quá ngắn. Phải có đầy đủ các phần: Căn cứ pháp lý, Lý do/Sự cần thiết, Nội dung chi tiết (nhiệm vụ, chỉ tiêu, mốc thời gian), và Tổ chức thực hiện.
        3. Phân công chủ trì dựa trên chức năng nhiệm vụ: Chuyển hóa các nhiệm vụ của "UBND xã" thành nhiệm vụ cụ thể cho 5 đơn vị chuyên môn tại xã Ea Kar:
        ${departmentContext}
        4. TRA CỨU PHÁP LÝ: Sử dụng Google Search để tìm các văn bản quy phạm pháp luật liên quan (Luật, Nghị định, Thông tư, Quyết định của Tỉnh Đắk Lắk) để làm căn cứ pháp lý vững chắc.

        YÊU CẦU DỰ THẢO (Trường 'content' trong JSON):
        Phải trình bày văn bản tham mưu theo đúng Nghị định 30/2020/NĐ-CP. 
        
        CẤU TRÚC BẮT BUỘC CHO PHẦN NỘI DUNG:
        - Đoạn 1 (Căn cứ): "Căn cứ...; Xét đề nghị của...;" (Trích dẫn đúng số hiệu văn bản vừa đọc).
        - Đoạn 2 (Lý do/Mục đích): "Để triển khai thực hiện kịp thời, hiệu quả nội dung chỉ đạo tại [Tên văn bản gốc], Chủ tịch UBND xã có ý kiến chỉ đạo như sau:"
        - Các đoạn tiếp theo (Nội dung chỉ đạo): Chia thành các mục 1, 2, 3... 
          + Mỗi mục bắt đầu bằng: "Giao [Tên đơn vị] chủ trì, phối hợp với... thực hiện: [Nội dung cụ thể trích từ văn bản gốc]".
          + Các ý nhỏ trong mục dùng a, b, c... hoặc gạch đầu dòng.
        - Đoạn cuối (Tổ chức thực hiện): "Giao Văn phòng HĐND và UBND xã theo dõi, đôn đốc và tổng hợp báo cáo kết quả thực hiện cho Chủ tịch UBND xã theo quy định."

        QUY TẮC THỂ THỨC NGHIÊM NGẶT:
        1. TUYỆT ĐỐI KHÔNG tạo: Quốc hiệu, Tiêu ngữ, Tên cơ quan, Số/Ký hiệu, Ngày tháng, Trích yếu, Kính gửi, Nơi nhận, Chữ ký. Hệ thống đã có sẵn các phần này.
        2. CHỈ SOẠN THẢO PHẦN NỘI DUNG CHÍNH (BODY).
        3. LÙI ĐẦU DÒNG: Mỗi đoạn văn mới PHẢI bắt đầu bằng 5 khoảng trắng (space).
        4. XUỐNG DÒNG: Sử dụng \n để xuống dòng. Giữa các mục lớn (1, 2, 3) PHẢI có một dòng trống (\n\n).
        5. KHÔNG dùng thẻ HTML (<br>, <b>, <i>...).
        6. Văn phong: Trang trọng, đanh thép, rõ ràng, ngắn gọn nhưng đầy đủ ý của cấp trên.

        Trả về JSON:
        {
          "officialNumber": "...",
          "issuingBody": "...",
          "summary": "...",
          "targetDepartment": "Chọn 1 trong 5 tên đơn vị đã cho",
          "suggestedDeadline": "YYYY-MM-DD",
          "priority": "Khẩn/Bình thường/Hỏa tốc",
          "documentType": "${docTypeInput}",
          "draftOptions": [
            { "tag": "Công văn", "title": "Công văn chỉ đạo thực hiện", "description": "Dự thảo Công văn chỉ đạo các bộ phận chuyên môn triển khai thực hiện", "content": "..." },
            { "tag": "Báo cáo", "title": "Báo cáo kết quả", "description": "Dự thảo Báo cáo kết quả thực hiện gửi cấp trên", "content": "..." },
            { "tag": "Kế hoạch", "title": "Kế hoạch triển khai", "description": "Dự thảo Kế hoạch chi tiết để triển khai văn bản của cấp trên", "content": "..." },
            { "tag": "Thông báo", "title": "Thông báo nội bộ/nhân dân", "description": "Dự thảo Thông báo để phổ biến thông tin rộng rãi", "content": "..." },
            { "tag": "Tờ trình", "title": "Tờ trình xin ý kiến", "description": "Dự thảo Tờ trình xin ý kiến chỉ đạo của Đảng ủy hoặc cấp trên", "content": "..." }
          ]
        }`}
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            officialNumber: { type: Type.STRING },
            issuingBody: { type: Type.STRING },
            summary: { type: Type.STRING },
            targetDepartment: { type: Type.STRING },
            suggestedDeadline: { type: Type.STRING },
            priority: { type: Type.STRING },
            documentType: { type: Type.STRING },
            draftOptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tag: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["tag", "title", "description", "content"]
              }
            }
          },
          required: ["officialNumber", "issuingBody", "summary", "targetDepartment", "suggestedDeadline", "priority", "documentType", "draftOptions"]
        },
        tools: [{ googleSearch: {} }]
      }
    });

    const responseText = response.text || "{}";
    const jsonString = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonString) as GeminiAnalysisResult;
    
    const cleanContent = (text: string) => {
      if (!text) return "";
      return text
        .replace(/\\n/g, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        // Remove common header patterns if AI generated them despite instructions
        .replace(/CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM/gi, '')
        .replace(/Độc lập - Tự do - Hạnh phúc/gi, '')
        .replace(/ỦY BAN NHÂN DÂN XÃ EA KAR/gi, '')
        .replace(/Số:.*\/UBND-VP/gi, '')
        .replace(/Ea Kar, ngày.*tháng.*năm.*/gi, '')
        .replace(/V\/v:?.*/gi, '')
        .replace(/Kính gửi:?.*/gi, '')
        .replace(/TM\. ỦY BAN NHÂN DÂN.*/gi, '')
        .replace(/PHÓ CHỦ TỊCH.*/gi, '')
        .replace(/CHỦ TỊCH.*/gi, '')
        .replace(/Nguyễn Ngọc Hòa/gi, '')
        .replace(/^[\r\n]+/, '') // Remove leading newlines only
        .trimEnd(); // Keep leading spaces for indentation
    };

    if (parsed.summary) {
      parsed.summary = cleanContent(parsed.summary);
    }
    if (parsed.draftOptions) {
      parsed.draftOptions = parsed.draftOptions.map(opt => ({
        ...opt,
        content: cleanContent(opt.content)
      }));
    }
    
    return parsed;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const refineDraft = async (
  currentContent: string,
  userPrompt: string,
  context: { docType: string, assignedTo: string }
): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const prompt = `Dự thảo hiện tại: "${currentContent}"
      Yêu cầu sửa đổi: "${userPrompt}"
      Thể loại: ${context.docType}
      Đơn vị: ${context.assignedTo}

      Hãy đóng vai Thư ký UBND xã Ea Kar, sửa lại dự thảo sao cho chuyên nghiệp, đanh thép, đúng thể thức Nghị định 30.
      YÊU CẦU NGHIÊM NGẶT:
      1. ĐỦ NỘI DUNG: Triển khai chi tiết các ý, không viết quá ngắn. Phải bám sát cấu trúc của loại văn bản (Tờ trình, Giấy mời, Công văn) như đã được hướng dẫn.
      2. THỂ THỨC: Mỗi đoạn văn mới PHẢI lùi đầu dòng đúng 5 khoảng trắng.
      3. KHÔNG tạo phần tiêu đề Quốc hiệu, Tiêu ngữ, Tên cơ quan, Số, Ngày tháng năm, Trích yếu, Kính gửi, Nơi nhận, Chữ ký. CHỈ trả về phần nội dung chính (Body).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      }
    });

    const cleanContent = (text: string) => {
      if (!text) return "";
      return text
        .replace(/\\n/g, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM/gi, '')
        .replace(/Độc lập - Tự do - Hạnh phúc/gi, '')
        .replace(/ỦY BAN NHÂN DÂN XÃ EA KAR/gi, '')
        .replace(/Số:.*\/UBND-VP/gi, '')
        .replace(/Ea Kar, ngày.*tháng.*năm.*/gi, '')
        .replace(/V\/v:?.*/gi, '')
        .replace(/Kính gửi:?.*/gi, '')
        .replace(/TM\. ỦY BAN NHÂN DÂN.*/gi, '')
        .replace(/PHÓ CHỦ TỊCH.*/gi, '')
        .replace(/CHỦ TỊCH.*/gi, '')
        .replace(/Nguyễn Ngọc Hòa/gi, '')
        .replace(/^[\r\n]+/, '') // Remove leading newlines only
        .trimEnd(); // Keep leading spaces for indentation
    };

    return cleanContent(response.text);
  } catch (error) {
    console.error("Refine Error:", error);
    throw error;
  }
};
