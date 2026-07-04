// ========== Image Processing Utilities ==========
// Convert file → base64 with auto-compression

/**
 * 将 File 压缩并转为 base64
 * @param file 图片文件
 * @param maxWidth 最大宽度(默认 1280)
 * @param maxHeight 最大高度(默认 1280)
 * @param quality 压缩质量(0-1,默认 0.8)
 * @returns Promise<string> base64 字符串
 */
export function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 计算等比缩放后的尺寸
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建 canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // 输出为 jpeg(更小)
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 估算 base64 字符串大小(KB)
 */
export function estimateBase64Size(base64: string): number {
  // base64 字符数 × 0.75 ≈ 字节数
  return Math.round((base64.length * 0.75) / 1024);
}
