class Room{
    id = ""
    clients = []
    data = {}

    constructor(id){
        this.id = id
    }

    sendToAllClients(message){
        this.clients.forEach(client => {
            client.send(message)
        })
    }

    setData(id, data){
        this.data[id] = data
    }

    sendToClient(message, client){
        client.send(message)
    }

    addLobbyClients(lobby){
        lobby.clients.forEach(client => {
            this.addClient(client)
        })
    }

    addClient(client){
        client.room = this
        this.clients.push(client)
    }

    sift(){
        for(let i = 0; i < this.clients.length; i++){
            if(this.clients[i].id == null || this.clients[i].id == ""){
                this.clients.splice(i, 1)
            }
        }
    }

    removeClient(client){
        for(let i = 0; i < this.clients.length; i++){
            if(this.clients[i] == client){
                this.clients.splice(i, 1)
            }
        }
    }
}

module.exports = Room