const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com o MongoDB local (cria o banco 'petshop_db' automaticamente)
mongoose.connect('mongodb://127.0.0.1:27017/petshop_db')
    .then(() => console.log('Conectado ao MongoDB (petshop_db)'))
    .catch(err => console.error('Erro ao conectar no MongoDB:', err));

// Definição do Modelo de Dados (Schema)
const petSchema = new mongoose.Schema({
    nomePet: { type: String, required: true },
    especie: { type: String, required: true },
    raca: { type: String },
    nomeDono: { type: String, required: true },
    servico: { type: String, required: true },
    status: { type: String, default: 'Aguardando' }, // Aguardando, Em Andamento, Concluído
    dataEntrada: { type: Date, default: Date.now }
});

const Pet = mongoose.model('Pet', petSchema);

// --- ROTAS CRUD ---

// CADASTRAR novo Pet
app.post('/api/pets', async (req, res) => {
    try {
        const novoPet = new Pet(req.body);
        const petSalvo = await novoPet.save();
        res.status(201).json(petSalvo);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

// LISTAR todos os Pets
app.get('/api/pets', async (req, res) => {
    try {
        const pets = await Pet.find().sort({ dataEntrada: -1 });
        res.json(pets);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

// ATUALIZAR Status do Pet
app.put('/api/pets/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const petAtualizado = await Pet.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true } // Retorna o documento atualizado
        );
        if (!petAtualizado) return res.status(404).json({ erro: 'Pet não encontrado' });
        res.json(petAtualizado);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

// DELETAR Pet (Dar baixa)
app.delete('/api/pets/:id', async (req, res) => {
    try {
        const petDeletado = await Pet.findByIdAndDelete(req.params.id);
        if (!petDeletado) return res.status(404).json({ erro: 'Pet não encontrado' });
        res.json({ mensagem: 'Pet removido do sistema' });
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor Pet Shop rodando na porta 3000');
});