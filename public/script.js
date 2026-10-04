// script.js
// O desenho é gerado no servidor (/api/desenho).
// Esta página só envia o número e o id_token do Google e exibe a resposta.

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";
let idToken = "";

// O Google chama esta função após o login (data-callback no index.html).
function handleCredentialResponse(resposta) {
  idToken = resposta.credential;
  mensagem.textContent = "";
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";
  area.innerHTML = "";
  botaoBaixar.hidden = true;

  const numero = Number(campoNumero.value);

  let resposta;
  try {
    resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + idToken
      },
      body: JSON.stringify({ numero })
    });
  } catch (erro) {
    mensagem.textContent = "Falha de rede. Tente novamente.";
    return;
  }

  if (resposta.status === 400) {
    mensagem.textContent = "Número inválido. Digite um inteiro entre 1 e 100.";
    return;
  }
  if (resposta.status === 401) {
    mensagem.textContent = "Não autorizado. Entre com sua conta Google e tente de novo.";
    return;
  }
  if (!resposta.ok) {
    mensagem.textContent = "Erro inesperado (" + resposta.status + ").";
    return;
  }

  svgAtual = await resposta.text();
  area.innerHTML = svgAtual;
  botaoBaixar.hidden = false;
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});
