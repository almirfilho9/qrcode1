/**
 * Error Handler Module
 * Centralized error handling, logging, and user feedback
 */
class ErrorHandler {
    constructor() {
        this.logLevel = 'info'; // debug, info, warn, error
        this.errorHistory = [];
        this.maxHistorySize = 50;
    }

    /**
     * Main error handling method
     */
    handleError(error, context = 'Unknown') {
        const errorInfo = {
            message: error.message || 'Unknown error',
            context,
            timestamp: new Date(),
            stack: error.stack,
            type: error.name || 'Error'
        };

        // Log the error
        this.logError(errorInfo);

        // Store in history
        this.addToHistory(errorInfo);

        // Show user-friendly message
        this.showUserError(this.getUserFriendlyMessage(error, context), 'error');

        // Dispatch error event for other modules
        this.dispatchErrorEvent(errorInfo);
    }

    /**
     * Log error to console with appropriate level
     */
    logError(errorInfo) {
        const logMessage = `[${errorInfo.context}] ${errorInfo.message}`;
        
        switch (errorInfo.type) {
            case 'ValidationError':
                console.warn('Validation Error:', logMessage);
                break;
            case 'NetworkError':
                console.error('Network Error:', logMessage);
                break;
            case 'StorageError':
                console.error('Storage Error:', logMessage);
                break;
            default:
                console.error('Error:', logMessage, errorInfo.stack);
        }
    }

    /**
     * Show user-friendly error message
     */
    showUserError(message, type = 'error') {
        // Dispatch event for UI to handle
        const event = new CustomEvent('error:display', {
            detail: { message, type },
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Convert technical errors to user-friendly messages
     */
    getUserFriendlyMessage(error, context) {
        const message = error.message?.toLowerCase() || '';
        
        // QR Generation errors
        if (context.includes('QR') || context.includes('Generation')) {
            if (message.includes('content') || message.includes('text')) {
                return 'Erro no conteúdo do QR Code. Verifique se o texto está correto.';
            }
            if (message.includes('size') || message.includes('length')) {
                return 'Conteúdo muito longo para gerar QR Code. Tente um texto menor.';
            }
            return 'Erro ao gerar QR Code. Tente novamente.';
        }

        // Storage errors
        if (context.includes('Storage') || context.includes('History')) {
            if (message.includes('quota') || message.includes('storage')) {
                return 'Espaço de armazenamento insuficiente. Limpe o histórico.';
            }
            return 'Erro ao salvar dados. Verifique se o armazenamento está disponível.';
        }

        // Download errors
        if (context.includes('Download')) {
            return 'Erro ao fazer download. Tente novamente.';
        }

        // Network errors
        if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
            return 'Erro de conexão. Verifique sua internet e tente novamente.';
        }

        // Validation errors
        if (context.includes('Validation') || message.includes('invalid')) {
            return 'Dados inválidos. Verifique as informações inseridas.';
        }

        // Generic fallback
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }

    /**
     * Validate input with custom rules
     */
    validateInput(input, rules) {
        const errors = [];

        if (rules.required && (!input || input.trim().length === 0)) {
            errors.push('Este campo é obrigatório');
        }

        if (rules.minLength && input && input.length < rules.minLength) {
            errors.push(`Mínimo ${rules.minLength} caracteres`);
        }

        if (rules.maxLength && input && input.length > rules.maxLength) {
            errors.push(`Máximo ${rules.maxLength} caracteres`);
        }

        if (rules.email && input && !this.isValidEmail(input)) {
            errors.push('Email inválido');
        }

        if (rules.url && input && !this.isValidURL(input)) {
            errors.push('URL inválida');
        }

        if (rules.phone && input && !this.isValidPhone(input)) {
            errors.push('Telefone inválido');
        }

        if (rules.custom && typeof rules.custom === 'function') {
            const customError = rules.custom(input);
            if (customError) {
                errors.push(customError);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Email validation
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * URL validation
     */
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            try {
                new URL('http://' + url);
                return true;
            } catch {
                return false;
            }
        }
    }

    /**
     * Phone validation
     */
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    /**
     * Add error to history
     */
    addToHistory(errorInfo) {
        this.errorHistory.unshift(errorInfo);
        
        // Keep history size manageable
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
        }
    }

    /**
     * Get error history
     */
    getErrorHistory() {
        return [...this.errorHistory];
    }

    /**
     * Clear error history
     */
    clearErrorHistory() {
        this.errorHistory = [];
    }

    /**
     * Dispatch error event for other modules
     */
    dispatchErrorEvent(errorInfo) {
        const event = new CustomEvent('error:occurred', {
            detail: errorInfo,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Set log level
     */
    setLogLevel(level) {
        const validLevels = ['debug', 'info', 'warn', 'error'];
        if (validLevels.includes(level)) {
            this.logLevel = level;
        }
    }

    /**
     * Create validation error
     */
    createValidationError(message, field = null) {
        const error = new Error(message);
        error.name = 'ValidationError';
        error.field = field;
        return error;
    }

    /**
     * Create network error
     */
    createNetworkError(message) {
        const error = new Error(message);
        error.name = 'NetworkError';
        return error;
    }

    /**
     * Create storage error
     */
    createStorageError(message) {
        const error = new Error(message);
        error.name = 'StorageError';
        return error;
    }
}

export { ErrorHandler };