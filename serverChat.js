const express = require('express')
const http = require('http')
const socket = require('socket.io')

const PORT = process.env.PORT || 3000;

const app = express()
const server = http.createServer(app)
const io = socket(server)


io.on('connection',(socket)=>{
        console.log('ID:' + socket.id)



        const timeout = setTimeout(()=>{
            console.log('Inatividade do Cliente Id:'+socket.id);
            //io.to(sala).emit('mensagem','desconectado');
            socket.disconnect(true)
        },1000*30*1)

        socket.on('entrarSala',(sala)=>{
            socket.join(sala)
            io.to(sala).emit('mensagem',`${socket.id} entrou na sala ${sala}`)
        })

        socket.on('mensagem',({sala,mensagemInput,usuarioAtual})=>{
            clearTimeout();
            io.to(sala).emit('mensagem',{mensagem:mensagemInput,usuario:usuarioAtual});
            console.log(sala +'-'+mensagemInput+'-'+usuarioAtual);
        })
        

        socket.on('disconnect',()=>{
            console.log('Cliente Deslogado');

        })


})

server.listen(PORT,()=>{
    console.log("Servidor na porta 3000")
})
