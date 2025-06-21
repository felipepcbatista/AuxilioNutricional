const API_URL = "http://localhost:3000/dados";

async function buscarDados() {
  const resposta = await fetch(API_URL);
  const dados = await resposta.json();
  return dados.sort((a, b) => a.data.localeCompare(b.data));
}

async function atualizarGrafico() {
  const dados = await buscarDados();
  const pontos = document.getElementById("pontos");
  const linha = document.getElementById("linha");
  const area = document.getElementById("area");
  const datas = document.getElementById("datas");

  pontos.innerHTML = "";
  datas.innerHTML = "";

  const largura = 500;
  const altura = 200;
  const x0 = 50;
  const y0 = 250;
  const passoX = largura / (dados.length - 1);
  const pontosLinha = [];
  let areaFechada = "";

  dados.forEach((d, i) => {
    const x = x0 + i * passoX;
    const y = y0 - (d.peso - 50) * 4;

    pontos.innerHTML += `<circle cx="${x}" cy="${y}" r="6" fill="#008000"/>`;
    datas.innerHTML += `<text x="${x}" y="270">${d.data.slice(5)}</text>`;
    pontosLinha.push(`${x},${y}`);
  });

  linha.setAttribute("points", pontosLinha.join(" "));
  areaFechada = pontosLinha.concat(`${x0 + (dados.length - 1) * passoX},250`, `${x0},250`).join(" ");
  area.setAttribute("points", areaFechada);
}

async function atualizarMudancas() {
  const dados = await buscarDados();
  const lista = document.getElementById("mudancas");
  if (dados.length < 2) {
    lista.innerHTML = `<li>Adicione mais dados para ver as mudanças.</li>`;
    return;
  }

  const atual = dados[dados.length - 1];
  const anterior = dados[dados.length - 2];
  const diferenca = anterior.peso - atual.peso;
  const diferencaExibida = diferenca.toFixed(1);
  const imc = (atual.peso / 1.75 ** 2).toFixed(1);
  const tmb = Math.round(10 * atual.peso + 6.25 * 175 - 5 * 25 + 5);

  lista.innerHTML = `
    <li><strong>Peso:</strong> ${diferenca >= 0 ? "-" : "+"} ${Math.abs(diferencaExibida)} kg no último período</li>
    <li><strong>IMC:</strong> ${imc}</li>
    <li><strong>TMB:</strong> ${tmb} kcal</li>
  `;
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = document.getElementById("data").value;
  const peso = parseFloat(document.getElementById("peso").value);

  const dados = await buscarDados();
  if (dados.find(d => d.data === data)) {
    alert("Essa data já está registrada.");
    document.getElementById("data").focus();
    return;
  }

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, peso })
  });

  atualizarGrafico();
  atualizarMudancas();
  e.target.reset();
});

atualizarGrafico();
atualizarMudancas();

