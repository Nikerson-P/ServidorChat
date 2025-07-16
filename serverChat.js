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


async function testeConnection(){
    const client = await pool.connect();
    try{
        const res = await client.query('SELECT NOW()');
        console.log("Conexao bem sucedida",res.rows[0]);
        

    }catch(err){
        console.error(err);
    }finally{
        client.release();
    }
}
async function salvar({sender,receiver,content}){
    const client = await pool.connect();
    try{
        const result = await client.query(`INSERT INTO menssages(sender,receiver,content,room_id) VALUES ($1,$2,$3,$4)  RETURNING *;`,
            [sender,receiver,content,gerarRoomId(sender,receiver)]
        )

    }catch(err){
        console.log("Erro",err);
    }
}

function gerarRoomId(user1, user2) {
  return [user1, user2].sort().join('_');
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

        socket.on('mensagem',({sender,receiver,content,room_id})=>{
            clearTimeout();
            io.to(sala).emit('mensagem',{sender:sender,receiver:receiver,content:content,room_id:room_id});
            salvar(sender,receiver,content)
        })
        

        socket.on('disconnect',()=>{
            console.log('Cliente Deslogado' + socket.id);

        })


})


testeConnection();

server.listen(PORT,()=>{
    console.log("Servidor na porta 3000")
})
