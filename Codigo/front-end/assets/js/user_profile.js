function carregarDados() {
  const campos = ["nickname", "peso", "altura", "objetivo", "idade"];
  campos.forEach((campo) => {
    const valor = localStorage.getItem(campo);
    const displayEl = document.getElementById(`${campo}-display`);
    const inputEl = document.getElementById(`${campo}-input`);

    if (valor !== null) {
      displayEl.textContent = valor;
      inputEl.value = valor;
    } else {
      displayEl.textContent = "-";
      inputEl.value = "";
    }
  });
}

function editarCampo(campo) {
  document.getElementById(`${campo}-display`).style.display = "none";
  document.getElementById(`${campo}-input`).style.display = "inline-block";
  document.querySelector(`#${campo}-input + .edit-icon`).style.display = "none";
  document.querySelector(`#${campo}-input + .edit-icon + .save-icon`).style.display = "inline-block";
}

function salvarCampo(campo) {
  const inputEl = document.getElementById(`${campo}-input`);
  let valor = inputEl.tagName === "SELECT" ? inputEl.value : inputEl.value.trim();

  if (["peso", "altura", "idade"].includes(campo)) {
    const num = parseFloat(valor);
    if (isNaN(num) || num < 0) {
      alert("Insira um valor válido (maior ou igual a 0).");
      return;
    }
  }

  if (valor === "") valor = "-";

  localStorage.setItem(campo, valor);

  document.getElementById(`${campo}-display`).textContent = valor;
  inputEl.style.display = "none";
  document.getElementById(`${campo}-display`).style.display = "inline";

  const editIcon = inputEl.nextElementSibling;
  const saveIcon = editIcon.nextElementSibling;
  editIcon.style.display = "inline-block";
  saveIcon.style.display = "none";
}

function logout() {
  if (confirm("Deseja sair da conta?")) {
    window.location.href = "/";
  }
}

async function excluirConta() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const id = user?.id;

  if (!id) {
    alert("Erro: ID do usuário não encontrado.");
    return;
  }

  const confirmacao = confirm("Tem certeza que deseja excluir sua conta? Essa ação é irreversível.");
  if (!confirmacao) return;

  try {
    const response = await fetch(`http://localhost:3001/usuarios/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir conta.");

    alert("Conta excluída com sucesso.");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  } catch (error) {
    console.error(error);
    alert("Erro ao excluir conta. Tente novamente.");
  }
}

window.onload = carregarDados;
