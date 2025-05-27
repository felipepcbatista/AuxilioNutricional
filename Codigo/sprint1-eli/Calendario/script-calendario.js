document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM totalmente carregado. Iniciando script-calendario.js...");

    const currentWeekRangeElement = document.getElementById('currentWeekRange');
    
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');

    const calendarGrid = document.querySelector('.calendar-grid');
    const timeColumn = calendarGrid.querySelector('.time-column');

    const appointmentModal = document.getElementById('appointmentModal');
    const modalTitle = document.getElementById('modalTitle');
    const closeButton = document.querySelector('.close-button');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentIdInput = document.getElementById('appointmentId');
    const patientNameInput = document.getElementById('patientName');
    const appointmentDateInput = document.getElementById('appointmentDate');
    const appointmentTimeSelect = document.getElementById('appointmentTime');
    const appointmentNotesTextarea = document.getElementById('appointmentNotes');
    const saveAppointmentBtn = document.getElementById('saveAppointmentBtn');
    const cancelAppointmentBtn = document.getElementById('cancelAppointmentBtn');
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let appointments = [

    ];

    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay(); 
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
        const start = new Date(d.setDate(diff));
        start.setHours(0, 0, 0, 0);
        return start;
    }

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function formatToIsoDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function generateTimeSlots() {
        const times = [];
        for (let hour = 9; hour <= 20; hour++) {
            times.push(`${String(hour).padStart(2, '0')}:00`);
        }
        return times;
    }

    const timeSlots = generateTimeSlots();

    function populateTimeColumn() {
        timeColumn.innerHTML = '<div class="time-header">Horários</div>';
        timeSlots.forEach(time => {
            const timeSlotDiv = document.createElement('div');
            timeSlotDiv.classList.add('time-slot');
            timeSlotDiv.textContent = time;
            timeColumn.appendChild(timeSlotDiv);
        });
    }

    function populateAppointmentTimeSelect() {
        appointmentTimeSelect.innerHTML = '';
        timeSlots.forEach(slotTime => {
            const option = document.createElement('option');
            option.value = slotTime;
            option.textContent = slotTime;
            appointmentTimeSelect.appendChild(option);
        });
    }


    function renderCalendar() {
        console.log("Renderizando calendário...");
        calendarGrid.querySelectorAll('.day-column:not(.time-column)').forEach(dayCol => {
            dayCol.querySelectorAll('.appointment-slot').forEach(slot => slot.remove());
        });

        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        currentWeekRangeElement.textContent = `Semana de ${formatDate(startOfWeek)} a ${formatDate(endOfWeek)}`;

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            const isoDate = formatToIsoDate(day);
            const dayOfWeek = day.getDay();

            const dayColumn = calendarGrid.querySelector(`.day-column[data-day="${dayOfWeek}"]`);
            
            const dayHeader = dayColumn.querySelector('.day-header');
            const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            dayHeader.innerHTML = `${dayNames[dayOfWeek]}<span>${formatDate(day)}</span>`; 

            timeSlots.forEach(time => {
                const appointmentSlotDiv = document.createElement('div');
                appointmentSlotDiv.classList.add('appointment-slot');
                appointmentSlotDiv.dataset.date = isoDate;
                appointmentSlotDiv.dataset.time = time;
                appointmentSlotDiv.textContent = '';
                appointmentSlotDiv.addEventListener('click', (event) => openModalForSlot(event, day));

                const existingAppointment = appointments.find(app =>
                    app.date === isoDate && app.time === time
                );

                if (existingAppointment) {
                    appointmentSlotDiv.classList.add('has-appointment');
                    appointmentSlotDiv.dataset.appointmentId = existingAppointment.id;
                    appointmentSlotDiv.innerHTML = `<span>${existingAppointment.patientName}</span>`;
                }

                dayColumn.appendChild(appointmentSlotDiv);
            });
        }
    }

    function openModal(appointment = null, date = null, time = null) {
        console.log("Abrindo modal...");
        populateAppointmentTimeSelect();
        appointmentForm.reset();

        if (appointment) {
            modalTitle.textContent = 'Detalhes da Consulta';
            appointmentIdInput.value = appointment.id;
            patientNameInput.value = appointment.patientName;
            appointmentDateInput.value = appointment.date;
            appointmentTimeSelect.value = appointment.time;
            appointmentNotesTextarea.value = appointment.notes || '';
            cancelAppointmentBtn.style.display = 'inline-block';
        } else {
            modalTitle.textContent = 'Agendar Nova Consulta';
            appointmentIdInput.value = '';
            cancelAppointmentBtn.style.display = 'none';
            if (date) appointmentDateInput.value = formatToIsoDate(date);
            if (time) appointmentTimeSelect.value = time;
        }

        appointmentModal.style.display = 'none';
        appointmentModal.classList.add('show'); 
    }

    function openModalForSlot(event, day) {
        console.log("Slot clicado:", event.currentTarget);
        const slot = event.currentTarget;
        const appointmentId = slot.dataset.appointmentId;
        const slotDate = slot.dataset.date;
        const slotTime = slot.dataset.time;

        if (appointmentId) {
            const appointment = appointments.find(app => app.id === appointmentId);
            if (appointment) {
                openModal(appointment);
            }
        } else {
            openModal(null, new Date(slotDate + 'T00:00:00'), slotTime);
        }
    }

    function closeAppointmentModal() {
        console.log("Fechando modal...");
        appointmentModal.classList.remove('show');
        setTimeout(() => {
            appointmentModal.style.display = 'none';
        }, 300); 
        appointmentForm.reset();
        appointmentIdInput.value = '';
    }

    prevWeekBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 7);
        renderCalendar();
    });

    nextWeekBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 7);
        renderCalendar();
    });

    addAppointmentBtn.addEventListener('click', () => {
        openModal();
    });

    if (closeButton) {
        closeButton.addEventListener('click', closeAppointmentModal);
    } else {
        console.error("Botão de fechar (X) não encontrado no DOM.");
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeAppointmentModal);
    } else {
        console.error("Botão 'Fechar' (do modal) não encontrado no DOM.");
    }

    window.addEventListener('click', (event) => {
        if (event.target === appointmentModal) {
            closeAppointmentModal();
        }
    });

    cancelAppointmentBtn.addEventListener('click', () => {
        const appointmentId = appointmentIdInput.value;
        if (appointmentId && confirm('Tem certeza que deseja cancelar esta consulta?')) {
            appointments = appointments.filter(app => app.id !== appointmentId);
            alert('Consulta cancelada com sucesso!');
            closeAppointmentModal();
            renderCalendar();
        }
    });

    appointmentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const id = appointmentIdInput.value || `a${Date.now()}`;
        const patientName = patientNameInput.value;
        const date = appointmentDateInput.value;
        const time = appointmentTimeSelect.value;
        const notes = appointmentNotesTextarea.value;

        if (!patientName || !date || !time) {
            alert('Por favor, preencha todos os campos obrigatórios (Nome, Data, Horário).');
            return;
        }

        const existingIndex = appointments.findIndex(app => app.id === id);
        if (existingIndex > -1) {
            appointments[existingIndex] = { id, patientName, date, time, notes };
        } else {
            appointments.push({ id, patientName, date, time, notes });
        }
        
        alert(`Consulta de ${patientName} em ${formatDate(new Date(date + 'T00:00:00'))} às ${time} ${existingIndex > -1 ? 'atualizada' : 'agendada'} com sucesso!`);
        closeAppointmentModal();
        renderCalendar();
    });

    populateTimeColumn();
    renderCalendar();
    
    closeAppointmentModal(); 
    console.log("Inicialização completa. Modal deve estar fechado.");
});