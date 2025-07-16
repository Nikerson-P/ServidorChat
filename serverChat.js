const express = require('express')
const http = require('http')
const socket = require('socket.io')
const { Pool} = require('pg')

const PORT = process.env.PORT || 3000;
const pool = new Pool({
    connectionString:'postgres://chat_b6er_user:cA8WLBa1e4hPR7wEOcsMRd98dswPxLWF@dpg-d1nbgcnfte5s73frebv0-a.oregon-postgres.render.com/chat_b6er',
    ssl:{
        rejectUnauthorized:false
    }
})
const app = express()
const server = http.createServer(app)
const io = socket(server)

const query = `  CREATE TABLE  IF NOT EXISTS messages (
                  id SERIAL PRIMARY KEY,
                  sender TEXT NOT NULL,
                  receiver TEXT NOT NULL,
                  content TEXT NOT NULL,
                  sent_at TIMESTAMP DEFAULT NOW()
                );`;

async function testeConnection(){
    const client = await pool.connect();
    try{
        const res = await client.query('SELECT NOW()');
        console.log("Conexao bem sucedida",res.rows[0]);
        await client.query(query);

    }catch(err){
        console.error(err);
    }finally{
        client.release();
    }
}
io.on('connection',(socket)=>{

        const timeout = setTimeout(()=>{
            console.log('Inatividade do Cliente Id:'+socket.id);
            
            socket.disconnect(true)
        },1000*60*5)

        socket.on('entrarSala',(sala)=>{
            socket.join(sala)
            
            io.to(sala).emit('mensagem',`${socket.id} entrou na sala ${sala}`)
        })

        socket.on('mensagem',({sala,mensagemInput,usuarioAtual})=>{
            clearTimeout();
            io.to(sala).emit('mensagem',{mensagem:mensagemInput,usuario:usuarioAtual});
            
        })
        

        socket.on('disconnect',()=>{
            console.log('Cliente Deslogado' + socket.id);

        })


})


testeConnection();

server.listen(PORT,()=>{
    console.log("Servidor na porta 3000")
})
