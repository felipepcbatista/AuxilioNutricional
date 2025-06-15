const apiUrl = "http://localhost:3000/metas";

document.addEventListener('DOMContentLoaded', async function () {
  await carregarMetas();

  // Adiciona eventos para todos os botões "Adicionar"
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = btn.nextElementSibling;
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
  });

  // Adiciona eventos para todos os botões "Salvar"
  document.querySelectorAll('.save-btn').forEach(saveBtn => {
    saveBtn.addEventListener('click', async () => {
      const form = saveBtn.parentElement;
      const input = form.querySelector('input');
      const quantidade = parseFloat(input.value);

      if (isNaN(quantidade) || quantidade <= 0) {
        alert('Por favor, insira uma quantidade válida!');
        return;
      }

      const goalDiv = form.parentElement;
      const tipo = goalDiv.dataset.tipo;

      try {
        // Pega os dados atuais do servidor
        const res = await fetch(apiUrl);
        const metas = await res.json();

        let atual = metas[tipo].atual || 0;
        atual += quantidade;

        // Atualiza o JSON Server via PATCH
        await fetch(apiUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [tipo]: {
              ...metas[tipo],
              atual: atual
            }
          })
        });

        // Atualiza a interface local
        await carregarMetas();

        // Oculta o formulário e limpa o campo
        form.style.display = 'none';
        input.value = '';
      } catch (err) {
        console.error("Erro ao atualizar meta", err);
        alert("Erro ao salvar a meta. Tente novamente.");
      }
    });
  });
});

async function carregarMetas() {
  try {
    const res = await fetch(apiUrl);
    const metas = await res.json();

    // Atualiza os textos e progressos
    atualizarMetaUI('peso', metas.peso.atual, metas.peso.meta, 'kg');
    atualizarMetaUI('calorias', metas.calorias.atual, metas.calorias.meta, 'kcal');
    atualizarMetaUI('agua', metas.agua.atual, metas.agua.meta, 'l');
  } catch (err) {
    console.error("Erro ao carregar metas", err);
  }
}

function atualizarMetaUI(tipo, atual, meta, unidade) {
  const goalDiv = document.querySelector(`.goal[data-tipo="${tipo}"]`);
  if (!goalDiv) return;

  const spans = goalDiv.querySelectorAll('p span');
  spans[0].innerText = (tipo === 'agua' ? atual.toFixed(1) : Math.round(atual)) + ' ' + unidade;
  spans[1].innerText = (tipo === 'agua' ? meta.toFixed(1) : Math.round(meta)) + ' ' + unidade;

  let progresso = (atual / meta) * 100;
  progresso = Math.min(Math.max(progresso, 0), 100);
  goalDiv.querySelector('.progress').style.width = progresso + '%';
}
