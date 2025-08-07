const express = require('express');
const path = require('path');
const fs = require('fs');

/* - Cria uma aplicação Express; 
   - Cria um servidor HTTP usando o módulo nativo do Node.js;
   - Importa e inicializa o Socket.IO, conectando-o ao servidor HTTP criado.
   */
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

/* Configuração padrão para utilizar html com node por meio de ejs*/
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
    res.render('index.ejs');
});
  app.use('/public/imgs', express.static(path.join(__dirname, 'imgs')));
let messages = [];

io.on('connection', socket => {
    socket.emit('previousMessages', messages);

    socket.on('sendMessage', data => {
        messages.push(data);
        io.emit('receivedMessage', data); // Envia para TODOS inclusive remetente
    });

    socket.on('sendFile', (file) => {
        // Verifica se é imagem
        if (!file.filetype.startsWith('image/')) {
            return socket.emit('fileError', 'Apenas imagens são permitidas!');
        }

        // Gera nome único para o arquivo
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + file.filename;
        const uploadDir = path.join(__dirname, 'public', 'imgs');
        
        // Cria diretório se não existir
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Salva o arquivo
        fs.writeFile(path.join(uploadDir, uniqueName), file.data, 'base64', (err) => {
            if (err) {
                console.error('Erro ao salvar arquivo:', err);
                return socket.emit('fileError', 'Erro no servidor');
            }

            // Cria objeto de mensagem com link correto
            const fileMessage = {
                author: file.author,
                date: file.date,
                filename: file.filename,
                filetype: file.filetype,
                savedFilename: uniqueName  // Nome salvo no servidor
            };

            messages.push(fileMessage);
            io.emit('receivedFile', fileMessage);
        });
    });
});

server.listen(3000);