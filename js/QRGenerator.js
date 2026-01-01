/**
 * QR Code Generator Core Module
 * Handles QR code generation using QRCode.js library
 */
import { Utils } from './Utils.js';

class QRGenerator {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.errorHandler = null;
        this.currentQRCode = null;
        
        // Check if QRCode library is available
        if (typeof QRCode === 'undefined') {
            throw new Error('QRCode library not loaded');
        }
        
        // Default options
        this.defaultOptions = {
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        };
        
        this.options = { ...this.defaultOptions, ...options };
        
        if (!this.container) {
            throw new Error(`QR container with ID '${containerId}' not found`);
        }
    }

    /**
     * Set error handler for this module
     */
    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }

    /**
     * Generate QR Code with given content and customization
     */
    async generate(content, customization = {}) {
        try {
            // Validate content
            if (!this.validateContent(content)) {
                throw new Error('Invalid content provided');
            }

            // Clear existing QR code
            this.clear();

            // Merge customization with default options
            const qrOptions = { ...this.options, ...customization };

            // Show loading state
            this.showLoadingState();

            // Generate QR code
            await this.createQRCode(content, qrOptions);

            // Store current QR data
            this.currentQRCode = {
                content,
                options: qrOptions,
                timestamp: new Date(),
                id: Utils.generateId()
            };

            // Dispatch generation complete event
            this.dispatchQREvent('generated', this.currentQRCode);

        } catch (error) {
            this.showErrorState();
            if (this.errorHandler) {
                this.errorHandler.handleError(error, 'QR Generation');
            } else {
                console.error('QR Generation Error:', error);
            }
            throw error;
        }
    }

    /**
     * Create QR Code using QRCode.js library
     */
    async createQRCode(content, options) {
        return new Promise((resolve, reject) => {
            try {
                // Create new QRCode instance
                const qrCode = new QRCode(this.container, {
                    text: content,
                    width: options.width,
                    height: options.height,
                    colorDark: options.colorDark,
                    colorLight: options.colorLight,
                    correctLevel: options.correctLevel
                });

                // QRCode.js doesn't provide a callback, so we use a timeout
                setTimeout(() => {
                    if (this.container.querySelector('canvas') || this.container.querySelector('img')) {
                        resolve(qrCode);
                    } else {
                        reject(new Error('Failed to generate QR code'));
                    }
                }, 100);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Validate content before generation
     */
    validateContent(content, type = 'text') {
        if (!content || typeof content !== 'string') {
            return false;
        }

        // Trim whitespace
        content = content.trim();
        
        if (content.length === 0) {
            return false;
        }

        // Check content length limits (QR codes have capacity limits)
        const maxLength = this.getMaxLengthForLevel(this.options.correctLevel);
        if (content.length > maxLength) {
            if (this.errorHandler) {
                this.errorHandler.showUserError(
                    `Conteúdo muito longo. Máximo ${maxLength} caracteres para este nível de correção.`,
                    'warning'
                );
            }
            return false;
        }

        return true;
    }

    /**
     * Get maximum content length based on error correction level
     */
    getMaxLengthForLevel(level) {
        const limits = {
            [QRCode.CorrectLevel.L]: 2953, // Low
            [QRCode.CorrectLevel.M]: 2331, // Medium
            [QRCode.CorrectLevel.Q]: 1663, // Quartile
            [QRCode.CorrectLevel.H]: 1273  // High
        };
        return limits[level] || 2000;
    }

    /**
     * Clear the QR code container
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '<h5 class="msg">Aguardando o conteúdo...</h5>';
        }
        this.currentQRCode = null;
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        if (this.container) {
            this.container.innerHTML = '<div class="loading">Gerando QR Code...</div>';
        }
    }

    /**
     * Show error state
     */
    showErrorState() {
        if (this.container) {
            this.container.innerHTML = '<div class="error">Erro ao gerar QR Code</div>';
        }
    }

    /**
     * Get current QR code data
     */
    getCurrentQRCode() {
        return this.currentQRCode;
    }

    /**
     * Update QR code options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * Get QR code as canvas element
     */
    getCanvas() {
        return this.container?.querySelector('canvas');
    }

    /**
     * Get QR code as image element
     */
    getImage() {
        return this.container?.querySelector('img');
    }

    /**
     * Dispatch QR-related events
     */
    dispatchQREvent(eventType, data) {
        const event = new CustomEvent(`qr:${eventType}`, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Regenerate current QR code with new options
     */
    async regenerate(newOptions = {}) {
        if (!this.currentQRCode) {
            throw new Error('No QR code to regenerate');
        }

        const updatedOptions = { ...this.currentQRCode.options, ...newOptions };
        await this.generate(this.currentQRCode.content, updatedOptions);
    }
}

export { QRGenerator };