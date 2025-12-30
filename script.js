document.getElementById("qr-form").addEventListener("submit", function(e) {
    e.preventDefault();
    gerarQRCode();
});
// Função para gerar o QR Code

document.addEventListener("DOMContentLoaded", function() {
    const gerarQRCode = () => {
      // Obtém o texto do campo de entrada
      const texto = document.getElementById("text-input").value.trim();
      // Verifica se o campo está vazio
      if (!texto) {
          alert("Por favor, digite algum conteúdo!");
          return;
      }
      // Remove o conteúdo existente no elemento #qrcode
      document.getElementById("qrcode").innerHTML = "";
  
      // Cria um novo objeto QRCode
      new QRCode(document.getElementById("qrcode"), {
        text: texto,
        width: 200, // ajuste o tamanho conforme necessário
        height: 200 // ajuste o tamanho conforme necessário
      });
    };
  
    // Adicione outros eventos ou lógica aqui, se necessário
  
    // Você pode acessar a função gerarQRCode diretamente do console do navegador se necessário
    window.gerarQRCode = gerarQRCode;
    // Exemplo: gerarQRCode();
    // Você pode chamar gerarQRCode() aqui se quiser gerar um QR Code ao carregar a página
  });
  

