document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profileForm');
    const profilePhoto = document.getElementById('profilePhoto');
    const photoUpload = document.getElementById('photoUpload');
    const especializacoesSelect = document.getElementById('especializacoes');
    const horariosAtendimentoDiv = document.getElementById('horariosAtendimento');
    const openAddHorarioModalBtn = document.getElementById('openAddHorarioModal');
    const addHorarioModal = document.getElementById('addHorarioModal');
    const closeButton = addHorarioModal.querySelector('.close-button');
    const diaSemanaSelect = document.getElementById('diaSemana');
    const horaInicioInput = document.getElementById('horaInicio');
    const horaFimInput = document.getElementById('horaFim');
    const saveNewHorarioBtn = document.getElementById('saveNewHorario');

    const API_URL = 'https://auxilionutricional.onrender.com'; 
    let currentNutricionistaData = {};

    async function loadNutricionistaData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            currentNutricionistaData = await response.json();
            fillForm(currentNutricionistaData);
        } catch (error) {
            console.error('Erro ao carregar dados do nutricionista:', error);
            alert('Não foi possível carregar os dados do perfil. Verifique se o JSON Server está rodando.');
        }
    }

    function fillForm(data) {
        document.getElementById('nome').value = data.nome || '';
        document.getElementById('biografia').value = data.biografia || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('celular').value = data.contato_profissional?.celular || '';
        document.getElementById('instagram').value = data.contato_profissional?.instagram || '';
        profilePhoto.src = data.foto_perfil || 'https://via.placeholder.com/150';

        especializacoesSelect.innerHTML = ''; 
        const defaultEspecializacoes = [
            "Nutrição Clínica", "Nutrição Esportiva", "Nutrição Materno-Infantil",
            "Nutrição Estética", "Saúde Pública", "Fitoterapia"
        ];

        defaultEspecializacoes.forEach(spec => {
            const option = document.createElement('option');
            option.value = spec;
            option.textContent = spec;
            if (data.especialidades && data.especialidades.includes(spec)) {
                option.selected = true;
            }
            especializacoesSelect.appendChild(option);
        });

        displayHorarios(data.horarios_atendimento);
    }

    function displayHorarios(horarios) {
        horariosAtendimentoDiv.innerHTML = '';
        const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

        diasSemana.forEach(dia => {
            const diaSection = document.createElement('div');
            diaSection.classList.add('horarios-dia-section');

            const label = document.createElement('label');
            label.textContent = `${dia.charAt(0).toUpperCase() + dia.slice(1)}-feira:`;
            diaSection.appendChild(label);

            const horariosList = document.createElement('div');
            horariosList.classList.add('horarios-list');
            horariosList.dataset.dia = dia;

            if (horarios && horarios[dia] && horarios[dia].length > 0) {
                horarios[dia].forEach(horario => {
                    const chip = createHorarioChip(dia, horario);
                    horariosList.appendChild(chip);
                });
            } else {
                horariosList.textContent = 'Nenhum horário definido.';
                horariosList.style.color = '#888';
                horariosList.style.fontSize = '0.9em';
            }

            diaSection.appendChild(horariosList);
            horariosAtendimentoDiv.appendChild(diaSection);
        });
    }

    function createHorarioChip(dia, horario) {
        const chip = document.createElement('span');
        chip.classList.add('horario-chip');
        chip.textContent = horario;

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.onclick = () => removeHorario(dia, horario);
        chip.appendChild(deleteBtn);
        return chip;
    }

    async function removeHorario(dia, horarioToRemove) {
        if (!confirm(`Tem certeza que deseja remover o horário ${horarioToRemove} de ${dia}-feira?`)) {
            return;
        }

        const horariosDoDia = currentNutricionistaData.horarios_atendimento[dia];
        if (horariosDoDia) {
            currentNutricionistaData.horarios_atendimento[dia] = horariosDoDia.filter(h => h !== horarioToRemove);
        }

        displayHorarios(currentNutricionistaData.horarios_atendimento);
        await updateProfile(currentNutricionistaData);
    }

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProfile();
    });

    async function saveProfile() {
        const updatedData = { ...currentNutricionistaData };

        updatedData.nome = document.getElementById('nome').value;
        updatedData.biografia = document.getElementById('biografia').value;
        updatedData.email = document.getElementById('email').value;
        updatedData.contato_profissional = updatedData.contato_profissional || {};
        updatedData.contato_profissional.celular = document.getElementById('celular').value;
        updatedData.contato_profissional.instagram = document.getElementById('instagram').value;

        updatedData.especialidades = Array.from(especializacoesSelect.selectedOptions).map(option => option.value);

        await updateProfile(updatedData);
    }

    async function updateProfile(data) {
        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            currentNutricionistaData = result;
            alert('Perfil atualizado com sucesso!');
            window.location.href = '/dashboard_nutri';
        } catch (error) {
            console.error('Erro ao salvar o perfil:', error);
            alert('Não foi possível salvar as alterações. Tente novamente.');
        }
    }

    photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePhoto.src = event.target.result;
                currentNutricionistaData.foto_perfil = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    openAddHorarioModalBtn.addEventListener('click', () => {
        addHorarioModal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        addHorarioModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == addHorarioModal) {
            addHorarioModal.style.display = 'none';
        }
    });

    saveNewHorarioBtn.addEventListener('click', async () => {
        const dia = diaSemanaSelect.value;
        const horaInicio = horaInicioInput.value;
        const horaFim = horaFimInput.value;

        if (!horaInicio || !horaFim) {
            alert('Por favor, preencha a hora de início e fim.');
            return;
        }

        const novoHorario = `${horaInicio} - ${horaFim}`;

        if (!currentNutricionistaData.horarios_atendimento) {
            currentNutricionistaData.horarios_atendimento = {};
        }
        if (!currentNutricionistaData.horarios_atendimento[dia]) {
            currentNutricionistaData.horarios_atendimento[dia] = [];
        }

        if (currentNutricionistaData.horarios_atendimento[dia].includes(novoHorario)) {
            alert('Este horário já está adicionado para este dia.');
            return;
        }

        currentNutricionistaData.horarios_atendimento[dia].push(novoHorario);
        currentNutricionistaData.horarios_atendimento[dia].sort();

        displayHorarios(currentNutricionistaData.horarios_atendimento);
        await updateProfile(currentNutricionistaData);

        addHorarioModal.style.display = 'none';
        horaInicioInput.value = '';
        horaFimInput.value = '';
    });

    loadNutricionistaData();
});

     function logout() {
  if (confirm("Deseja sair da conta?")) {
    window.location.href = "/";
  }
}

async function excluirConta() {
  const confirmacao = confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.");
  if (!confirmacao) return;

  try {
    const id = currentNutricionistaData.id;

    const resposta = await fetch(`https://auxilionutricional-backend.onrender.com/nutricionistas/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (resposta.ok) {
      alert("Conta excluída com sucesso.");
      localStorage.clear();
      window.location.href = "/";
    } else {
      alert("Erro ao excluir conta. Verifique se o servidor está rodando.");
    }
  } catch (erro) {
    console.error("Erro ao excluir conta:", erro);
    alert("Erro inesperado ao tentar excluir a conta.");
  }
}

