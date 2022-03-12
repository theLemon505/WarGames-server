class Lobby{
    name = ""
    clients = []
    maxClients = 4
    open = false

    constructor(name){
        this.name = name
    }

    sendToAllClients(message){
        this.clients.forEach(client => {
            client.send(message)
        })
    }

    sendToClient(message, client){
        
    }

    addClient(client){
        client.lobby = this
        this.clients.push(client)
    }

    removeClient(client){
        for(let i = 0; i < this.clients.length; i++){
            if(this.clients[i] == client){
                this.clients.splice(i, 1)
            }
        }
    }
}

module.exports = Lobby