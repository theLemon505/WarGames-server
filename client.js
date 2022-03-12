class Client{
    id = ""
    username = ""
    ws = null
    meta = {}
    ready = false
    lobby = null
    room = null

    constructor(id, ws){
        this.id = id
        this.ws = ws
    }

    send(message){
        this.ws.send(message)
    }
}

module.exports = Client