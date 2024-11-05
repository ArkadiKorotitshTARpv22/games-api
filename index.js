const express = require('express')
const app = express()
const port = 8080
const swaggerUi = require('swagger-ui-express')
const yamljs = require('yamljs')
const swaggerDocument = yamljs.load('./docs/swagger.yaml');
const cors = require('cors')


app.use(express.json())
app.use(cors())

const games = [
    {id: 1, name: "Lethal Company", price: 9.99},
    {id: 2, name: "Content Warning", price: 7.99},
    {id: 3, name: "Titanfall 2", price: 59.99},
    {id: 4, name: "Roblox", price: 0},
    {id: 5, name: "Spacemarine 2", price: 59.99},
    {id: 6, name: "Dawn Of War", price: 29.99},
    {id: 7, name: "Liar's Bar", price: 7.99},
    {id: 8, name: "Helldivers 2", price: 39.99},
]

app.get('/games', (req,res) =>{
    res.send(games)
})

app.get('/games/:id', (req,res) => {
    if (typeof games[req.params.id -1] === 'undefined'){
        return res.status(404).send({error: "Game not found"})
    }
    res.send(games[req.params.id -1])
})

app.post('/games', (req,res) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).send({error: 'One or all params are missing'})
    }
    let game ={
        id: games.length +1,
        price: req.body.price,
        name: req.body.name
    }

    games.push(game)

    res.status(201)
        .location(`${getBaseUrl(req)}/games/${games.length}`)
        .send(game)
})

app.delete('/games/:id', (req,res) => {
    if (typeof games[req.params.id -1] === 'undefined'){
        return res.status(404).send({error: "Game not found"})
    }

    games.splice(req.params.id -1, 1)

    res.status(204).send({error: "No content"})
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}/games`)
})

app.put('/games/:id', (req, res) => {
    const gameId = parseInt(req.params.id);
    const game = games.find(g => g.id === gameId);
    if (!game) {
        return res.status(404).send({ error: 'Game not found' });
    }
    game.name = req.body.name || game.name;
    game.price = req.body.price || game.price;
    res.send(game);
});

function getBaseUrl(req) {
    return req.connection && req.connection.encrypted
        ? 'https' : 'http' + `://${req.headers.host}`
}