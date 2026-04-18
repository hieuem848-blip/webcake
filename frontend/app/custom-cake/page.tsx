"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface CakeFile {
  id: number;
  file: File;
  preview: string;
  name: string;
}

export default function CustomCakePage() {
  const [files, setFiles] = useState<CakeFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // MỚI: State lưu kết quả trả về từ AI
  const [aiResult, setAiResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addFiles = useCallback((newFiles: File[]) => {
    const valid: CakeFile[] = [];
    newFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) {
        showToast(`Ảnh "${file.name}" vượt 10MB`);
        return;
      }
      valid.push({
        id: idRef.current++,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    });
    setFiles((prev) => [...prev, ...valid]);
    // Reset kết quả AI cũ khi chọn ảnh mới
    setAiResult(null);
  }, []);

  const removeFile = (id: number) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
    setAiResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles([...e.dataTransfer.files]);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      showToast("Vui lòng upload ít nhất 1 ảnh để AI phân tích");
      return;
    }

    setIsLoading(true);
    setAiResult(null);

    showToast("Đang upload ảnh lên server...");

    try {
      // TẠO FORMDATA
      const formData = new FormData();

      formData.append("file", files[0].file);

      // LẤY TOKEN
      const token = localStorage.getItem("accessToken");

      console.log("Token:", token);

      const response = await fetch("http://localhost:5001/api/orders/ai", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();

        console.log("Response lỗi:", text);

        throw new Error(`Server lỗi: ${response.status}`);
      }

      const data = await response.json();

      console.log("Server trả về:", data);

      setAiResult(data);

      showToast("Upload thành công!");
    } catch (error: any) {
      console.error(error);

      showToast(`Lỗi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
<div className="min-h-screen bg-gray-100 pb-10">
      <section className="relative w-full h-[300px]">
        <Image
          src="/cakebg.png"
          alt="AI Cake Detection"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <p className="text-xs tracking-[0.3em] mb-3 uppercase">
            Witchy Bakery AI
          </p>
          <h1 className="text-4xl font-bold">Đặt Bánh Bằng AI</h1>
          <p className="mt-2 text-sm opacity-80">
            Chụp ảnh mẫu bánh bạn thích, AI sẽ lo phần còn lại
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div
          onClick={() => !isLoading && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition 
          ${dragOver ? "border-pink-500 bg-pink-50" : "border-gray-300"} 
          ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-pink-400"}`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              addFiles([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
            disabled={isLoading}
          />
          <p className="text-3xl mb-2">📸</p>
          <p className="text-lg font-semibold text-gray-700">
            Tải ảnh mẫu bánh lên
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Kéo thả hoặc nhấn để chọn ảnh cho AI phân tích
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="relative rounded-lg overflow-hidden border group"
                >
                  <img
                    src={f.preview}
                    className="w-full h-40 object-cover"
                    alt="preview"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(f.id);
                    }}
                    className="absolute top-2 right-2 bg-black/70 text-white w-6 h-6 rounded-full hover:bg-red-500 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
</div>
        )}

        <div className="mt-10">
          <button
            onClick={handleSubmit}
            disabled={isLoading || files.length === 0}
            className={`w-full py-4 rounded-lg font-bold text-lg transition shadow-lg
              ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-pink-600 text-white hover:bg-pink-700 active:scale-[0.98]"}`}
          >
            {isLoading ? "AI đang phân tích..." : "Gửi ảnh cho AI"}
          </button>
        </div>

        {/* --- KHU VỰC MỚI: HIỂN THỊ KẾT QUẢ TỪ AI --- */}
        {aiResult && (
          <div className="mt-8 p-6 bg-pink-50 rounded-xl border border-pink-200">
            <h3 className="text-xl font-bold text-pink-800 mb-4 flex items-center gap-2">
              ✨ Kết quả từ AI
            </h3>

            {/* Tùy thuộc vào cấu trúc JSON trả về của AI, bạn sửa đoạn này. 
                Giả sử AI trả về: { "loai_banh": "Bánh kem socola", "topping": ["dâu", "nến"] } */}
            <div className="space-y-3">
              <p className="text-gray-700">
                <strong>Dữ liệu thô (JSON):</strong>
              </p>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(aiResult, null, 2)}
              </pre>
            </div>

            {/* Nút giả lập để xác nhận đặt hàng sau khi xem kết quả */}
            <button className="mt-6 w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
              Xác nhận Đặt Hàng với thông tin này
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm shadow-2xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}