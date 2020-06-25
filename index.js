const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { genMessage } = require('./utils/msgs') 
const {  addUser,
    removeUser,
    getUser,
    getUsersInRoom } = require('./utils/users')




const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000

io.on('connection', (socket)=>{
    console.log("connected")

    socket.on('join', (data, ack)=>{

        const {error, user} = addUser({ id:socket.id, username: data.username, room: data.room })

        if (error){
           return ack(error)
        }

        socket.join(user.room)

        socket.emit('test', genMessage('Admin', `Welcome ${user.username}!`))
        socket.broadcast.to(user.room).emit('test',  genMessage(`${user.username} has joined!`))


        io.to(user.room).emit('roomInfo', {
            users:getUsersInRoom(user.room),
            room: user.room
        })


        ack()
    })

    socket.on('sendMessage', (val, ack) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(val)){
            io.to(user.room).emit('test', genMessage(user.username, filter.clean(val)))
            ack('Delivered! but contains bad words')
        }

        else{
             io.to(user.room).emit('test', genMessage(user.username, val))
            ack('Delivered!')
        }
       console.log(genMessage(val))
    })

    socket.on('position', (obj) => {
        const user = getUser(socket.id)
        io.emit('test', genMessage(user.username, `https://google.com/maps?q=${obj.latitude},${obj.longitude}`))
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('test', genMessage('Admin', `${user.username} has left!`))

            io.to(user.room).emit('roomInfo', {
                users: getUsersInRoom(user.room),
                room: user.room
            })
        }

        
    })
})



server.listen(port, ()=>{
    console.log("port working @ 3000")
})



