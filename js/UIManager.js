/**
 * UI Manager Module
 * Handles user interface management, tabs, loading states, and user feedback
 */
class UIManager {
    constructor() {
        this.errorHandler = null;
        this.activeTab = 'generator';
        this.initialized = false;
        this.loadingElement = null;
    }

    /**
     * Set error handler for this module
     */
    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }

    /**
     * Initialize UI Manager
     */
    async init() {
        try {
            this.createLoadingElement();
            this.setupMessageContainer();
            this.initialized = true;
            console.log('UIManager initialized successfully');
        } catch (error) {
            console.error('UIManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create loading element for showing loading states
     */
    createLoadingElement() {
        // Create loading overlay if it doesn't exist
        if (!document.getElementById('loading-overlay')) {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.className = 'loading-overlay hidden';
            loadingOverlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Processando...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
            this.loadingElement = loadingOverlay;
        }
    }

    /**
     * Setup message container for notifications
     */
    setupMessageContainer() {
        if (!document.getElementById('message-container')) {
            const messageContainer = document.createElement('div');
            messageContainer.id = 'message-container';
            messageContainer.className = 'message-container';
            document.body.appendChild(messageContainer);
        }
    }

    /**
     * Show/hide loading state
     */
    showLoading(show = true) {
        if (this.loadingElement) {
            if (show) {
                this.loadingElement.classList.remove('hidden');
            } else {
                this.loadingElement.classList.add('hidden');
            }
        }
    }

    /**
     * Show error message to user
     */
    showError(message, type = 'error') {
        this.showMessage(message, type);
    }

    /**
     * Show success message to user
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Show message to user with specified type
     */
    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.innerHTML = `
            <span class="message-text">${message}</span>
            <button class="message-close" onclick="this.parentElement.remove()">×</button>
        `;

        messageContainer.appendChild(messageElement);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentElement) {
                messageElement.remove();
            }
        }, 5000);

        // Add fade-in animation
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 10);
    }

    /**
     * Initialize tabs (placeholder for future implementation)
     */
    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.showTab(targetTab);
            });
        });
    }

    /**
     * Show specific tab (placeholder for future implementation)
     */
    showTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Show target tab content
        const targetContent = document.getElementById(`${tabName}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // Activate target button
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }

        this.activeTab = tabName;
        this.dispatchTabEvent('changed', { tabName });
    }

    /**
     * Get current active tab
     */
    getActiveTab() {
        return this.activeTab;
    }

    /**
     * Update preview (placeholder for future implementation)
     */
    updatePreview(qrCode) {
        // Future implementation for real-time preview
        console.log('Preview updated:', qrCode);
    }

    /**
     * Dispatch UI-related events
     */
    dispatchTabEvent(eventType, data) {
        const event = new CustomEvent(`ui:tab${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Highlight field with error
     */
    highlightFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('error');
            
            // Remove existing error message
            const existingError = field.parentElement.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }

            // Add error message
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            field.parentElement.appendChild(errorElement);

            // Remove error styling after user starts typing
            const removeError = () => {
                field.classList.remove('error');
                if (errorElement.parentElement) {
                    errorElement.remove();
                }
                field.removeEventListener('input', removeError);
            };
            field.addEventListener('input', removeError);
        }
    }

    /**
     * Clear all field errors
     */
    clearFieldErrors() {
        const errorFields = document.querySelectorAll('.error');
        const errorMessages = document.querySelectorAll('.field-error');
        
        errorFields.forEach(field => field.classList.remove('error'));
        errorMessages.forEach(message => message.remove());
    }
}

export { UIManager };