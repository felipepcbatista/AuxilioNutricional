const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

// Middleware para interpretar JSON
app.use(express.json());

// Rotas para páginas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'diario_alimentar.html'));
});

app.get('/registrar_alimentos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registrar_alimentos.html'));
});


app.get('/informacoes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'informacoes.html'));
});

app.get('/adicionar_alimentos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adicionar_alimentos.html'));
});

// API para obter alimentos
app.get('/api/alimentos', (req, res) => {
    try {
        const alimentosData = fs.readFileSync(path.join(__dirname, 'public', 'data', 'alimentos.json'), 'utf-8');
        const alimentos = JSON.parse(alimentosData);
        res.json(alimentos.alimentos);
    } catch (error) {
        console.error('Erro ao ler arquivo de alimentos:', error);
        res.status(500).json({ error: 'Erro ao carregar alimentos' });
    }
});


// API para adicionar alimento
app.post('/api/adicionar_alimento', (req, res) => {
    console.log('Alimento adicionado:', req.body);
    res.json({ success: true, message: 'Alimento adicionado com sucesso' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});