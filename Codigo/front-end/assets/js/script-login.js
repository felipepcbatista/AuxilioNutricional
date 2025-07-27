document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            const response = await fetch('https://auxilionutricional.onrender.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Credenciais inválidas');
            }

            const data = await response.json();

            alert(`Bem-vindo, ${data.dados.nome}! Login bem-sucedido.`);
            localStorage.setItem('loggedInUser', JSON.stringify({
                id: data.dados.id,
                nome: data.dados.nome,
                email: data.dados.email
            }));

            if (data.tipo === 'nutricionista') {
                window.location.href = '/dashboard_nutri.html';
            } else {
                window.location.href = '/diario_alimentar.html';
            }

        } catch (error) {
            alert(error.message);
        }
    });
});
