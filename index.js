const WebSocket = require("ws")
const Client = require("./client")
const Lobby = require("./lobby")
const Room = require("./room")
const wss = new WebSocket.Server({port:4040})
const CircularJSON = require('circular-json')

console.log("server running on port:4040")

var clients = []
var lobbies = []
var rooms = []

function getLobby(name){
    for(let i = 0; i < lobbies.length; i++){
        if(lobbies[i].name == name){
            return lobbies[i]
        }
    }
}

function getRoom(id){
    for(let i = 0; i < rooms.length; i++){
        if(rooms[i].id == id){
            return rooms[i]
        }
    }
}

function getClient(id){
    for(let i = 0; i < clients.length; i++){
        if(clients[i].id == id){
            return clients[i]
        }
    }
}

function removeLobby(lobby){
    for(let i = 0; i < lobbies.length; i++){
        if(lobbies[i].name == lobby.name){
            lobbies.splice(i, 1)
        }
    }
}

function removeRoom(room){
    for(let i = 0; i < rooms.length; i++){
        if(rooms[i].id == room.id){
            rooms.splice(i, 1)
        }
    }
}

function searchLobbies(lobby, isroom){
    lobbies.forEach(lobbi => {
        console.log(lobbi.open)
        if(lobbi.open == true && lobbi.name != lobby.name && lobby.open == true){
            var room = new Room(uuidv4())
            lobbi.open = false
            room.addLobbyClients(lobbi)
            lobby.open = false
            room.addLobbyClients(lobby)
            room.sift()
            var ids = {}
            for(let i = 0; i < room.clients.length; i++){
                ids[room.clients[i].id] = room.clients[i].meta
            }
            var dat = {"clients":ids}
            room.sendToAllClients(CircularJSON.stringify({"type":"start", "status":"good","roomId":room.id, "clients":dat}))
            rooms.push(room)
            isroom = true
            return
        }
        else{
            setTimeout(() => {
                console.log("end search")
            }, 5000)
        }
    })
}

wss.on("connection", (ws) => {
    const id = uuidv4()

    var client = new Client(id, ws)
    clients.push(client)

    ws.send(JSON.stringify({"type":"handshake", "status":"good", "id":id}))

    ws.on("message", (message) => {
        var json = JSON.parse(message)
        if (json.contact == "server"){
            if (json.type == "set-ready"){
                var client = getClient(json.id)
                client.ready = json.ready
                var lobby = client.lobby
                lobby.sendToAllClients(CircularJSON.stringify({"type":"lobby", "status":"good", "clients":lobby.clients}))
                var red = false
                var booll = []
                lobby.clients.forEach(client => {
                    booll.push(client.ready)
                })
                if (!checkTrueExistsArray(booll)){
                    red = true
                }
                if(red == true){
                    lobby.open = true
                    var isroom = false
                    searchLobbies(lobby, isroom)
                    if(isroom){
                        console.log('room')
                    }
                }
            }
            if (json.type == "sync"){
                var room = getRoom(json.roomId)
                if(room != null){
                    room.sendToAllClients(CircularJSON.stringify({"name":json.name, "type":"sync", "status":"good", "vel":json.vel}))
                }
            }
            if (json.type == "spawn"){
                var room = getRoom(json.roomId)
                if(room != null){
                    room.sendToAllClients(CircularJSON.stringify({"name":json.name, "position":json.position, "type":"spawn", "status":"good", "child":json.child_path, "parent":json.parent_path}))
                }
            }
            if (json.type == "update-room"){
                var room = getRoom(json.roomId)
                if(room != null){
                    room.sendToAllClients(CircularJSON.stringify({"type":"room", "status":"good","data":room.data}))
                }
            }
            if (json.type == "delete"){
                var room = getRoom(json.roomId)
                if(room != null){
                    room.sendToAllClients({"type":"delete","status":"good","node":json.node})
                }
            }
            if (json.type == "set-meta"){
                var client = getClient(json.id)
                    if(client != null){
                    client.meta = json.meta
                    if(client.room != null){
                        client.room.setData(client.id, client.meta)
                    }
                }
            }
            if (json.type == "join-lobby"){
                var lobby = getLobby(json.name)
                var client = getClient(json.id)
                client.username = json.username
                lobby.addClient(client)
                lobby.sendToAllClients(CircularJSON.stringify({"type":"lobby", "status":"good", "clients":lobby.clients}))
            }
            if (json.type == "create-lobby"){
                var lobby = new Lobby(json.name)
                var client = getClient(json.id)
                client.username = json.username
                lobby.addClient(client)
                lobbies.push(lobby)
                lobby.sendToAllClients(CircularJSON.stringify({"type":"lobby", "status":"good", "clients":lobby.clients}))
            }
            if (json.type == "ready"){
                client.ready = json.state
            }
        }
        if (json.contact == "room"){
            var room = getRoom(json.roomId)
            room.sendToAllClients(json.message)
        }
        if (json.contact == "lobby"){
            var lobby = getLobby(json.lobbyName)
            lobby.sendToAllClients(json.message)
        }
        if (json.contact == "client"){
            var client = getClient(json.clientId)
            client.send(json.message)
        }
    })

    console.log("connected a client")

    ws.on("close", () => {
        var lobby
        for(let i = 0; i < clients.length; i++){
            if(clients[i].ws == ws){
                if(clients[i].lobby != null){
                    lobby = clients[i].lobby
                    lobby.removeClient(clients[i])
                    lobby.sendToAllClients(CircularJSON.stringify({"type":"lobby", "status":"good", "clients":lobby.clients}))
                    if(lobby.clients.length == 0){
                        removeLobby(lobby)
                    }
                }
                if(clients[i].room != null){
                    room = clients[i].room
                    room.removeClient(clients[i])
                    room.sendToAllClients(CircularJSON.stringify({"type":"lobby", "status":"good", "clients":room.clients}))
                    if(room.clients.length == 0){
                        removeRoom(room)
                    }
                }
            }
        }
        clients.splice(ws, 1)
        console.log("client closed connection")
    })
})

function checkTrueExistsArray(array){
    for(var k=0; k<array.length; k++){
        if(!array[k]){
            return true
            break;
        }
    }
    return false;
    }

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}