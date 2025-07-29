class PaperDigestGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.setDefaultValues();
    }

    initializeElements() {
        this.backgroundSelect = document.getElementById('background-select');
        this.fontSelect = document.getElementById('font-select');
        this.dateSelect = document.getElementById('date-select');
        this.digestContent = document.getElementById('digest-content');
        this.sourceInput = document.getElementById('source');
        this.authorInput = document.getElementById('author');
        this.generateBtn = document.getElementById('generate-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.copyBtn = document.getElementById('copy-btn');
        this.paperPreview = document.getElementById('paper-preview');
        this.digestTitle = document.querySelector('.digest-title');
        this.digestDate = document.querySelector('.digest-date');
        this.digestText = document.querySelector('.digest-text');
        this.sourceDiv = document.querySelector('.source');
        this.authorDiv = document.querySelector('.author');
    }

    bindEvents() {
        this.backgroundSelect.addEventListener('change', () => this.changeBackground());
        this.fontSelect.addEventListener('change', () => this.changeFont());
        this.dateSelect.addEventListener('change', () => this.updateDate());
        this.generateBtn.addEventListener('click', () => this.generateDigest());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.copyBtn.addEventListener('click', () => this.copyContent());
        
        // 实时预览
        this.digestContent.addEventListener('input', () => this.updatePreview());
        this.sourceInput.addEventListener('input', () => this.updatePreview());
        this.authorInput.addEventListener('input', () => this.updatePreview());
    }

    setDefaultValues() {
        this.digestContent.value = '人生如茶，需要慢慢品味。在忙碌的生活中，我们常常忘记停下脚步，感受生活的美好。真正的智慧不在于知道多少，而在于懂得如何生活。';
        this.sourceInput.value = '《生活的艺术》';
        this.authorInput.value = '莫奈黄';
        
        // 设置默认日期为今天
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.dateSelect.value = `${year}-${month}-${day}`;
        
        this.updateDate();
        this.updatePreview();
    }

    changeBackground() {
        const selectedBg = this.backgroundSelect.value;
        this.paperPreview.className = `paper-container ${selectedBg}`;
    }

    updateDate() {
        const selectedDate = this.dateSelect.value;
        if (selectedDate) {
            const date = new Date(selectedDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}年${month}月${day}日`;
            this.digestDate.textContent = dateStr;
        } else {
            // 如果没有选择日期，使用当前日期
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const dateStr = `${year}年${month}月${day}日`;
            this.digestDate.textContent = dateStr;
        }
    }

    changeFont() {
        const selectedFont = this.fontSelect.value;
        const fontClass = `font-${selectedFont}`;
        
        // 移除所有字体类
        this.digestTitle.classList.remove('font-serif', 'font-mashan', 'font-kuaile');
        this.digestDate.classList.remove('font-serif', 'font-mashan', 'font-kuaile');
        this.digestText.classList.remove('font-serif', 'font-mashan', 'font-kuaile');
        this.sourceDiv.classList.remove('font-serif', 'font-mashan', 'font-kuaile');
        this.authorDiv.classList.remove('font-serif', 'font-mashan', 'font-kuaile');
        
        // 添加新字体类
        this.digestTitle.classList.add(fontClass);
        this.digestDate.classList.add(fontClass);
        this.digestText.classList.add(fontClass);
        this.sourceDiv.classList.add(fontClass);
        this.authorDiv.classList.add(fontClass);
    }

    updatePreview() {
        const content = this.digestContent.value || '请输入文摘内容...';
        const source = this.sourceInput.value || '请输入出处';
        const author = this.authorInput.value || '请输入视频号作者';
        
        this.digestText.textContent = content;
        this.sourceDiv.textContent = `——${source}`;
        this.authorDiv.textContent = `@${author}`;
    }

    generateDigest() {
        if (!this.digestContent.value.trim()) {
            alert('请输入文摘内容！');
            return;
        }
        
        if (!this.sourceInput.value.trim()) {
            alert('请输入出处！');
            return;
        }
        
        if (!this.authorInput.value.trim()) {
            alert('请输入视频号作者！');
            return;
        }
        
        this.updatePreview();
        
        // 添加生成动画效果
        this.paperPreview.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.paperPreview.style.transform = 'scale(1)';
        }, 300);
        
        // 显示成功提示
        this.showNotification('文摘生成成功！', 'success');
    }

    async downloadImage() {
        try {
            // 使用html2canvas库来截图
            if (typeof html2canvas === 'undefined') {
                // 如果没有html2canvas，使用简单的方法
                this.showNotification('正在准备下载功能...', 'info');
                this.loadHtml2Canvas();
                return;
            }
            
            const canvas = await html2canvas(this.paperPreview, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            
            const dataURL = canvas.toDataURL('image/png');
            const fileName = `文摘_${new Date().getTime()}.png`;
            
            // 检测是否在pywebview环境中
            if (window.pywebview && window.pywebview.api) {
                try {
                    // 使用pywebview API保存文件
                    const base64Data = dataURL.split(',')[1];
                    const result = await window.pywebview.api.save_file(fileName, base64Data);
                    this.showNotification(result, 'success');
                } catch (pywebviewError) {
                    console.error('pywebview保存失败:', pywebviewError);
                    // 回退到传统下载方式
                    this.fallbackDownload(dataURL, fileName);
                }
            } else {
                // 浏览器环境，使用传统下载方式
                this.fallbackDownload(dataURL, fileName);
            }
        } catch (error) {
            console.error('下载失败:', error);
            this.showNotification('下载失败，请重试', 'error');
        }
    }
    
    fallbackDownload(dataURL, fileName) {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showNotification('图片下载成功！', 'success');
    }

    loadHtml2Canvas() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => {
            this.showNotification('下载功能已准备就绪，请再次点击下载按钮', 'success');
        };
        script.onerror = () => {
            this.showNotification('下载功能加载失败，请检查网络连接', 'error');
        };
        document.head.appendChild(script);
    }

    copyContent() {
        const content = `${this.digestContent.value}\n\n出处: ${this.sourceInput.value}\n@视频号作者: ${this.authorInput.value}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(content).then(() => {
                this.showNotification('内容已复制到剪贴板！', 'success');
            }).catch(() => {
                this.fallbackCopyTextToClipboard(content);
            });
        } else {
            this.fallbackCopyTextToClipboard(content);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('内容已复制到剪贴板！', 'success');
        } catch (err) {
            this.showNotification('复制失败，请手动复制', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // 设置背景色
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                notification.style.backgroundColor = '#f44336';
                break;
            case 'info':
            default:
                notification.style.backgroundColor = '#2196F3';
                break;
        }
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new PaperDigestGenerator();
});

// 添加一些实用的工具函数
const Utils = {
    // 格式化日期
    formatDate(date = new Date()) {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },
    
    // 生成随机ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// 导出到全局作用域（如果需要）
window.PaperDigestGenerator = PaperDigestGenerator;
window.Utils = Utils;