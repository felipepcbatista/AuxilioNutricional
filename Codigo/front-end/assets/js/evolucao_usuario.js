async function buscarDados() {
  const resposta = await fetch("https://auxilionutricional.onrender.com");
  const dados = await resposta.json();
  return dados.sort((a, b) => a.data.localeCompare(b.data));
}

async function atualizarGrafico() {
  const dados = await buscarDados();
  const pontos = document.getElementById("pontos");
  const linha = document.getElementById("linha");
  const area = document.getElementById("area");
  const datas = document.getElementById("datas");
  const eixoY = document.getElementById("eixoY");

  pontos.innerHTML = "";
  datas.innerHTML = "";
  eixoY.innerHTML = "";

  const largura = 500;
  const alturaUtil = 200;      // Altura útil do gráfico
  const x0 = 50;
  const y0 = 250;              // Base inferior (onde o Y=0 no gráfico)
  const yMin = 0;              // Valor mínimo do eixo Y
  const yMax = 150;            // Valor máximo do eixo Y

  const passoX = largura / (dados.length - 1);
  const pontosLinha = [];
  let areaFechada = "";

  // === CRIAÇÃO DAS LINHAS DE GRADE E LABELS DO EIXO Y ===
  const numLinhas = 5;  // Marcações: 0, 30, 60, 90, 120, 150
  for (let i = 0; i <= numLinhas; i++) {
    const valor = yMin + ((yMax - yMin) / numLinhas) * i;
    const y = y0 - (i / numLinhas) * alturaUtil;

    eixoY.innerHTML += `<line x1="${x0}" y1="${y}" x2="${x0 + largura}" y2="${y}" stroke="#9F2B00" stroke-width="1" stroke-opacity="0.3" />`;
    eixoY.innerHTML += `<text x="${x0 - 10}" y="${y + 5}" text-anchor="end" font-size="14" fill="#051D40" font-family="Arial, Helvetica, sans-serif">${Math.round(valor)}</text>`;
  }

  // === PLOTAGEM DOS PONTOS DO GRÁFICO ===
  dados.forEach((d, i) => {
    const x = x0 + i * passoX;

    // Novo cálculo Y proporcional ao intervalo de 0 a 150 kg
    const y = y0 - ((d.peso - yMin) / (yMax - yMin)) * alturaUtil;

    pontos.innerHTML += `<circle cx="${x}" cy="${y}" r="6" fill="#008000">
      <title>Data: ${d.data}\nPeso: ${d.peso} kg</title>
    </circle>`;

    datas.innerHTML += `<text x="${x}" y="270">${d.data.slice(5)}</text>`;
    pontosLinha.push(`${x},${y}`);
  });

  linha.setAttribute("points", pontosLinha.join(" "));

  // Fechamento da área
  areaFechada = pontosLinha.concat(
    `${x0 + (dados.length - 1) * passoX},${y0}`,
    `${x0},${y0}`
  ).join(" ");
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

  await fetch("https://auxilionutricional.onrender.com", {
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
