const perfis = [
    { nome: "Dra. Ana Souza", especializacao: "Nutrição Clínica", descricao: "Experiência em emagrecimento saudável e reeducação alimentar." },
    { nome: "Dr. Bruno Lima", especializacao: "Nutrição Esportiva", descricao: "Foco em desempenho esportivo e hipertrofia muscular." },
    { nome: "Dra. Carla Mendes", especializacao: "Nutrição Funcional", descricao: "Atendimento com foco em saúde intestinal e imunidade." },
    { nome: "Dr. Diego Castro", especializacao: "Nutrição Vegana", descricao: "Especialista em alimentação baseada em plantas." }
  ];
  
  let perfilAtual = 0, nutricionistaSelecionado = null;
  let selectedDay = null, selectedHorario = null;
  const diasSemana = ["DOMINGO","SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO"];
  const feriadosFixos = ['01/01','21/04','01/05','07/09','12/10','02/11','15/11','25/12'];
  const monthYearElement = document.getElementById('month-year');
  const calendarTable = document.getElementById('calendar-table');
  const weekdayElement = document.getElementById('weekday');
  const resultadoElement = document.getElementById('resultado');
  let currentDate = new Date();
  
  function alterarPerfil(d) {
    perfilAtual = (perfilAtual + d + perfis.length) % perfis.length;
    const p = perfis[perfilAtual];
    document.getElementById("nomeNutri").textContent = p.nome;
    document.getElementById("especializacaoNutri").innerHTML = "<strong>Especialização:</strong> " + p.especializacao;
    document.getElementById("descricaoNutri").textContent = p.descricao;
  }
  
  function selecionarNutricionista() {
    nutricionistaSelecionado = perfis[perfilAtual];
    document.getElementById("nutriSelecionadoTexto").textContent = "Selecionado: " + nutricionistaSelecionado.nome;
  }
  
  function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthNames = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
    monthYearElement.textContent = `${monthNames[month]} ${year}`;
    let tableHTML = '<tr><td>D</td><td>S</td><td>T</td><td>Q</td><td>Q</td><td>S</td><td>S</td></tr><tr>';
    for (let i = 0; i < firstDay; i++) tableHTML += '<td></td>';
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSunday = dateObj.getDay() === 0;
      const diaMes = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`;
      const isFeriado = feriadosFixos.includes(diaMes);
      const disabled = isPast || isSunday || isFeriado;
      const className = disabled ? 'disabled' : '';
      const onclick = disabled ? '' : `onclick="selectDay(this, ${dateObj.getDay()})"`;
      tableHTML += `<td class="${className}" ${onclick}>${day}</td>`;
      if ((firstDay + day) % 7 === 0) tableHTML += '</tr><tr>';
    }
    tableHTML += '</tr>';
    calendarTable.innerHTML = tableHTML;
  }
  
  function selectDay(td, weekdayIndex) {
    document.querySelectorAll('#calendar-table td').forEach(cell => cell.classList.remove('selected'));
    if (td.textContent.trim()) {
      td.classList.add('selected');
      selectedDay = td.textContent;
      weekdayElement.textContent = diasSemana[weekdayIndex];
    }
  }
  
  function selectHorario(p) {
    document.querySelectorAll('#horarios-list p').forEach(h => h.classList.remove('selected'));
    p.classList.add('selected');
    selectedHorario = p.textContent;
  }
  
  function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    updateCalendar();
  }
  
  function confirmarAgendamento() {
    if (selectedDay && selectedHorario && nutricionistaSelecionado) {
      const mesAno = monthYearElement.textContent;
      resultadoElement.textContent = `Consulta com ${nutricionistaSelecionado.nome} agendada para dia ${selectedDay} de ${mesAno}, às ${selectedHorario} (${weekdayElement.textContent})`;
      document.getElementById("cancelarBtn").style.display = "inline-block";
    } else if (!nutricionistaSelecionado) {
      resultadoElement.textContent = 'Por favor, selecione um nutricionista.';
    } else {
      resultadoElement.textContent = 'Por favor, selecione um dia e horário.';
    }
  }
  
  function cancelarAgendamento() {
    selectedDay = null;
    selectedHorario = null;
    document.querySelectorAll('#calendar-table td').forEach(cell => cell.classList.remove('selected'));
    document.querySelectorAll('#horarios-list p').forEach(p => p.classList.remove('selected'));
    resultadoElement.textContent = "Nenhum agendamento ainda.";
    weekdayElement.textContent = "Selecione um dia";
    document.getElementById("nutriSelecionadoTexto").textContent = "";
    nutricionistaSelecionado = null;
    document.getElementById("cancelarBtn").style.display = "none";
  }
  
  // Sistema de Feedbacks com localStorage
  
  let feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [
    { nome: "Maria Ferreira", texto: "A Dra. Ana me ajudou a mudar completamente meus hábitos. Super atenciosa!" },
    { nome: "Lucas Oliveira", texto: "O Dr. Bruno é excelente! Me passou um plano alimentar muito eficiente para meus treinos." },
    { nome: "Juliana Rocha", texto: "Adorei o atendimento da Dra. Carla. Muito humana e esclarecedora." },
    { nome: "Thiago Mendes", texto: "Já consultei com o Dr. Diego duas vezes. Me adaptei super bem à dieta vegana." }
  ];
  
  function salvarFeedbacks() {
    localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
  }
  
  function renderizarFeedbacks() {
    const lista = document.getElementById("listaFeedbacks");
    lista.innerHTML = "";
    feedbacks.forEach((fb, index) => {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${fb.nome}:</strong> “${fb.texto}” `
      lista.appendChild(p);
    });
  }
  
  function adicionarFeedback() {
    const nome = document.getElementById("feedbackNome").value.trim();
    const texto = document.getElementById("feedbackTexto").value.trim();
    if (!nome || !texto) {
      alert("Por favor, preencha o nome e o comentário.");
      return;
    }
    feedbacks.push({ nome: nome, texto: texto });
    salvarFeedbacks();
    renderizarFeedbacks();
    document.getElementById("feedbackNome").value = "";
    document.getElementById("feedbackTexto").value = "";
  }
  
  // Inicializa tudo
  updateCalendar();
  renderizarFeedbacks();