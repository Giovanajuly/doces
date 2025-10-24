
import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import conectarBanco from './database/conexao.js';

dotenv.config();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.end('Bem vindo a API de Doces PWI!');
});

app.get('/doces', async (req, res) => {
    const conexao = await conectarBanco();
    try {
        const sql = 'SELECT * FROM doce';
        const [linhas] = await conexao.execute(sql);
        res.json(linhas);
    } catch (error) {
        console.error('Erro na consulta:', error);
        res.status(500).json({ erro: error.message });
    } finally {
        await conexao.end();
    }
});

app.post('/doces', async (req, res) => {
    const conexao = await conectarBanco();
    const novoDoce = req.body;
    try {
        const sql = `INSERT INTO doce (doce_nome, doce_descricao, doce_valor, doce_imagem) VALUES (?, ?, ?, ?)`;
        const [resultado] = await conexao.execute(sql, [
            novoDoce.doce_nome,
            novoDoce.doce_descricao,
            novoDoce.doce_valor,
            novoDoce.doce_imagem,
        ]);
        res.status(201).json({ id_doce: resultado.insertId, ...novoDoce });
    } catch (error) {
        console.error('Erro na inserção:', error);
        res.status(500).json({ erro: error.message });
    } finally {
        await conexao.end();
    }
});

app.put('/doces/:id', async (req, res) => {
    const conexao = await conectarBanco();
    const id = req.params.id;
    const dados_doce = req.body;
    try {
        const sql = 'UPDATE doce SET doce_nome = ?, doce_descricao = ?, doce_valor = ?, doce_imagem = ? WHERE id_doce = ?';
        const dados = [
            dados_doce.doce_nome,
            dados_doce.doce_descricao,
            dados_doce.doce_valor,
            dados_doce.doce_imagem,
            id
        ];
        const [resultado] = await conexao.execute(sql, dados);
        if (resultado.affectedRows > 0) {
            res.json({ id_doce: id, ...dados_doce });
        } else {
            res.status(404).json({ erro: 'Doce não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ erro: error.message });
    } finally {
        await conexao.end();
    }
});

app.delete('/doces/:id', async (req, res) => {
    const conexao = await conectarBanco();
    const id = req.params.id;
    try {
        const sql = 'DELETE FROM doce WHERE id_doce = ?';
        const [resultado] = await conexao.execute(sql, [id]);
        if (resultado.affectedRows > 0) {
            res.json({ mensagem: 'Doce deletado com sucesso' });
        } else {
            res.status(404).json({ erro: 'Doce não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ erro: error.message });
    } finally {
        await conexao.end();
    }
});

app.get('/doces/:id', async (req, res) => {
    const conexao = await conectarBanco();
    const id = req.params.id;
    try {
        const sql = 'SELECT * FROM doce WHERE id_doce = ?';
        const [linhas] = await conexao.execute(sql, [id]);
        if (linhas.length > 0) {
            res.json(linhas[0]);
        } else {
            res.status(404).json({ erro: 'Doce não encontrado' });
        }
    } catch (error) {
        console.error('Erro na consulta:', error);
        res.status(500).json({ erro: error.message });
    } finally {
        await conexao.end();
    }
});

const server = http.createServer(app);
server.listen(process.env.PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${process.env.PORTA}`);
});
``