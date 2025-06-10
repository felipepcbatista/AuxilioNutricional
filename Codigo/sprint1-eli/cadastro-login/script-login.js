document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    async function loadUsers() {
        try {
            const response = await fetch('users.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const users = await response.json();
            return users;
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            alert('Erro ao carregar dados de usuários. Verifique o console para mais detalhes.');
            return [];
        }
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        const users = await loadUsers();
        
        const foundUser = users.find(user => user.email === email && user.password === password);

        if (foundUser) {
            alert(`Bem-vindo, ${foundUser.name}! Login bem-sucedido.`);
            localStorage.setItem('loggedInUser', JSON.stringify({
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email
            }));

            if (foundUser.id.startsWith('nutri')) {
                window.location.href = 'calendario-nutricionista.html';
            } else {
                alert("Você logou como paciente. (Redirecionamento para tela de paciente)");
            }

        } else {
            alert('Credenciais inválidas. Verifique seu e-mail e senha.');
        }
    });
});