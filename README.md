# API-de-Comunica-o-em-tempo-real
API desenvolvida em NodeJS que permite comunicação em tempo real entre usuários. Utilizando sockets, o aplicativo possibilita troca de mensagens instantâneas e envio de arquivos.

Para rodar essa API, você necessita do nodeJs e também será preciso instalar as respectivas dependências.

socket.on('receivedFile', (file) => {
            if (file.filetype.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = file.data;
                document.body.appendChild(img);
            } else {
                const link = document.createElement('a');
                link.href = file.data;
                link.download = file.filename;
                link.innerText = `Baixar ${file.filename}`;
                document.body.appendChild(link);
            }
        });