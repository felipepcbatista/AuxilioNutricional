const formulario = document.getElementById("formulario");
const resultadoDiv = document.getElementById("resultado");

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const altura = parseFloat(document.getElementById("altura").value);
  const peso = parseFloat(document.getElementById("peso").value);
  const idade = parseInt(document.getElementById("idade").value);
  const genero = document.getElementById("genero").value;
  const fatorAtividade = parseFloat(document.getElementById("atividade").value);

  const alturaM = altura / 100;
  const imc = peso / (alturaM * alturaM);

  let status = "";
  if (imc < 18.5) status = "Abaixo do peso";
  else if (imc < 25) status = "Saudável";
  else if (imc < 30) status = "Sobrepeso";
  else status = "Obesidade";

  let tmb;
  if (genero === "Masculino") {
    tmb = 66 + (13.7 * peso) + (5 * altura) - (6.8 * idade);
  } else {
    tmb = 655 + (9.6 * peso) + (1.8 * altura) - (4.7 * idade);
  }

  const tmbComAtividade = tmb * fatorAtividade;

  // Monta o objeto para salvar
  const registro = {
    altura,
    peso,
    idade,
    genero,
    fatorAtividade,
    imc: parseFloat(imc.toFixed(1)),
    status,
    tmb: Math.round(tmb),
    tmbComAtividade: Math.round(tmbComAtividade),
    data: new Date().toISOString()
  };

  try {
    // Envia o registro para o JSON Server
    const response = await fetch("http://localhost:3000/registros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registro),
    });

    if (!response.ok) throw new Error("Erro ao salvar os dados");

    resultadoDiv.style.display = "block";
    resultadoDiv.innerHTML = `
      <strong>${status === "Saudável" ? "Você está com peso saudável!" : `Você está ${status.toLowerCase()}!`}</strong><br>
      IMC: ${imc.toFixed(1)}<br>
      TMB: ${Math.round(tmb)} kcal/dia<br>
      TMB com atividade: ${Math.round(tmbComAtividade)} kcal/dia
    `;

    formulario.reset();
  } catch (error) {
    alert(error.message);
  }
});
