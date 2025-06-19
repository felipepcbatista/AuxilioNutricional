document.addEventListener("DOMContentLoaded", () => {
  const receitas = {
    "frango-grelhado": {
      titulo: "Frango Grelhado com Quinoa",
      macros: ["Calorias: 350 kcal", "Proteínas: 40g", "Carboidratos: 25g", "Gorduras: 10g"],
      ingredientes: ["200g de peito de frango", "1/2 xícara de quinoa cozida", "Brócolis, cenoura e abobrinha no vapor"],
      modoPreparo: "Tempere o frango e grelhe em fogo médio. Cozinhe a quinoa conforme embalagem. Sirva com os legumes cozidos."
    },
    "omelete": {
      titulo: "Omelete de Claras com Espinafre",
      macros: ["Calorias: 150 kcal", "Proteínas: 18g", "Carboidratos: 4g", "Gorduras: 5g"],
      ingredientes: ["4 claras de ovo", "1/2 xícara de espinafre picado", "Tomate e cebola a gosto"],
      modoPreparo: "Refogue os legumes, adicione as claras batidas e cozinhe dos dois lados até dourar."
    }
  };

  const pacientes = [
    {
      nome: "João Silva",
      meta: "Perda de peso",
      historico: [85, 82, 80, 78],
      datas: ["Jan", "Fev", "Mar", "Abr"]
    },
    {
      nome: "Maria Souza",
      meta: "Ganho de massa",
      historico: [55, 57, 59, 61],
      datas: ["Jan", "Fev", "Mar", "Abr"]
    }
  ];

  const titulo = document.getElementById("titulo-receita");
  const macrosList = document.getElementById("macros-list");
  const ingredientesList = document.getElementById("ingredientes-list");
  const modoPreparo = document.getElementById("modo-preparo-text");
  const modal = new bootstrap.Modal(document.getElementById("detalhesModal"));

  document.querySelectorAll(".btn-ver-detalhes").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest("article.card");
      const chave = card.getAttribute("data-receita");
      mostrarDetalhes(chave);
    });
  });

  function mostrarDetalhes(chave) {
    const receita = receitas[chave];
    if (!receita) return;
    titulo.textContent = receita.titulo;
    macrosList.innerHTML = receita.macros.map(m => `<li>${m}</li>`).join("");
    ingredientesList.innerHTML = receita.ingredientes.map(i => `<li>${i}</li>`).join("");
    modoPreparo.textContent = receita.modoPreparo;
    modal.show();
  }

  const listaPacientes = document.getElementById("listaPacientes");
  const filtro = document.getElementById("filtroPaciente");
  const pacienteModal = new bootstrap.Modal(document.getElementById("pacienteModal"));
  const pacienteInfo = document.getElementById("pacienteInfo");

  filtro.addEventListener("input", renderizarPacientes);

  function renderizarPacientes() {
    const termo = filtro.value.toLowerCase();
    listaPacientes.innerHTML = "";

    pacientes
      .filter(p => p.nome.toLowerCase().includes(termo) || p.meta.toLowerCase().includes(termo))
      .forEach((paciente, i) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
          <span>
            <strong>${paciente.nome}</strong> <br/>
            <small class="text-muted">Meta: ${paciente.meta}</small>
          </span>
          <button class="btn btn-outline-success btn-sm" data-index="${i}">Ver histórico</button>
        `;
        listaPacientes.appendChild(li);
      });

    document.querySelectorAll("#listaPacientes button").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = btn.getAttribute("data-index");
        mostrarHistoricoPaciente(pacientes[i]);
      });
    });
  }

  function mostrarHistoricoPaciente(paciente) {
    pacienteInfo.textContent = `Histórico de ${paciente.nome} (Meta: ${paciente.meta})`;

    const ctx = document.getElementById("graficoEvolucao").getContext("2d");
    if (window.grafico) window.grafico.destroy();

    window.grafico = new Chart(ctx, {
      type: "line",
      data: {
        labels: paciente.datas,
        datasets: [{
          label: "Peso (kg)",
          data: paciente.historico,
          fill: false,
          borderColor: "green",
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        }
      }
    });

    pacienteModal.show();
  }

  renderizarPacientes();
});
