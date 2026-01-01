/**
 * Main Application Entry Point
 * Coordinates all modules and initializes the QR Code Generator
 */
import { QRGenerator } from './QRGenerator.js';
import { UIManager } from './UIManager.js';
import { ErrorHandler } from './ErrorHandler.js';
import { DownloadManager } from './DownloadManager.js';
import { CustomizationManager } from './CustomizationManager.js';
import { HistoryManager } from './HistoryManager.js';
import { ContentParser } from './ContentParser.js';
import { Utils } from './Utils.js';

class App {
    constructor() {
        this.qrGenerator = null;
        this.uiManager = null;
        this.errorHandler = null;
        this.downloadManager = null;
        this.customizationManager = null;
        this.historyManager = null;
        this.contentParser = null;
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize error handler first
            this.errorHandler = new ErrorHandler();
            
            // Initialize UI Manager
            this.uiManager = new UIManager();
            
            // Initialize QR Generator
            this.qrGenerator = new QRGenerator('qrcode', {
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });

            // Initialize Download Manager
            this.downloadManager = new DownloadManager(this.qrGenerator);

            // Initialize Customization Manager
            this.customizationManager = new CustomizationManager(this.qrGenerator);

            // Initialize History Manager
            this.historyManager = new HistoryManager(10);

            // Initialize Content Parser
            this.contentParser = new ContentParser();

            // Set up module communication
            this.setupModuleCommunication();
            
            // Initialize UI components
            await this.uiManager.init();
            
            // Initialize tabs
            this.uiManager.initializeTabs();
            
            // Initialize customization controls
            this.customizationManager.initializeControls();
            
            // Initialize history panel
            this.historyManager.initializeHistoryPanel();
            
            // Initialize content types
            this.contentParser.initializeContentTypes();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('QR Code Generator App initialized successfully');
            
            // Test basic functionality
            console.log('Testing basic QR generation...');
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.errorHandler?.handleError(error, 'App initialization');
            throw error;
        }
    }

    /**
     * Set up communication between modules
     */
    setupModuleCommunication() {
        // Pass error handler to other modules
        this.uiManager.setErrorHandler(this.errorHandler);
        this.qrGenerator.setErrorHandler(this.errorHandler);
        this.downloadManager.setErrorHandler(this.errorHandler);
        this.customizationManager.setErrorHandler(this.errorHandler);
        this.customizationManager.setUIManager(this.uiManager);
        this.historyManager.setErrorHandler(this.errorHandler);
        this.historyManager.setUIManager(this.uiManager);
        this.historyManager.setQRGenerator(this.qrGenerator);
        this.contentParser.setErrorHandler(this.errorHandler);
        
        // Set up event system for module communication
        this.setupEventSystem();
    }

    /**
     * Set up custom event system for module communication
     */
    setupEventSystem() {
        // QR Generation events
        document.addEventListener('qr:generate', (event) => {
            this.handleQRGeneration(event.detail);
        });

        document.addEventListener('qr:generated', (event) => {
            // Auto-initialize download buttons when QR is generated
            this.downloadManager.initializeDownloadButtons();
            
            // Add to history
            if (event.detail) {
                this.historyManager.addToHistory(event.detail);
            }
        });

        // UI events
        document.addEventListener('ui:tabChange', (event) => {
            this.handleTabChange(event.detail);
        });

        // Error events
        document.addEventListener('error:display', (event) => {
            this.uiManager.showError(event.detail.message, event.detail.type);
        });

        // Download events
        document.addEventListener('download:success', (event) => {
            this.uiManager.showSuccess(event.detail.message);
        });
    }

    /**
     * Set up main event listeners
     */
    setupEventListeners() {
        // Main form submission
        const form = document.getElementById('qr-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateQRCode();
            });
        }

        // Input validation
        const textInput = document.getElementById('text-input');
        if (textInput) {
            textInput.addEventListener('input', (e) => {
                this.validateInput(e.target.value);
            });
        }
    }

    /**
     * Handle QR Code generation
     */
    async generateQRCode() {
        try {
            const textInput = document.getElementById('text-input');
            const content = textInput?.value?.trim();

            if (!content) {
                this.errorHandler.showUserError('Por favor, digite algum conteúdo!', 'warning');
                return;
            }

            this.uiManager.showLoading(true);
            
            await this.qrGenerator.generate(content);
            
            // Download buttons and history are handled by event listeners
            
            this.uiManager.showLoading(false);
            this.uiManager.showSuccess('QR Code gerado com sucesso!');
            
        } catch (error) {
            this.uiManager.showLoading(false);
            this.errorHandler.handleError(error, 'QR Code generation');
        }
    }

    /**
     * Validate user input
     */
    validateInput(content) {
        if (!content || content.length === 0) {
            return false;
        }

        // Basic content length validation (QR codes have limits)
        if (content.length > 2000) {
            this.errorHandler.showUserError('Conteúdo muito longo. Máximo 2000 caracteres.', 'warning');
            return false;
        }

        return true;
    }

    /**
     * Handle QR generation events from other modules
     */
    async handleQRGeneration(data) {
        try {
            this.uiManager.showLoading(true);
            await this.qrGenerator.generate(data.content, data.options || {});
            this.uiManager.showLoading(false);
            this.uiManager.showSuccess('QR Code gerado com sucesso!');
        } catch (error) {
            this.uiManager.showLoading(false);
            this.errorHandler.handleError(error, 'Geração de QR Code');
        }
    }

    /**
     * Handle tab change events
     */
    handleTabChange(data) {
        console.log('Tab changed to:', data.tabName);
        // Future implementation for tab-specific logic
    }

    /**
     * Get current application state
     */
    getState() {
        return {
            initialized: this.initialized,
            currentQR: this.qrGenerator?.getCurrentQRCode(),
            activeTab: this.uiManager?.getActiveTab()
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for QRCode library to be available
    if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded');
        return;
    }
    
    const app = new App();
    app.init().catch(error => {
        console.error('Failed to initialize app:', error);
    });
    
    // Make app globally accessible for debugging
    window.QRApp = app;
});

export { App };