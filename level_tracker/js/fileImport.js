/**
 * fileImport.js
 * Chịu trách nhiệm quản lý việc kéo-thả (Drag & Drop), chọn file (File Input),
 * đọc nội dung file JSON và gọi parser để nạp dữ liệu Level.
 */

import { parseLevelData } from './jsonParser.js';

export class FileImporter {
  /**
   * @param {object} elements - { dropZoneEl, fileInputEl, btnSampleEl, btnClearEl }
   * @param {object} callbacks - { onFilesProcessed, onClearAll }
   */
  constructor(elements, callbacks = {}) {
    this.dropZone = elements.dropZoneEl;
    this.fileInput = elements.fileInputEl;
    this.btnSample = elements.btnSampleEl;
    this.btnClear = elements.btnClearEl;
    this.callbacks = callbacks;

    this.initEvents();
  }

  initEvents() {
    // 1. File input change
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
          this.processFiles(files);
          this.fileInput.value = ''; // Reset để có thể chọn lại cùng file
        }
      });
    }

    // 2. Drag & Drop events
    if (this.dropZone) {
      ['dragenter', 'dragover'].forEach((eventName) => {
        this.dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropZone.classList.add('drag-active');
        });
      });

      ['dragleave', 'drop'].forEach((eventName) => {
        this.dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropZone.classList.remove('drag-active');
        });
      });

      this.dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files || []).filter((f) => f.name.endsWith('.json'));
        if (files.length > 0) {
          this.processFiles(files);
        } else if (dt.files.length > 0) {
          alert('Vui lòng chỉ kéo thả các file có định dạng .json');
        }
      });

      // Click vào dropzone để mở file chooser
      this.dropZone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && this.fileInput) {
          this.fileInput.click();
        }
      });
    }

    // 3. Clear button
    if (this.btnClear) {
      this.btnClear.addEventListener('click', () => {
        if (this.callbacks.onClearAll) {
          this.callbacks.onClearAll();
        }
      });
    }
  }

  /**
   * Xử lý đọc danh sách File đối tượng File của trình duyệt
   * @param {Array<File>} files 
   */
  async processFiles(files) {
    const parsedLevels = [];

    for (const file of files) {
      try {
        const text = await this.readFileAsText(file);
        const parsed = parseLevelData(text, file.name);
        parsedLevels.push(parsed);
      } catch (err) {
        parsedLevels.push({
          isError: true,
          fileName: file.name,
          level: file.name,
          errorMessage: `Lỗi đọc file: ${err.message}`,
        });
      }
    }

    if (this.callbacks.onFilesProcessed) {
      this.callbacks.onFilesProcessed(parsedLevels);
    }
  }

  /**
   * Đọc file dạng Text Promise
   */
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Không thể đọc file.'));
      reader.readAsText(file);
    });
  }
}
