class Room{
    id = ""
    clients = []
    data = {}
    items = []

    constructor(id){
        this.id = id
    }

    getItem(id){
        for(let i = 0; i < this.items.length; i++){
            if(this.items[i].id == id){
                return this.items[i]
            }
        }
    }

    removeItem(id){
        for(let i = 0; i < this.items.length; i++){
            if(this.items[i].id == id){
                this.items.splice(i, 1)
            }
        }
    }

    addItem(item){
        this.items.push(item)
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