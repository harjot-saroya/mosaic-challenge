const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid')
const globalBakers = require('./globals')
const app = express()
const port = 3001

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

const assignOrders = (order) => {
    const id = Object.keys(order)[0]
    // Sort bakers by most time availability
    const sortedBakers = globalBakers.bakers.sort((a, b) => a.timeUsed - b.timeUsed);
    const updatedTime = order[id].hours + sortedBakers[0].timeUsed;
    if (updatedTime > 8) return false;
    sortedBakers[0].orders.push(id)
    sortedBakers[0].timeUsed = updatedTime
    return true
}

app.get('/', async (req, res) => {
    res.send('Done')
})

app.get('/getOrders', (req, res) => {
    const getOrders = [...globalBakers.bakers].map((baker) => {
        const orders = baker.orders.map(orderId => globalBakers.orders.find(order => orderId === Object.keys(order)[0]));
        return { ...baker, orders }
    })

    res.status(200).json(getOrders);
})

app.post('/addOrder', async (req, res) => {
    const hours = req.body.hours;
    const name = JSON.stringify(req.body.name);
    const id = JSON.stringify(uuidv4());
    const order = JSON.parse(`{${id} : {"hours":${hours},"name":${name}}}`)
    const isAvailable = assignOrders(order);

    if (!isAvailable) {
        return res.status(422).json('There are no more available bakers')
    }
    globalBakers.orders.push(order)
    res.status(200).json('Order sucessfully added')
})

app.delete('/cancelOrder/:id', (req, res) => {
    const selectedId = req.params['id']

    const updatedQueue = globalBakers.orders.filter((item) => {
        return Object.keys(item)[0] !== selectedId
    })
    if (updatedQueue.length === globalBakers.orders.length) {
        return res.status(404).json('Order id not found')
    }
    globalBakers.orders = updatedQueue
    // Reset all bakers to default settings
    globalBakers.bakers.forEach((baker) => {
        baker.orders = [];
        baker.time = 0;
    })

    // Redistribute orders for each baker after cancelling an order
    updatedQueue.forEach((order) => assignOrders(order))

    res.status(200).json('Order cancelled sucessfully')
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})