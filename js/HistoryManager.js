/**
 * History Manager Module
 * Gerencia histórico de QR Codes no localStorage
 */
import { Utils } from './Utils.js';

class HistoryManager {
    constructor(maxItems = 10) {
        this.maxItems = maxItems;
        this.storageKey = 'qr-history';
        this.errorHandler = null;
        this.uiManager = null;
        this.qrGenerator = null;
    }

    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }

    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }

    setQRGenerator(qrGenerator) {
        this.qrGenerator = qrGenerator;
    }

    initializeHistoryPanel() {
        this.createHistoryInterface();
        this.setupEventListeners();
        this.refreshHistoryDisplay();
    }

    createHistoryInterface() {
        const panel = document.getElementById('history-panel');
        if (!panel) return;

        panel.innerHTML = `
            <div class="history-controls">
                <button id="clear-history" class="btn-secondary">Limpar Histórico</button>
                <button id="refresh-history" class="btn-secondary">Atualizar</button>
            </div>
            <div id="history-list" class="history-list">
                <!-- History items will be populated here -->
            </div>
        `;
    }

    setupEventListeners() {
        const clearBtn = document.getElementById('clear-history');
        const refreshBtn = document.getElementById('refresh-history');

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearHistory());
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshHistoryDisplay());
        }
    }

    addToHistory(qrData) {
        try {
            const history = this.getHistory();
            const historyItem = {
                id: Utils.generateId(),
                content: qrData.content,
                options: qrData.options,
                timestamp: new Date(),
                preview: this.generatePreview(qrData.content)
            };

            history.unshift(historyItem);
            
            if (history.length > this.maxItems) {
                history.splice(this.maxItems);
            }

            Utils.storage.set(this.storageKey, history);
            this.refreshHistoryDisplay();
            
        } catch (error) {
            this.handleError(error, 'Adicionar ao histórico');
        }
    }

    getHistory() {
        return Utils.storage.get(this.storageKey, []);
    }

    clearHistory() {
        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
            Utils.storage.remove(this.storageKey);
            this.refreshHistoryDisplay();
            this.showSuccess('Histórico limpo com sucesso');
        }
    }

    removeItem(id) {
        try {
            const history = this.getHistory();
            const filteredHistory = history.filter(item => item.id !== id);
            Utils.storage.set(this.storageKey, filteredHistory);
            this.refreshHistoryDisplay();
            this.showSuccess('Item removido do histórico');
        } catch (error) {
            this.handleError(error, 'Remover item');
        }
    }

    async loadFromHistory(id) {
        try {
            const history = this.getHistory();
            const item = history.find(h => h.id === id);
            
            if (!item) {
                this.showError('Item não encontrado no histórico');
                return;
            }

            if (this.uiManager) {
                this.uiManager.showLoading(true);
            }

            await this.qrGenerator.generate(item.content, item.options);
            
            if (this.uiManager) {
                this.uiManager.showLoading(false);
                this.uiManager.showSuccess('QR Code carregado do histórico');
            }

        } catch (error) {
            if (this.uiManager) {
                this.uiManager.showLoading(false);
            }
            this.handleError(error, 'Carregar do histórico');
        }
    }

    refreshHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        const history = this.getHistory();
        
        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-history">Nenhum QR Code no histórico</p>';
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-preview">
                    <div class="preview-text">${this.truncateText(item.content, 30)}</div>
                    <div class="preview-info">
                        <span class="timestamp">${Utils.formatTimestamp(item.timestamp)}</span>
                        <span class="size">${item.options.width}x${item.options.height}</span>
                    </div>
                </div>
                <div class="history-actions">
                    <button class="load-btn" data-action="load" data-id="${item.id}">
                        Carregar
                    </button>
                    <button class="remove-btn" data-action="remove" data-id="${item.id}">
                        ×
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to buttons
        historyList.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;
                
                if (action === 'load') {
                    this.loadFromHistory(id);
                } else if (action === 'remove') {
                    this.removeItem(id);
                }
            });
        });
    }

    generatePreview(content) {
        return content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    showError(message) {
        if (this.uiManager) {
            this.uiManager.showError(message);
        }
    }

    showSuccess(message) {
        if (this.uiManager) {
            this.uiManager.showSuccess(message);
        }
    }

    handleError(error, context) {
        if (this.errorHandler) {
            this.errorHandler.handleError(error, context);
        }
    }
}

export { HistoryManager };