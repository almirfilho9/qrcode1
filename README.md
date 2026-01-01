# Gerador de QR Code Avançado

Um gerador de QR Code **completo e profissional** com recursos avançados, feito com arquitetura modular ES6.  
Crie QR Codes personalizados para diferentes tipos de conteúdo, baixe em múltiplos formatos e gerencie seu histórico — tudo de forma gratuita e sem cadastro.

## ✨ Recursos Principais

### 🎨 **Personalização Completa**
- Tamanhos predefinidos (128x128 até 1024x1024) ou personalizados
- Cores customizáveis para módulos e fundo
- Níveis de correção de erro ajustáveis
- Preview em tempo real das alterações
- Sistema de presets salvos

### � **Tipos de Conteúdo Suportados**
- **Texto simples** - Qualquer mensagem ou informação
- **URLs** - Links com validação automática de protocolo
- **Email** - Com assunto e corpo opcionais (formato mailto)
- **Telefone** - Números com formato tel: para discagem direta
- **WiFi** - Configuração completa de rede (SSID, senha, segurança)
- **vCard** - Cartões de contato com informações completas

### 💾 **Download Avançado**
- **PNG** - Imagem bitmap de alta qualidade
- **SVG** - Formato vetorial escalável
- **JPEG** - Com controle de qualidade e compressão
- Nomes de arquivo automáticos com timestamp
- Redimensionamento personalizado

### 📚 **Gerenciamento de Histórico**
- Histórico automático dos últimos 10 QR Codes
- Visualização com preview e informações detalhadas
- Recarregamento rápido de códigos anteriores
- Armazenamento local seguro (localStorage)
- Limpeza seletiva ou completa do histórico

### 🎯 **Interface Moderna**
- Design responsivo com tema escuro elegante
- Navegação por abas intuitiva
- Feedback visual com mensagens de status
- Indicadores de carregamento
- Totalmente acessível (WCAG 2.1)

### 🔧 **Recursos Técnicos**
- Arquitetura modular ES6 com separação de responsabilidades
- Sistema robusto de tratamento de erros
- Validação de entrada em tempo real
- Suporte completo para dispositivos móveis
- Otimizado para performance e usabilidade

## 🖼️ Preview

![Preview Desktop](preview-desktop.png)

## 🚀 Como Usar

1. **Abra a aplicação** no seu navegador
2. **Escolha o tipo de conteúdo** na aba "Tipos"
3. **Preencha as informações** necessárias
4. **Personalize** cores e tamanho na aba "Personalizar" (opcional)
5. **Gere o QR Code** e faça o download no formato desejado
6. **Acesse o histórico** para reutilizar códigos anteriores

## 📁 Estrutura do Projeto

```
├── index.html              # Página principal
├── style.css              # Estilos e responsividade
├── js/
│   ├── App.js              # Aplicação principal e coordenação
│   ├── QRGenerator.js      # Geração de QR Codes
│   ├── UIManager.js        # Gerenciamento da interface
│   ├── DownloadManager.js  # Sistema de downloads
│   ├── CustomizationManager.js # Personalização
│   ├── HistoryManager.js   # Gerenciamento de histórico
│   ├── ContentParser.js    # Processamento de tipos de conteúdo
│   ├── ErrorHandler.js     # Tratamento de erros
│   └── Utils.js           # Utilitários gerais
└── README.md              # Documentação
```

## 🛠️ Tecnologias

- **HTML5** - Estrutura semântica e acessível
- **CSS3** - Design responsivo e moderno
- **JavaScript ES6+** - Arquitetura modular e funcional
- **QRCode.js** - Biblioteca para geração de QR Codes
- **LocalStorage API** - Persistência de dados local

## 🌟 Características Técnicas

- ✅ **100% Client-side** - Não envia dados para servidores
- ✅ **Sem dependências externas** - Apenas QRCode.js
- ✅ **Responsivo** - Funciona em todos os dispositivos
- ✅ **Acessível** - Compatível com leitores de tela
- ✅ **Rápido** - Carregamento e geração instantâneos
- ✅ **Seguro** - Processamento local dos dados

## 👤 Autor

Feito com ❤️ por **José Almir**

Se este projeto foi útil para você, deixe uma ⭐ no repositório!

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

**Versão:** 2.0 - Gerador Avançado  
**Tecnologias:** HTML5 • CSS3 • JavaScript ES6+ • [QRCode.js](https://davidshimjs.github.io/qrcodejs/)
