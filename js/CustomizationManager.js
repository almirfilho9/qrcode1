/**
 * Customization Manager Module
 * Gerencia personalização de QR Codes (tamanho, cores, etc.)
 */
import { Utils } from './Utils.js';

class CustomizationManager {
    constructor(qrGenerator) {
        this.qrGenerator = qrGenerator;
        this.errorHandler = null;
        this.uiManager = null;
        
        // Opções padrão de personalização
        this.defaultOptions = {
            size: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            errorCorrectionLevel: QRCode.CorrectLevel.M,
            margin: 4
        };
        
        // Tamanhos predefinidos conforme requisitos
        this.predefinedSizes = [
            { label: '128x128', value: 128 },
            { label: '256x256', value: 256 },
            { label: '512x512', value: 512 },
            { label: '1024x1024', value: 1024 }
        ];
        
        // Níveis de correção de erro
        this.errorLevels = [
            { label: 'Baixo (L)', value: QRCode.CorrectLevel.L },
            { label: 'Médio (M)', value: QRCode.CorrectLevel.M },
            { label: 'Alto (Q)', value: QRCode.CorrectLevel.Q },
            { label: 'Máximo (H)', value: QRCode.CorrectLevel.H }
        ];
        
        this.currentOptions = { ...this.defaultOptions };
        this.previewEnabled = true;
        this.debounceTimer = null;
    }

