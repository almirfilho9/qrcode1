/**
 * Download Manager Module
 * Gerencia downloads de QR Codes em diferentes formatos
 */
import { Utils } from './Utils.js';

class DownloadManager {
    constructor(qrGenerator) {
        this.qrGenerator = qrGenerator;
        this.errorHandler = null;
        this.supportedFormats = ['png', 'svg', 'jpeg'];
        this.defaultQuality = 0.9; // Para JPEG
    }

    /**
     * Define o manipulador de erros
     */
    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }

    /**
     * Inicializa os botões de download
     */
    initializeDownloadButtons() {
        const downloadSection = document.getElementById('download-section');
        if (downloadSection) {
            // Mostra a seção de download
            downloadSection.style.display = 'block';

            // Configura os event listeners dos botões
            this.setupDownloadListeners();
        }
    }

    /**
     * Configura os event listeners dos botões de download
     */
    setupDownloadListeners() {
        const pngBtn = document.getElementById('download-png');
        const svgBtn = document.getElementById('download-svg');
        const jpegBtn = document.getElementById('download-jpeg');

        if (pngBtn) {
            pngBtn.addEventListener('click', () => this.downloadAsPNG());
        }

        if (svgBtn) {
            svgBtn.addEventListener('click', () => this.downloadAsSVG());
        }

        if (jpegBtn) {
            jpegBtn.addEventListener('click', () => this.downloadAsJPEG());
        }
    }

    /**
     * Baixa o QR Code como PNG
     */
    async downloadAsPNG(customFilename = null, size = null) {
        try {
            const canvas = this.qrGenerator.getCanvas();
            if (!canvas) {
                throw new Error('Nenhum QR Code encontrado para download');
            }

            const filename = customFilename || this.generateFilename('png');
            
            // Se um tamanho específico foi solicitado, redimensiona o canvas
            let downloadCanvas = canvas;
            if (size && (size !== canvas.width || size !== canvas.height)) {
                downloadCanvas = this.resizeCanvas(canvas, size, size);
            }

            // Converte canvas para blob PNG
            const blob = await this.canvasToBlob(downloadCanvas, 'image/png');
            
            // Faz o download
            this.downloadBlob(blob, filename);
            
            this.showSuccessMessage(`QR Code baixado como ${filename}`);
            
        } catch (error) {
            this.handleDownloadError(error, 'PNG');
        }
    }

    /**
     * Baixa o QR Code como SVG
     */
    async downloadAsSVG(customFilename = null) {
        try {
            const currentQR = this.qrGenerator.getCurrentQRCode();
            if (!currentQR) {
                throw new Error('Nenhum QR Code encontrado para download');
            }

            const filename = customFilename || this.generateFilename('svg');
            
            // Converte o canvas atual para SVG usando uma abordagem simples
            const canvas = this.qrGenerator.getCanvas();
            if (!canvas) {
                throw new Error('Canvas não encontrado para conversão SVG');
            }

            // Cria SVG a partir do canvas
            const svgString = this.createSVGFromCanvas(canvas, currentQR.options);
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            
            // Faz o download
            this.downloadBlob(blob, filename);
            
            this.showSuccessMessage(`QR Code baixado como ${filename}`);
            
        } catch (error) {
            this.handleDownloadError(error, 'SVG');
        }
    }

    /**
     * Cria SVG a partir do canvas
     */
    createSVGFromCanvas(canvas, options) {
        const { width, height, colorDark, colorLight } = options;
        
        // Converte canvas para data URL
        const dataURL = canvas.toDataURL('image/png');
        
        // Cria SVG com a imagem embutida
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image x="0" y="0" width="${width}" height="${height}" xlink:href="${dataURL}"/>
</svg>`;
        
        return svgContent;
    }

    /**
     * Baixa o QR Code como JPEG
     */
    async downloadAsJPEG(customFilename = null, size = null, quality = null) {
        try {
            const canvas = this.qrGenerator.getCanvas();
            if (!canvas) {
                throw new Error('Nenhum QR Code encontrado para download');
            }

            const filename = customFilename || this.generateFilename('jpeg');
            const jpegQuality = quality || this.defaultQuality;
            
            // Se um tamanho específico foi solicitado, redimensiona o canvas
            let downloadCanvas = canvas;
            if (size && (size !== canvas.width || size !== canvas.height)) {
                downloadCanvas = this.resizeCanvas(canvas, size, size);
            }

            // Converte canvas para blob JPEG
            const blob = await this.canvasToBlob(downloadCanvas, 'image/jpeg', jpegQuality);
            
            // Faz o download
            this.downloadBlob(blob, filename);
            
            this.showSuccessMessage(`QR Code baixado como ${filename}`);
            
        } catch (error) {
            this.handleDownloadError(error, 'JPEG');
        }
    }

    /**
     * Gera nome de arquivo com timestamp
     */
    generateFilename(extension) {
        return Utils.generateFilename('qrcode', extension);
    }

    /**
     * Converte canvas para blob
     */
    canvasToBlob(canvas, mimeType, quality = 1.0) {
        return new Promise((resolve, reject) => {
            try {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Falha ao converter canvas para blob'));
                    }
                }, mimeType, quality);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Redimensiona canvas para um novo tamanho
     */
    resizeCanvas(originalCanvas, newWidth, newHeight) {
        const resizedCanvas = document.createElement('canvas');
        const ctx = resizedCanvas.getContext('2d');
        
        resizedCanvas.width = newWidth;
        resizedCanvas.height = newHeight;
        
        // Desenha o canvas original redimensionado
        ctx.drawImage(originalCanvas, 0, 0, newWidth, newHeight);
        
        return resizedCanvas;
    }

    /**
     * Faz o download de um blob
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Libera a URL do objeto
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * Converte formato para diferentes tamanhos e qualidades
     */
    async convertToFormat(format, options = {}) {
        const { 
            filename = null, 
            size = null, 
            quality = this.defaultQuality 
        } = options;

        switch (format.toLowerCase()) {
            case 'png':
                return await this.downloadAsPNG(filename, size);
            case 'svg':
                return await this.downloadAsSVG(filename);
            case 'jpeg':
            case 'jpg':
                return await this.downloadAsJPEG(filename, size, quality);
            default:
                throw new Error(`Formato não suportado: ${format}`);
        }
    }

    /**
     * Verifica se um formato é suportado
     */
    isFormatSupported(format) {
        return this.supportedFormats.includes(format.toLowerCase());
    }

    /**
     * Obtém informações sobre o QR Code atual
     */
    getCurrentQRInfo() {
        const currentQR = this.qrGenerator.getCurrentQRCode();
        if (!currentQR) {
            return null;
        }

        const canvas = this.qrGenerator.getCanvas();
        const fileSize = canvas ? this.estimateFileSize(canvas) : 0;

        return {
            content: currentQR.content,
            dimensions: {
                width: currentQR.options.width,
                height: currentQR.options.height
            },
            estimatedSize: fileSize,
            timestamp: currentQR.timestamp
        };
    }

    /**
     * Estima o tamanho do arquivo baseado no canvas
     */
    estimateFileSize(canvas) {
        // Estimativa aproximada baseada nas dimensões
        const pixels = canvas.width * canvas.height;
        const pngSize = pixels * 4; // 4 bytes por pixel para PNG
        const jpegSize = pixels * 0.5; // Estimativa para JPEG comprimido
        
        return {
            png: pngSize,
            jpeg: jpegSize,
            svg: 1024 // SVG é geralmente pequeno
        };
    }

    /**
     * Trata erros de download
     */
    handleDownloadError(error, format) {
        const message = `Erro ao baixar QR Code como ${format}: ${error.message}`;
        
        if (this.errorHandler) {
            this.errorHandler.handleError(error, `Download ${format}`);
        } else {
            console.error(message);
            alert(message);
        }
    }

    /**
     * Mostra mensagem de sucesso
     */
    showSuccessMessage(message) {
        // Dispara evento para o UIManager mostrar a mensagem
        const event = new CustomEvent('download:success', {
            detail: { message },
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Oculta a seção de download
     */
    hideDownloadSection() {
        const downloadSection = document.getElementById('download-section');
        if (downloadSection) {
            downloadSection.style.display = 'none';
        }
    }

    /**
     * Mostra a seção de download
     */
    showDownloadSection() {
        const downloadSection = document.getElementById('download-section');
        if (downloadSection) {
            downloadSection.style.display = 'block';
        }
    }
}

export { DownloadManager };