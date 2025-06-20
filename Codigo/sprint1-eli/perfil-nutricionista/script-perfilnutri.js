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

    const API_URL = 'http://localhost:3000/nutricionistas/1'; 

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

        // Carregar e exibir horários de atendimento
        displayHorarios(data.horarios_atendimento);
    }

    // Função para exibir os horários de atendimento na UI
    function displayHorarios(horarios) {
        horariosAtendimentoDiv.innerHTML = ''; // Limpa a div antes de preencher
        const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

        diasSemana.forEach(dia => {
            const diaSection = document.createElement('div');
            diaSection.classList.add('horarios-dia-section');

            const label = document.createElement('label');
            label.textContent = `${dia.charAt(0).toUpperCase() + dia.slice(1)}-feira:`; // Capitaliza o dia
            diaSection.appendChild(label);

            const horariosList = document.createElement('div');
            horariosList.classList.add('horarios-list');
            horariosList.dataset.dia = dia; // Armazena o dia para fácil acesso

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

    // Função para criar um "chip" de horário
    function createHorarioChip(dia, horario) {
        const chip = document.createElement('span');
        chip.classList.add('horario-chip');
        chip.textContent = horario;

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;'; // Ícone de "x"
        deleteBtn.onclick = () => removeHorario(dia, horario);
        chip.appendChild(deleteBtn);
        return chip;
    }

    // Função para remover um horário
    async function removeHorario(dia, horarioToRemove) {
        if (!confirm(`Tem certeza que deseja remover o horário ${horarioToRemove} de ${dia}-feira?`)) {
            return;
        }

        const horariosDoDia = currentNutricionistaData.horarios_atendimento[dia];
        if (horariosDoDia) {
            currentNutricionistaData.horarios_atendimento[dia] = horariosDoDia.filter(h => h !== horarioToRemove);
        }

        // Atualiza a UI imediatamente
        displayHorarios(currentNutricionistaData.horarios_atendimento);

        // Salva as alterações na API (UPDATE)
        await updateProfile(currentNutricionistaData);
    }

    // Evento de envio do formulário (operação UPDATE)
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProfile();
    });

    // Função para salvar o perfil (UPDATE)
    async function saveProfile() {
        const updatedData = { ...currentNutricionistaData }; // Copia os dados atuais

        updatedData.nome = document.getElementById('nome').value;
        updatedData.biografia = document.getElementById('biografia').value;
        updatedData.email = document.getElementById('email').value;
        updatedData.contato_profissional = updatedData.contato_profissional || {};
        updatedData.contato_profissional.celular = document.getElementById('celular').value;
        updatedData.contato_profissional.instagram = document.getElementById('instagram').value;

        // Capturar especializações selecionadas
        updatedData.especialidades = Array.from(especializacoesSelect.selectedOptions).map(option => option.value);

        // A foto de perfil já é atualizada no evento 'change' do input de arquivo

        await updateProfile(updatedData);
    }

    // Função para enviar os dados atualizados para a API (UPDATE)
    async function updateProfile(data) {
        try {
            const response = await fetch(API_URL, {
                method: 'PUT', // ou PATCH se for só para atualizar campos específicos
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            currentNutricionistaData = result; // Atualiza os dados locais com a resposta do servidor
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar o perfil:', error);
            alert('Não foi possível salvar as alterações. Tente novamente.');
        }
    }

    // Lógica para Upload de Foto (Simulado)
    photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePhoto.src = event.target.result;
                // Em um cenário real, você enviaria esta imagem para um servidor de arquivos
                // e armazenaria a URL retornada no db.json
                currentNutricionistaData.foto_perfil = event.target.result; // Simula o salvamento da URL
                // Não chama updateProfile aqui diretamente, pois a foto pode ser salva junto com o formulário principal
                // ou ser um UPDATE separado. Para simplicidade, assumimos que é atualizada no submit geral.
            };
            reader.readAsDataURL(file); // Lê o arquivo como uma URL de dados (base64)
        }
    });

    // Lógica do Modal para Adicionar Horário
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

        // Verifica se o horário já existe para evitar duplicatas
        if (currentNutricionistaData.horarios_atendimento[dia].includes(novoHorario)) {
            alert('Este horário já está adicionado para este dia.');
            return;
        }

        currentNutricionistaData.horarios_atendimento[dia].push(novoHorario);
        currentNutricionistaData.horarios_atendimento[dia].sort(); // Opcional: ordenar horários

        displayHorarios(currentNutricionistaData.horarios_atendimento); // Atualiza a UI
        await updateProfile(currentNutricionistaData); // Salva no backend
        addHorarioModal.style.display = 'none'; // Fecha o modal
        horaInicioInput.value = '';
        horaFimInput.value = '';
    });

    // Carrega os dados quando a página é carregada
    loadNutricionistaData();
});