    /**
     * Define o manipulador de erros
     */
    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }

    /**
     * Define o gerenciador de UI
     */
    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }

    /**
     * Inicializa os controles de personalização
     */
    initializeControls() {
        console.log('Initializing customization controls...');
        this.createCustomizationPanel();
        this.setupEventListeners();
        this.loadCurrentQRCode(); // Carrega o QR Code atual se existir
        console.log('Customization controls initialized, preview enabled:', this.previewEnabled);
    }

    /**
     * Carrega o QR Code atual na área de preview
     */
    async loadCurrentQRCode() {
        try {
            const currentQR = this.qrGenerator.getCurrentQRCode();
            if (currentQR) {
                console.log('Loading current QR code into preview...');
                const qrOptions = this.mapOptionsToQRCode(this.currentOptions);
                await this.generatePreviewQRCode(currentQR.content, qrOptions);
            } else {
                this.showPreviewMessage('Gere um QR Code primeiro para ver o preview');
            }
        } catch (error) {
            console.warn('Erro ao carregar QR Code atual:', error.message);
            this.showPreviewMessage('Erro ao carregar QR Code');
        }
    }

    /**
     * Cria o painel de personalização no HTML
     */
    createCustomizationPanel() {
        const panel = document.getElementById('customization-panel');
        if (!panel) return;

        panel.innerHTML = `
            <!-- Preview Area -->
            <div class="customization-section">
                <h4>Preview</h4>
                <div id="customization-preview-container" class="preview-container">
                    <div id="customization-qrcode" class="preview-qrcode">
                        <h5 class="msg">Gere um QR Code primeiro para ver o preview</h5>
                    </div>
                </div>
                <div class="preview-controls">
                    <label>
                        <input type="checkbox" id="preview-enabled" ${this.previewEnabled ? 'checked' : ''}>
                        Preview em tempo real
                    </label>
                </div>
            </div>

            <div class="customization-section">
                <h4>Tamanho</h4>
                <div class="size-controls">
                    <label for="size-select">Tamanho predefinido:</label>
                    <select id="size-select">
                        ${this.predefinedSizes.map(size => 
                            `<option value="${size.value}" ${size.value === this.currentOptions.size ? 'selected' : ''}>
                                ${size.label}
                            </option>`
                        ).join('')}
                    </select>
                    
                    <label for="size-custom">Tamanho personalizado:</label>
                    <div class="size-input-group">
                        <input type="range" id="size-slider" min="100" max="1024" value="${this.currentOptions.size}" step="10">
                        <input type="number" id="size-input" min="100" max="1024" value="${this.currentOptions.size}">
                        <span class="size-unit">px</span>
                    </div>
                </div>
            </div>

            <div class="customization-section">
                <h4>Cores</h4>
                <div class="color-controls">
                    <div class="color-group">
                        <label for="color-dark">Cor dos módulos (escuro):</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="color-dark" value="${this.currentOptions.colorDark}">
                            <input type="text" id="color-dark-text" value="${this.currentOptions.colorDark}" placeholder="#000000">
                        </div>
                    </div>
                    
                    <div class="color-group">
                        <label for="color-light">Cor de fundo (claro):</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="color-light" value="${this.currentOptions.colorLight}">
                            <input type="text" id="color-light-text" value="${this.currentOptions.colorLight}" placeholder="#ffffff">
                        </div>
                    </div>
                </div>
            </div>

            <div class="customization-section">
                <h4>Configurações Avançadas</h4>
                <div class="advanced-controls">
                    <label for="error-level">Nível de correção de erro:</label>
                    <select id="error-level">
                        ${this.errorLevels.map(level => 
                            `<option value="${level.value}" ${level.value === this.currentOptions.errorCorrectionLevel ? 'selected' : ''}>
                                ${level.label}
                            </option>`
                        ).join('')}
                    </select>
                    
                    <label for="margin-slider">Margem:</label>
                    <div class="margin-input-group">
                        <input type="range" id="margin-slider" min="0" max="20" value="${this.currentOptions.margin}" step="1">
                        <input type="number" id="margin-input" min="0" max="20" value="${this.currentOptions.margin}">
                        <span class="margin-unit">px</span>
                    </div>
                </div>
            </div>

            <div class="customization-section">
                <h4>Ações</h4>
                <div class="action-controls">
                    <button id="apply-customization" class="btn-primary">Aplicar Personalização</button>
                    <button id="reset-customization" class="btn-secondary">Restaurar Padrão</button>
                    <button id="save-preset" class="btn-secondary">Salvar Preset</button>
                </div>
            </div>
        `;
    }

    /**
     * Configura os event listeners dos controles
     */
    setupEventListeners() {
        // Controles de tamanho
        const sizeSelect = document.getElementById('size-select');
        const sizeSlider = document.getElementById('size-slider');
        const sizeInput = document.getElementById('size-input');

        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => {
                const size = parseInt(e.target.value);
                this.updateSizeControls(size);
                this.updateOption('size', size);
            });
        }

        if (sizeSlider) {
            sizeSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                this.updateSizeControls(size);
                this.debouncedUpdate('size', size);
            });
        }

        if (sizeInput) {
            sizeInput.addEventListener('change', (e) => {
                const size = parseInt(e.target.value);
                this.updateSizeControls(size);
                this.updateOption('size', size);
            });
        }

        // Controles de cor
        this.setupColorControls('dark');
        this.setupColorControls('light');

        // Controles avançados
        const errorLevel = document.getElementById('error-level');
        const marginSlider = document.getElementById('margin-slider');
        const marginInput = document.getElementById('margin-input');

        if (errorLevel) {
            errorLevel.addEventListener('change', (e) => {
                this.updateOption('errorCorrectionLevel', parseInt(e.target.value));
            });
        }

        if (marginSlider) {
            marginSlider.addEventListener('input', (e) => {
                const margin = parseInt(e.target.value);
                marginInput.value = margin;
                this.debouncedUpdate('margin', margin);
            });
        }

        if (marginInput) {
            marginInput.addEventListener('change', (e) => {
                const margin = parseInt(e.target.value);
                marginSlider.value = margin;
                this.updateOption('margin', margin);
            });
        }

        // Botões de ação
        const applyBtn = document.getElementById('apply-customization');
        const resetBtn = document.getElementById('reset-customization');
        const saveBtn = document.getElementById('save-preset');
        const previewCheckbox = document.getElementById('preview-enabled');

        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyCustomization());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToDefaults());
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePreset());
        }

        if (previewCheckbox) {
            previewCheckbox.addEventListener('change', (e) => {
                this.previewEnabled = e.target.checked;
            });
        }
    }

    /**
     * Configura controles de cor para dark ou light
     */
    setupColorControls(type) {
        const colorPicker = document.getElementById(`color-${type}`);
        const colorText = document.getElementById(`color-${type}-text`);

        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                const color = e.target.value;
                colorText.value = color;
                this.debouncedUpdate(`color${type.charAt(0).toUpperCase() + type.slice(1)}`, color);
            });
        }

        if (colorText) {
            colorText.addEventListener('change', (e) => {
                const color = e.target.value;
                if (this.isValidColor(color)) {
                    colorPicker.value = color;
                    this.updateOption(`color${type.charAt(0).toUpperCase() + type.slice(1)}`, color);
                } else {
                    this.showError('Cor inválida. Use formato #RRGGBB');
                    colorText.value = this.currentOptions[`color${type.charAt(0).toUpperCase() + type.slice(1)}`];
                }
            });
        }
    }

    /**
     * Atualiza controles de tamanho sincronizados
     */
    updateSizeControls(size) {
        const sizeSlider = document.getElementById('size-slider');
        const sizeInput = document.getElementById('size-input');
        const sizeSelect = document.getElementById('size-select');

        if (sizeSlider) sizeSlider.value = size;
        if (sizeInput) sizeInput.value = size;
        
        // Atualiza select apenas se for um tamanho predefinido
        if (sizeSelect) {
            const isPredefined = this.predefinedSizes.some(s => s.value === size);
            if (isPredefined) {
                sizeSelect.value = size;
            } else {
                sizeSelect.value = '';
            }
        }
    }

    /**
     * Atualiza uma opção e aplica preview se habilitado
     */
    updateOption(key, value) {
        console.log(`Updating option ${key} to:`, value);
        this.currentOptions[key] = value;
        
        if (this.previewEnabled) {
            console.log('Preview enabled, calling updatePreview...');
            this.updatePreview();
        } else {
            console.log('Preview disabled, skipping update');
        }
    }

    /**
     * Atualização com debounce para melhor performance
     */
    debouncedUpdate(key, value) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.updateOption(key, value);
        }, 300);
    }

    /**
     * Aplica personalização ao QR Code atual
     */
    async applyCustomization() {
        try {
            const currentQR = this.qrGenerator.getCurrentQRCode();
            if (!currentQR) {
                this.showError('Nenhum QR Code para personalizar. Gere um QR Code primeiro.');
                return;
            }

            // Mostra loading
            if (this.uiManager) {
                this.uiManager.showLoading(true);
            }

            // Mapeia as opções para o formato do QRCode.js
            const qrOptions = this.mapOptionsToQRCode(this.currentOptions);
            
            // Aplica as opções ao QR Generator
            this.qrGenerator.updateOptions(qrOptions);
            
            // Regenera o QR Code principal com as novas opções
            await this.qrGenerator.regenerate(qrOptions);
            
            // Atualiza também o preview na aba de personalização
            await this.generatePreviewQRCode(currentQR.content, qrOptions);
            
            if (this.uiManager) {
                this.uiManager.showLoading(false);
                this.uiManager.showSuccess('Personalização aplicada com sucesso!');
            }

        } catch (error) {
            if (this.uiManager) {
                this.uiManager.showLoading(false);
            }
            this.handleError(error, 'Aplicar personalização');
        }
    }

    /**
     * Atualiza preview em tempo real
     */
    async updatePreview() {
        if (!this.previewEnabled) return;
        
        try {
            const currentQR = this.qrGenerator.getCurrentQRCode();
            if (currentQR) {
                // Mapeia as opções de personalização para o formato do QRCode.js
                const qrOptions = this.mapOptionsToQRCode(this.currentOptions);
                console.log('Updating preview with options:', qrOptions);
                
                // Gera o QR Code na área de preview da personalização
                await this.generatePreviewQRCode(currentQR.content, qrOptions);
            } else {
                console.log('No current QR code to preview');
                this.showPreviewMessage('Gere um QR Code primeiro para ver o preview');
            }
        } catch (error) {
            console.warn('Erro no preview:', error.message);
            this.showPreviewMessage('Erro ao gerar preview');
        }
    }

    /**
     * Gera QR Code na área de preview
     */
    async generatePreviewQRCode(content, options) {
        const previewContainer = document.getElementById('customization-qrcode');
        if (!previewContainer) return;

        // Limpa o container
        previewContainer.innerHTML = '';

        // Cria uma nova instância do QRCode para o preview
        return new Promise((resolve, reject) => {
            try {
                const qrCode = new QRCode(previewContainer, {
                    text: content,
                    width: options.width,
                    height: options.height,
                    colorDark: options.colorDark,
                    colorLight: options.colorLight,
                    correctLevel: options.correctLevel
                });

                // Aguarda a geração
                setTimeout(() => {
                    if (previewContainer.querySelector('canvas') || previewContainer.querySelector('img')) {
                        resolve(qrCode);
                    } else {
                        reject(new Error('Failed to generate preview QR code'));
                    }
                }, 100);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Mostra mensagem na área de preview
     */
    showPreviewMessage(message) {
        const previewContainer = document.getElementById('customization-qrcode');
        if (previewContainer) {
            previewContainer.innerHTML = `<h5 class="msg">${message}</h5>`;
        }
    }

    /**
     * Mapeia opções de personalização para formato do QRCode.js
     */
    mapOptionsToQRCode(options) {
        return {
            width: options.size,
            height: options.size,
            colorDark: options.colorDark,
            colorLight: options.colorLight,
            correctLevel: options.errorCorrectionLevel,
            margin: options.margin
        };
    }

    /**
     * Restaura configurações padrão
     */
    resetToDefaults() {
        this.currentOptions = { ...this.defaultOptions };
        this.updateAllControls();
        
        if (this.previewEnabled) {
            this.updatePreview();
        }
        
        this.showSuccess('Configurações restauradas para o padrão');
    }

    /**
     * Atualiza todos os controles com os valores atuais
     */
    updateAllControls() {
        // Tamanho
        this.updateSizeControls(this.currentOptions.size);
        
        // Cores
        const colorDark = document.getElementById('color-dark');
        const colorDarkText = document.getElementById('color-dark-text');
        const colorLight = document.getElementById('color-light');
        const colorLightText = document.getElementById('color-light-text');
        
        if (colorDark) colorDark.value = this.currentOptions.colorDark;
        if (colorDarkText) colorDarkText.value = this.currentOptions.colorDark;
        if (colorLight) colorLight.value = this.currentOptions.colorLight;
        if (colorLightText) colorLightText.value = this.currentOptions.colorLight;
        
        // Nível de erro
        const errorLevel = document.getElementById('error-level');
        if (errorLevel) errorLevel.value = this.currentOptions.errorCorrectionLevel;
        
        // Margem
        const marginSlider = document.getElementById('margin-slider');
        const marginInput = document.getElementById('margin-input');
        if (marginSlider) marginSlider.value = this.currentOptions.margin;
        if (marginInput) marginInput.value = this.currentOptions.margin;
    }

    /**
     * Salva preset personalizado
     */
    savePreset() {
        const name = prompt('Nome do preset:');
        if (!name) return;
        
        try {
            const presets = Utils.storage.get('qr-presets', {});
            presets[name] = { ...this.currentOptions };
            Utils.storage.set('qr-presets', presets);
            
            this.showSuccess(`Preset "${name}" salvo com sucesso!`);
        } catch (error) {
            this.handleError(error, 'Salvar preset');
        }
    }

    /**
     * Carrega preset salvo
     */
    loadPreset(name) {
        try {
            const presets = Utils.storage.get('qr-presets', {});
            if (presets[name]) {
                this.currentOptions = { ...presets[name] };
                this.updateAllControls();
                
                if (this.previewEnabled) {
                    this.updatePreview();
                }
                
                this.showSuccess(`Preset "${name}" carregado!`);
            } else {
                this.showError(`Preset "${name}" não encontrado`);
            }
        } catch (error) {
            this.handleError(error, 'Carregar preset');
        }
    }

    /**
     * Obtém opções atuais de personalização
     */
    getCustomizationOptions() {
        return { ...this.currentOptions };
    }

    /**
     * Valida cor hexadecimal
     */
    isValidColor(color) {
        return /^#[0-9A-F]{6}$/i.test(color);
    }

    /**
     * Mostra mensagem de erro
     */
    showError(message) {
        if (this.uiManager) {
            this.uiManager.showError(message);
        } else {
            console.error(message);
        }
    }

    /**
     * Mostra mensagem de sucesso
     */
    showSuccess(message) {
        if (this.uiManager) {
            this.uiManager.showSuccess(message);
        } else {
            console.log(message);
        }
    }

    /**
     * Trata erros
     */
    handleError(error, context) {
        if (this.errorHandler) {
            this.errorHandler.handleError(error, context);
        } else {
            console.error(`${context}:`, error);
        }
    }
}

export { CustomizationManager };