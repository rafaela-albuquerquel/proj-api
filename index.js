const express = require('express');
const app = express();
// import admin from 'firebase-admin';
// import cors from 'cors';
const admin = require('firebase-admin');
const cors = require('cors');
const port = 3000;

var serviceAccount = require('./serviceAccount.json');

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.get('/eventos', async (req, res) => {
    try {
      admin
      .firestore().collection("eventos").get()
      .then(snapshot => {
        const eventos = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }))
        res.json(eventos)
      })
    } catch (error) {
      console.error('Erro ao obter eventos:', error);
      res.status(500).send('Erro ao obter eventos');
    }
  });
  
  // Rota para adicionar um novo evento
  app.post('/eventos', async (req, res) => {
    console.log('post chamado');
    const novoEvento = req.body;
    try {
      await admin.firestore().collection("eventos").add(novoEvento);
      console.log('tentando adcionar evento');
      res.status(201).send('Evento adicionado com sucesso.');
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      res.status(500).send('Erro ao adicionar evento');
    }
  });
  
  // Rota para atualizar um evento existente
  app.put('/eventos', async (req, res) => {
    const { id, ...dadosAtualizados } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID do evento é necessário." });
    }
    try {
      const eventoRef = admin.firestore().collection("eventos").doc(id);
      const doc = await eventoRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }

      await eventoRef.update(dadosAtualizados);
      res.send('Evento atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      res.status(500).send('Erro ao atualizar evento');
    }
  });
  
  // Rota para excluir um evento existente
  app.delete('/eventos', async (req, res) => {
    const { id } = req.body;

    try {
      const eventoRef = admin.firestore().collection("eventos").doc(id);
      const doc = await eventoRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: "Evento não encontrado." });
      }

      await eventoRef.delete();
      res.send('Evento excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      res.status(500).send('Erro ao excluir evento');
    }
  });
  
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });