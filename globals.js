const bakers = 2

const globalBakers = {
    bakers: [],
    orders: [],
}

for (let i = 0; i < bakers; i++) {
    globalBakers.bakers.push({ bakerId: i, timeUsed: 0, orders: [] })
}

module.exports = globalBakers;