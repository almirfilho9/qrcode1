/**
 * Content Parser Module
 * Processa diferentes tipos de conteúdo para QR Codes
 */
class ContentParser {
    constructor() {
        this.errorHandler = null;
        this.supportedTypes = ['text', 'url', 'email', 'phone', 'wifi', 'vcard'];
        this.currentType = 'text';
    }

    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }

    initializeContentTypes() {
        this.createContentTypeInterface();
        this.setupEventListeners();
        this.showContentType('text');
    }

    createContentTypeInterface() {
        const panel = document.getElementById('content-types-panel');
        if (!panel) return;

        panel.innerHTML = `
            <div class="content-type-selector">
                <label for="content-type-select">Tipo de conteúdo:</label>
                <select id="content-type-select">
                    <option value="text">Texto</option>
                    <option value="url">URL</option>
                    <option value="email">Email</option>
                    <option value="phone">Telefone</option>
                    <option value="wifi">WiFi</option>
                    <option value="vcard">vCard (Contato)</option>
                </select>
            </div>

            <div id="content-forms">
                ${this.createAllForms()}
            </div>

            <div class="content-actions">
                <button id="generate-from-type" class="btn-primary">Gerar QR Code</button>
                <button id="clear-form" class="btn-secondary">Limpar</button>
            </div>
        `;
    }

    createAllForms() {
        return `
            <div id="text-form" class="content-form active">
                <label for="text-content">Texto:</label>
                <textarea id="text-content" rows="4" placeholder="Digite seu texto aqui..."></textarea>
            </div>

            <div id="url-form" class="content-form">
                <label for="url-content">URL:</label>
                <input type="url" id="url-content" placeholder="https://exemplo.com">
                <small>Protocolo será adicionado automaticamente se omitido</small>
            </div>

            <div id="email-form" class="content-form">
                <label for="email-address">Email:</label>
                <input type="email" id="email-address" placeholder="exemplo@email.com" required>
                
                <label for="email-subject">Assunto (opcional):</label>
                <input type="text" id="email-subject" placeholder="Assunto do email">
                
                <label for="email-body">Mensagem (opcional):</label>
                <textarea id="email-body" rows="3" placeholder="Corpo do email"></textarea>
            </div>

            <div id="phone-form" class="content-form">
                <label for="phone-number">Número de telefone:</label>
                <input type="tel" id="phone-number" placeholder="+55 11 99999-9999">
                <small>Inclua o código do país para melhor compatibilidade</small>
            </div>

            <div id="wifi-form" class="content-form">
                <label for="wifi-ssid">Nome da rede (SSID):</label>
                <input type="text" id="wifi-ssid" placeholder="MinhaRedeWiFi" required>
                
                <label for="wifi-password">Senha:</label>
                <input type="password" id="wifi-password" placeholder="senha123">
                
                <label for="wifi-security">Tipo de segurança:</label>
                <select id="wifi-security">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Sem senha</option>
                </select>
                
                <label>
                    <input type="checkbox" id="wifi-hidden"> Rede oculta
                </label>
            </div>

            <div id="vcard-form" class="content-form">
                <label for="vcard-firstname">Nome:</label>
                <input type="text" id="vcard-firstname" placeholder="João">
                
                <label for="vcard-lastname">Sobrenome:</label>
                <input type="text" id="vcard-lastname" placeholder="Silva">
                
                <label for="vcard-organization">Empresa (opcional):</label>
                <input type="text" id="vcard-organization" placeholder="Minha Empresa">
                
                <label for="vcard-phone">Telefone:</label>
                <input type="tel" id="vcard-phone" placeholder="+55 11 99999-9999">
                
                <label for="vcard-email">Email:</label>
                <input type="email" id="vcard-email" placeholder="joao@email.com">
                
                <label for="vcard-url">Website (opcional):</label>
                <input type="url" id="vcard-url" placeholder="https://meusite.com">
                
                <label for="vcard-address">Endereço (opcional):</label>
                <textarea id="vcard-address" rows="2" placeholder="Rua, Cidade, Estado, CEP"></textarea>
            </div>
        `;
    }

    setupEventListeners() {
        const typeSelect = document.getElementById('content-type-select');
        const generateBtn = document.getElementById('generate-from-type');
        const clearBtn = document.getElementById('clear-form');

        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.showContentType(e.target.value);
            });
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateFromCurrentType());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCurrentForm());
        }
    }

    showContentType(type) {
        this.currentType = type;
        
        // Hide all forms
        document.querySelectorAll('.content-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Show selected form
        const targetForm = document.getElementById(`${type}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
    }

    async generateFromCurrentType() {
        try {
            const content = this.parseContent(this.currentType);
            if (!content) return;

            // Dispatch event to generate QR code
            const event = new CustomEvent('qr:generate', {
                detail: { content, type: this.currentType },
                bubbles: true
            });
            document.dispatchEvent(event);

        } catch (error) {
            this.handleError(error, 'Gerar QR Code');
        }
    }

    parseContent(type) {
        switch (type) {
            case 'text':
                return this.parseText();
            case 'url':
                return this.parseURL();
            case 'email':
                return this.parseEmail();
            case 'phone':
                return this.parsePhone();
            case 'wifi':
                return this.parseWiFi();
            case 'vcard':
                return this.parseVCard();
            default:
                throw new Error(`Tipo não suportado: ${type}`);
        }
    }

    parseText() {
        const content = document.getElementById('text-content')?.value?.trim();
        if (!content) {
            throw new Error('Digite algum texto');
        }
        return content;
    }

    parseURL() {
        const url = document.getElementById('url-content')?.value?.trim();
        if (!url) {
            throw new Error('Digite uma URL');
        }
        return this.formatURL(url);
    }

    parseEmail() {
        const email = document.getElementById('email-address')?.value?.trim();
        const subject = document.getElementById('email-subject')?.value?.trim();
        const body = document.getElementById('email-body')?.value?.trim();
        
        if (!email) {
            throw new Error('Digite um email');
        }
        
        if (!this.validateEmail(email)) {
            throw new Error('Email inválido');
        }
        
        return this.formatEmail(email, subject, body);
    }

    parsePhone() {
        const phone = document.getElementById('phone-number')?.value?.trim();
        if (!phone) {
            throw new Error('Digite um número de telefone');
        }
        return this.formatPhone(phone);
    }

    parseWiFi() {
        const ssid = document.getElementById('wifi-ssid')?.value?.trim();
        const password = document.getElementById('wifi-password')?.value || '';
        const security = document.getElementById('wifi-security')?.value || 'WPA';
        const hidden = document.getElementById('wifi-hidden')?.checked || false;
        
        if (!ssid) {
            throw new Error('Digite o nome da rede WiFi');
        }
        
        return this.formatWiFi(ssid, password, security, hidden);
    }

    parseVCard() {
        const firstName = document.getElementById('vcard-firstname')?.value?.trim();
        const lastName = document.getElementById('vcard-lastname')?.value?.trim();
        const organization = document.getElementById('vcard-organization')?.value?.trim();
        const phone = document.getElementById('vcard-phone')?.value?.trim();
        const email = document.getElementById('vcard-email')?.value?.trim();
        const url = document.getElementById('vcard-url')?.value?.trim();
        const address = document.getElementById('vcard-address')?.value?.trim();
        
        if (!firstName && !lastName) {
            throw new Error('Digite pelo menos o nome ou sobrenome');
        }
        
        return this.formatVCard({
            firstName, lastName, organization, phone, email, url, address
        });
    }

    formatURL(url) {
        if (!url.match(/^https?:\/\//)) {
            url = 'http://' + url;
        }
        return url;
    }

    formatEmail(email, subject = '', body = '') {
        let mailto = `mailto:${email}`;
        const params = [];
        
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        
        if (params.length > 0) {
            mailto += '?' + params.join('&');
        }
        
        return mailto;
    }

    formatPhone(phone) {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        return `tel:${cleanPhone}`;
    }

    formatWiFi(ssid, password, security, hidden) {
        return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
    }

    formatVCard(contactData) {
        const { firstName, lastName, organization, phone, email, url, address } = contactData;
        
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        
        if (firstName || lastName) {
            vcard += `FN:${firstName} ${lastName}\n`;
            vcard += `N:${lastName};${firstName};;;\n`;
        }
        
        if (organization) {
            vcard += `ORG:${organization}\n`;
        }
        
        if (phone) {
            vcard += `TEL:${phone}\n`;
        }
        
        if (email) {
            vcard += `EMAIL:${email}\n`;
        }
        
        if (url) {
            vcard += `URL:${url}\n`;
        }
        
        if (address) {
            vcard += `ADR:;;${address};;;;\n`;
        }
        
        vcard += 'END:VCARD';
        return vcard;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validateContent(content, type) {
        if (!content || content.trim().length === 0) {
            return false;
        }
        
        switch (type) {
            case 'email':
                return content.includes('mailto:');
            case 'phone':
                return content.includes('tel:');
            case 'wifi':
                return content.startsWith('WIFI:');
            case 'vcard':
                return content.includes('BEGIN:VCARD');
            case 'url':
                return /^https?:\/\//.test(content);
            default:
                return true;
        }
    }

    clearCurrentForm() {
        const form = document.getElementById(`${this.currentType}-form`);
        if (form) {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        }
    }

    handleError(error, context) {
        if (this.errorHandler) {
            this.errorHandler.handleError(error, context);
        } else {
            alert(error.message);
        }
    }
}

export { ContentParser };