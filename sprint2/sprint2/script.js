document.addEventListener('DOMContentLoaded', function () {
  // Inicializa as barras de progresso
  atualizarProgresso();

  // Adiciona eventos para todos os botões "Adicionar"
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = btn.nextElementSibling;
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
  });

  // Adiciona eventos para todos os botões "Salvar"
  document.querySelectorAll('.save-btn').forEach(saveBtn => {
    saveBtn.addEventListener('click', () => {
      const form = saveBtn.parentElement;
      const input = form.querySelector('input');
      const quantidade = parseFloat(input.value);

      if (isNaN(quantidade) || quantidade <= 0) {
        alert('Por favor, insira uma quantidade válida!');
        return;
      }

      const goalDiv = form.parentElement;
      const atualSpan = goalDiv.querySelector('p span');
      let atual = parseFloat(atualSpan.innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));
      atual += quantidade;

      // Atualiza o texto
      const tipo = goalDiv.dataset.tipo;
      if (tipo === 'agua') {
        atualSpan.innerText = atual.toFixed(1) + ' l';
      } else if (tipo === 'calorias') {
        atualSpan.innerText = atual.toFixed(0) + ' kcal';
      }

      // Atualiza a barra de progresso
      atualizarProgresso(goalDiv);

      // Oculta o formulário e limpa o campo
      form.style.display = 'none';
      input.value = '';
    });
  });
});

function atualizarProgresso(goalDiv = null) {
  const goals = goalDiv ? [goalDiv] : document.querySelectorAll('.goal');

  goals.forEach(goal => {
    const atual = parseFloat(goal.querySelector('p span').innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));
    const meta = parseFloat(goal.querySelectorAll('p span')[1].innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));
    let progresso = (atual / meta) * 100;
    progresso = Math.max(0, Math.min(100, progresso));
    goal.querySelector('.progress').style.width = progresso + '%';
  });
}
