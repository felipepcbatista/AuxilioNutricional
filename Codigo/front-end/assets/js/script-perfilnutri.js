document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroNutriForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        const novoNutricionista = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            cpf: document.getElementById('cpf').value,
            crn: document.getElementById('crn').value,
            celular: document.getElementById('celular').value,
            senha: senha
        };

        try {
            const response = await fetch('http://localhost:3001/nutricionistas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novoNutricionista)
            });

            if (response.ok) {
                alert('Nutricionista cadastrado com sucesso!');
                window.location.href = '/login';  // Redireciona para a página de login
            } else {
                const errorData = await response.json();
                console.error('Erro ao cadastrar:', errorData);
                alert('Erro ao cadastrar nutricionista. Veja o console.');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro ao conectar com o servidor.');
        }
    });
});