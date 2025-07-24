const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para arquivos estáticos
app.use('/assets', express.static(path.join(__dirname, '../front-end/assets')));
app.use(express.json());

// ------------------------- ROTAS HTML ------------------------- //
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'index.html')));
app.get('/cadastro-nutri', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'cadastro-nutri.html')));
app.get('/cadastro-usu', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'cadastro-usu.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'login.html')));
app.get('/diario_alimentar', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'diario_alimentar.html')));
app.get('/registrar_alimentos', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'registrar_alimentos.html')));
app.get('/informacoes', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'informacoes.html')));
app.get('/adicionar_alimentos', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'adicionar_alimentos.html')));
app.get('/user_profile', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'user_profile.html')));
app.get('/receitas', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'receitas.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'login.html')));
app.get('/dashboard_nutri', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'dashboard_nutri.html')));
app.get('/pacientes', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'pacientes.html')));
app.get('/agenda', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'agenda.html')));
app.get('/perfilnutri', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'perfilnutri.html')));
app.get('/receitas_nutri', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'receitas_nutri.html')));
app.get('/marcar_consulta', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'marcar_consulta.html')));
app.get('/calculadoras-nutri', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'calculadoras-nutri.html')));
app.get('/calculadoras-user', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'calculadoras-user.html')));
app.get('/evolucao_usuario', (req, res) => res.sendFile(path.join(__dirname, '../front-end', 'evolucao_usuario.html')));

// ------------------------- Função para ler e salvar db.json ------------------------- //
const dbPath = path.join(__dirname, '../front-end/data/db.json');

function readDB() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function saveDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ------------------------- API: Alimentos ------------------------- //
app.get('/api/alimentos', (req, res) => {
    try {
        const db = readDB();
        res.json(db.alimentos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar alimentos' });
    }
});

// ------------------------- API: Adicionar Alimento ------------------------- //
app.post('/api/adicionar_alimento', (req, res) => {
    const novoAlimento = req.body;
    const db = readDB();
    novoAlimento.id = db.alimentos.length + 1;
    db.alimentos.push(novoAlimento);
    saveDB(db);
    res.status(201).json(novoAlimento);
});

// ------------------------- API: Cadastro de Usuário ------------------------- //
app.post('/usuarios', (req, res) => {
    const novoUsuario = req.body;
    const db = readDB();

    if (!db.usuarios) {
        db.usuarios = [];
    }

    novoUsuario.id = (db.usuarios.length + 1).toString();

    if (!novoUsuario.senha && novoUsuario.password) {
        novoUsuario.senha = novoUsuario.password;
        delete novoUsuario.password;
    }

    db.usuarios.push(novoUsuario);
    saveDB(db);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', usuario: novoUsuario });
});



// ------------------------- API: Cadastro de Nutricionista ------------------------- //
app.post('/nutricionistas', (req, res) => {
    const novoNutri = req.body;
    const db = readDB();

    if (!db.nutricionistas) {
        db.nutricionistas = [];
    }

    novoNutri.id = (db.nutricionistas.length + 1).toString();
    db.nutricionistas.push(novoNutri);
    saveDB(db);

    res.status(201).json(novoNutri);
});


// ------------------------- API: Login (Usuário ou Nutricionista) ------------------------- //
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login recebido:', { email, password });
  const db = readDB();
  console.log('Usuários no banco:', db.usuarios);

  const usuario = db.usuarios.find(u => u.email === email.trim() && u.senha === password.trim());
  const nutri = db.nutricionistas.find(n => n.email === email && n.senha === password);

  if (usuario) {
    console.log('Usuário autenticado:', usuario);
    res.json({ tipo: 'usuario', dados: usuario });
  } else if (nutri) {
    console.log('Nutricionista autenticado:', nutri);
    res.json({ tipo: 'nutricionista', dados: nutri });
  } else {
    console.log('Falha no login');
    res.status(401).json({ error: 'Email ou senha inválidos' });
  }
});

// ------------------------- API: Buscar nutricionista por ID ------------------------- //
app.get('/nutricionistas/:id', (req, res) => {
    console.log('Requisição GET /nutricionistas/:id recebida. id =', req.params.id);
    const db = readDB();
    const nutri = db.nutricionistas.find(n => n.id === req.params.id);
    if (nutri) {
        res.json(nutri);
    } else {
        res.status(404).json({ error: 'Nutricionista não encontrado' });
    }
});


// ------------------------- API: Atualizar perfil do nutricionista ------------------------- //
app.put('/nutricionistas/:id', (req, res) => {
    const db = readDB();
    const index = db.nutricionistas.findIndex(n => n.id === req.params.id);
    if (index !== -1) {
        db.nutricionistas[index] = req.body;
        saveDB(db);
        res.json(req.body);
    } else {
        res.status(404).json({ error: 'Nutricionista não encontrado' });
    }
});

// ------------------------- API: Buscar usuário ------------------------- //
app.get('/api/usuarios', (req, res) => {
  try {
    const db = readDB();
    res.json(db.usuarios || []);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar usuários' });
  }
});

// ------------------------- API: Evolução do Usuário ------------------------- //

// Obter dados da evolução
app.get('/api/evolucao', (req, res) => {
  const db = readDB();
  res.json(db.evolucao || []);
});

// Adicionar novo registro de evolução
app.post('/api/evolucao', (req, res) => {
  const { data, peso } = req.body;

  if (!data || !peso) {
    return res.status(400).json({ error: 'Data e peso são obrigatórios.' });
  }

  const db = readDB();

  if (!db.evolucao) db.evolucao = [];

  const novaEntrada = {
    id: Date.now(),
    data,
    peso: parseFloat(peso)
  };

  db.evolucao.push(novaEntrada);
  saveDB(db);

  res.status(201).json(novaEntrada);
});

// ------------------------- API: Salvar registro da calculadora ------------------------- //
app.post('/registros', (req, res) => {
  const novoRegistro = req.body;

  const db = readDB();
  if (!db.registros) db.registros = [];

  novoRegistro.id = db.registros.length + 1;
  db.registros.push(novoRegistro);
  saveDB(db);

  res.status(201).json(novoRegistro);
});

// ------------------------- API: Excluir usuário ------------------------- //
app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  if (!db.usuarios) {
    return res.status(404).json({ error: 'Nenhum usuário cadastrado.' });
  }

  const index = db.usuarios.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  db.usuarios.splice(index, 1);
  saveDB(db);

  res.json({ message: 'Usuário excluído com sucesso.' });
});


// ------------------------- Iniciar servidor ------------------------- //
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
