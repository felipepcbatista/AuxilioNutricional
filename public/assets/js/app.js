document.addEventListener('DOMContentLoaded', function () {
    // ----------- Hidratação ----------
    const dataAtualElement = document.getElementById('data-atual');
    const addAguaButton = document.getElementById('add-agua');
    const aguaProgresso = document.getElementById('agua-progresso');
    const aguaQtd = document.getElementById('agua-quantia');
    const menosAguaButton = document.getElementById('menos-agua');

    const hoje = new Date();
    if (dataAtualElement) dataAtualElement.textContent = hoje.toLocaleDateString('pt-BR');

    if (addAguaButton) {
        addAguaButton.addEventListener('click', function () {
            const qtdAtualAgua = parseInt(aguaProgresso.value) || 0;
            const novaQtdAgua = qtdAtualAgua + 250;
            aguaProgresso.value = novaQtdAgua;
            aguaQtd.textContent = `${novaQtdAgua} ml`;
        });
    }

    if (menosAguaButton) {
        menosAguaButton.addEventListener('click', function () {
            const qtdAtualAgua = parseInt(aguaProgresso.value) || 0;
            const novaQtdAgua = Math.max(qtdAtualAgua - 250, 0);
            aguaProgresso.value = novaQtdAgua;
            aguaQtd.textContent = `${novaQtdAgua} ml`;
        });
    }

    let alimentos = [];
    let selectedFood = null;

    const foodNameElement = document.getElementById('food-name');
    const foodNameInput = document.getElementById('food-name');
    const foodImage = document.getElementById('food-image');
    const foodQuantityInput = document.getElementById('food-quantity');
    const foodCaloriesSpan = document.getElementById('food-calories');
    const foodPortionSpan = document.getElementById('food-portion');
    const foodCarbsSpan = document.getElementById('food-carbs');
    const foodProteinSpan = document.getElementById('food-protein');
    const foodFatSpan = document.getElementById('food-fat');
    const confirmAddBtn = document.getElementById('confirm-add');
    const voltarBtn = document.getElementById('voltar');
    const foodSuggestions = document.getElementById('food-suggestions');
    const searchInput = document.getElementById('searchInput');
    const foodFavoriteCheckbox = document.getElementById('food-favorite');

    // ----------- Função de Remoção de Acentos para Busca ----------
    function removerAcentos(texto) {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // ----------- Renderizar Sugestões ----------
    function renderFoodSuggestions(lista) {
        if (!foodSuggestions) return;
        foodSuggestions.innerHTML = '';

        if (!Array.isArray(lista)) {
            console.error('Lista de alimentos não é um array:', lista);
            foodSuggestions.innerHTML = '<p>Erro ao carregar alimentos.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'food-list';

        lista.forEach(food => {
            const li = document.createElement('li');
            li.className = 'food-item';

            const btn = document.createElement('button');
            btn.className = 'food-btn';
            btn.dataset.id = food.id;

            btn.innerHTML = `
                <span class="food-name">${food.nome}</span>
                <span class="add-icon">+</span>
            `;

            li.appendChild(btn);
            ul.appendChild(li);
        });

        foodSuggestions.appendChild(ul);

        document.querySelectorAll('.food-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const foodId = this.dataset.id;
                window.location.href = 'adicionar_alimentos.html?id=' + foodId;
            });
        });
    }

    // ----------- Atualiza Valores Nutricionais ----------
    function updateNutritionValues() {
        if (!selectedFood) return;

        const quantity = parseFloat(foodQuantityInput.value);
        const ratio = (!isNaN(quantity) && quantity > 0) ? (quantity / 100) : 0;

        if (foodCaloriesSpan) {
            foodCaloriesSpan.textContent = (selectedFood.calorias * ratio).toFixed(1);
        }
        if (foodCarbsSpan) {
            foodCarbsSpan.textContent = (selectedFood.macronutrientes.carboidratos * ratio).toFixed(1);
        }
        if (foodProteinSpan) {
            foodProteinSpan.textContent = (selectedFood.macronutrientes.proteinas * ratio).toFixed(1);
        }
        if (foodFatSpan) {
            foodFatSpan.textContent = (selectedFood.macronutrientes.gorduras * ratio).toFixed(1);
        }
        if (foodPortionSpan) {
            foodPortionSpan.textContent = ratio > 0 ? ratio.toFixed(1) : '0';
        }
    }

    // ----------- Eventos Gerais ----------
    if (foodQuantityInput) {
        foodQuantityInput.addEventListener('input', updateNutritionValues);
    }

    if (confirmAddBtn) {
        confirmAddBtn.addEventListener('click', function () {
            alert('Alimento adicionado com sucesso!');
            window.location.href = 'registrar_alimentos.html';
        });
    }

    if (voltarBtn) {
        voltarBtn.addEventListener('click', function () {
            window.location.href = 'registrar_alimentos.html';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const term = removerAcentos(this.value.toLowerCase());

            const filtered = alimentos.filter(food => {
                const nomeSemAcento = removerAcentos(food.nome.toLowerCase());
                return nomeSemAcento.includes(term);
            });

            renderFoodSuggestions(filtered);
        });
    }

    // ----------- Carregar Dados se for Tela de Adicionar Alimento ----------
    if (window.location.pathname.includes('adicionar_alimentos')) {
        const urlParams = new URLSearchParams(window.location.search);
        const foodId = urlParams.get('id');

        fetch('/api/alimentos')
            .then(res => res.json())
            .then(data => {
                alimentos = data;
                selectedFood = alimentos.find(f => f.id == foodId);

                if (selectedFood) {
                    if (foodNameElement) foodNameElement.textContent = selectedFood.nome;
                    if (foodNameInput) foodNameInput.value = selectedFood.nome;
                    if (foodImage) {
                        foodImage.src = selectedFood.imagem 
                            ? `/assets/images/${selectedFood.imagem}` 
                            : '/assets/images/default.png';
                        foodImage.style.display = 'block';
                    }
                    updateNutritionValues();
                }
            })
            .catch(err => console.error('Erro ao carregar alimento:', err));
    }

    // ----------- Carregar Lista se for Tela de Registrar Alimentos ----------
    if (window.location.pathname.includes('registrar_alimentos')) {
        fetch('/api/alimentos')
            .then(res => res.json())
            .then(data => {
                alimentos = data;
                renderFoodSuggestions(alimentos);
            })
            .catch(err => console.error('Erro ao carregar alimentos:', err));
    }
});
