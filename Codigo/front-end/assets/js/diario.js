document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const refeicaoSelecionada = urlParams.get('refeicao') || 'Todas';

    // ----------- Hidratação ----------
    const dataAtualElement = document.getElementById('data-atual');
    const addAguaButton = document.getElementById('add-agua');
    const aguaProgresso = document.getElementById('agua-progresso');
    const aguaQtd = document.getElementById('agua-quantia');
    const menosAguaButton = document.getElementById('menos-agua');

    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split('T')[0];
    const chaveAgua = `aguaConsumida-${hojeFormatado}`;
    if (dataAtualElement) dataAtualElement.textContent = hoje.toLocaleDateString('pt-BR');
    // Carregar valor salvo da água
    const aguaSalva = parseInt(localStorage.getItem(chaveAgua)) || 0;
    if (aguaProgresso && aguaQtd) {
        aguaProgresso.value = aguaSalva;
        aguaQtd.textContent = `${aguaSalva} ml`;
}

    if (addAguaButton) {
    addAguaButton.addEventListener('click', function () {
        const qtdAtualAgua = parseInt(aguaProgresso.value) || 0;
        const novaQtdAgua = qtdAtualAgua + 250;
        aguaProgresso.value = novaQtdAgua;
        aguaQtd.textContent = `${novaQtdAgua} ml`;
        salvarAguaLocalStorage(novaQtdAgua);
    });
}

    if (menosAguaButton) {
        menosAguaButton.addEventListener('click', function () {
            const qtdAtualAgua = parseInt(aguaProgresso.value) || 0;
            const novaQtdAgua = Math.max(qtdAtualAgua - 250, 0);
            aguaProgresso.value = novaQtdAgua;
            aguaQtd.textContent = `${novaQtdAgua} ml`;
            salvarAguaLocalStorage(novaQtdAgua);
    });
}

    function salvarAguaLocalStorage(qtd) {
    localStorage.setItem(chaveAgua, qtd);
}

    let alimentos = [];
    let selectedFood = null;

    // ----------- Dados Nutricionais ----------
    let metaDiaria = 2000;
    let dadosNutricionais = {
        total: {
            calorias: 0,
            carboidratos: 0,
            proteinas: 0,
            gorduras: 0
        }
    };

    // ----------- Carregar Dados Salvos ----------
function carregarDadosSalvos() {
    const registrosSalvos = localStorage.getItem('alimentosConsumidos');
    console.log("Registros brutos do localStorage:", registrosSalvos);
    
    const registros = JSON.parse(registrosSalvos) || [];
    console.log("Registros parseados:", registros);

    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split('T')[0];
    console.log("Data de hoje formatada:", hojeFormatado);

    // Resetar dados
    dadosNutricionais = {
        total: { calorias: 0, carboidratos: 0, proteinas: 0, gorduras: 0 },
        refeicoes: {
            "Café da manhã": { calorias: 0, carboidratos: 0, proteinas: 0, gorduras: 0 },
            "Almoço": { calorias: 0, carboidratos: 0, proteinas: 0, gorduras: 0 },
            "Jantar": { calorias: 0, carboidratos: 0, proteinas: 0, gorduras: 0 },
            "Lanches": { calorias: 0, carboidratos: 0, proteinas: 0, gorduras: 0 }
        }
    };

    // Processar cada registro
    registros.forEach((registro, index) => {
        console.log(`Processando registro ${index}:`, registro);
        
        if (!registro.data) {
            console.warn("Registro sem data:", registro);
            return;
        }

        // Converter data do registro para comparar
        const dataRegistro = new Date(registro.data);
        const dataRegistroFormatada = dataRegistro.toISOString().split('T')[0];

        const refeicao = registro.refeicao || "Lanches";


        const calorias = parseFloat(registro.calorias || registro.calories || 0);
        const carboidratos = parseFloat(registro.carboidratos || registro.carbohydrates || 0);
        const proteinas = parseFloat(registro.proteinas || registro.proteins || 0);
        const gorduras = parseFloat(registro.gorduras || registro.fats || 0);

        console.log(`Valores nutricionais do registro ${index}:`, {
            calorias, carboidratos, proteinas, gorduras
        });

        // Atualizar totais
        dadosNutricionais.total.calorias += calorias;
        dadosNutricionais.total.carboidratos += carboidratos;
        dadosNutricionais.total.proteinas += proteinas;
        dadosNutricionais.total.gorduras += gorduras;
    });

    atualizarTotais();
}

