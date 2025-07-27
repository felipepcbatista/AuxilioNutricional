document.addEventListener('DOMContentLoaded', () => {
    console.log(document.getElementById('senha'));
    const form = document.getElementById('form');

    if (!form) {
  console.error('Formulário não encontrado!');
  return;
}

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const objetivo = document.getElementById('objetivo').value;
        const sexo = document.getElementById('sexo').value;
        const altura = parseInt(document.getElementById('altura').value);
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;

        // Validação de senha
        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem. Por favor, verifique.');
            return;
        }

        const novoUsuario = {
            nome,
            email,
            objetivo,
            sexo,
            altura,
            idade,
            senha
        };

        try {
            const response = await fetch('https://auxilionutricional.onrender.com/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novoUsuario)
            });

            if (response.ok) {
                alert('Usuário cadastrado com sucesso!');
                window.location.href = 'login.html';
            } else {
                alert('Erro ao cadastrar usuário. Tente novamente.');
                console.error('Erro:', await response.text());
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Erro ao conectar com o servidor.');
        }
    });
});