// ----------- Atualizar Interface ----------
function atualizarTotais() {
    // Atualizar totais gerais
    document.getElementById('calorias-consumidas').textContent = Math.round(dadosNutricionais.total.calorias);
    document.getElementById('calorias-restantes').textContent = Math.max(0, metaDiaria - dadosNutricionais.total.calorias);
    document.getElementById('total-carboidratos').textContent = Math.round(dadosNutricionais.total.carboidratos) + 'g';
    document.getElementById('total-proteinas').textContent = Math.round(dadosNutricionais.total.proteinas) + 'g';
    document.getElementById('total-gorduras').textContent = Math.round(dadosNutricionais.total.gorduras) + 'g';
}

    // Elementos do formulário de alimento
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
                window.location.href = `adicionar_alimentos?id=${foodId}&refeicao=${refeicaoSelecionada}.html`;
            });
        });
    }

    // ----------- Atualiza Valores Nutricionais ----------
    function updateNutritionValues() {
        if (!selectedFood) return;

        const quantity = parseFloat(foodQuantityInput.value);
        const ratio = (!isNaN(quantity) && quantity > 0) ? (quantity / 100) : 0;

        if (foodCaloriesSpan)
            foodCaloriesSpan.textContent = (selectedFood.calorias * ratio).toFixed(1);
        if (foodCarbsSpan) 
            foodCarbsSpan.textContent = (selectedFood.macronutrientes.carboidratos * ratio).toFixed(1);
        if (foodProteinSpan) 
            foodProteinSpan.textContent = (selectedFood.macronutrientes.proteinas * ratio).toFixed(1);
        if (foodFatSpan) 
            foodFatSpan.textContent = (selectedFood.macronutrientes.gorduras * ratio).toFixed(1);
        if (foodPortionSpan) 
            foodPortionSpan.textContent = ratio > 0 ? ratio.toFixed(1) : '0';       
    }

    // ----------- Eventos Gerais ----------
    if (foodQuantityInput) {
        foodQuantityInput.addEventListener('input', updateNutritionValues);
    }

    if (confirmAddBtn) {
        confirmAddBtn.addEventListener('click', function () {
            if (selectedFood) {
                const quantidade = parseFloat(foodQuantityInput.value) || 100;
                const ratio = quantidade / 100;
                
                const novoRegistro = {
                    nome: selectedFood.nome,
                    quantidade: quantidade,
                    refeicao: refeicaoSelecionada,
                    calorias: (selectedFood.calorias * ratio).toFixed(1),
                    carboidratos: (selectedFood.macronutrientes.carboidratos * ratio).toFixed(1),
                    proteinas: (selectedFood.macronutrientes.proteinas * ratio).toFixed(1),
                    gorduras: (selectedFood.macronutrientes.gorduras * ratio).toFixed(1),
                    data: new Date().toISOString()
                };

                // Salva no localStorage
                let registros = JSON.parse(localStorage.getItem('alimentosConsumidos')) || [];
                registros.push(novoRegistro);
                localStorage.setItem('alimentosConsumidos', JSON.stringify(registros));

                window.location.href = `diario_alimentar.html`;
            }
        });
    }
    if (voltarBtn) {
        voltarBtn.addEventListener('click', function () {
            window.location.href = `registrar_alimentos?refeicao=${refeicaoSelecionada}.html`;
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
    if (window.location.pathname.includes('adicionar_alimentos.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const foodId = urlParams.get('id');

        fetch('https://auxilionutricional.onrender.com/api/alimentos')
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
    if (window.location.pathname.includes('registrar_alimentos.html')) {
    fetch('https://auxilionutricional.onrender.com/api/alimentos')
        .then(res => res.json())
        .then(data => {
            alimentos = data;
            renderFoodSuggestions(alimentos);
            
            if (document.getElementById('calorias-consumidas')) {
                carregarDadosSalvos();
            }
        })
        .catch(err => console.error('Erro ao carregar alimentos:', err));
    }


    if (window.location.pathname.includes('diario_alimentar.html')) {
        carregarDadosSalvos();
        
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                carregarDadosSalvos();
            }
        });
    }
});


