// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let winCount = 0;
let lossCount = 0;
let highestLosingStreak = 0;
let currentLosingStreak = 0;

function broadcastData() {
    const data = JSON.stringify({
        winCount,
        lossCount,
        highestLosingStreak,
        currentLosingStreak,
        winPercentage: totalTosses() > 0 ? ((winCount / totalTosses()) * 100).toFixed(2) : 0
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

function totalTosses() {
    return winCount + lossCount;
}

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send current stats to the newly connected client
    broadcastData();

    ws.on('message', (message) => {
        const result = JSON.parse(message);
        
        if (result.action === 'win') {
            winCount++;
            currentLosingStreak = 0;
        } else if (result.action === 'loss') {
            lossCount++;
            currentLosingStreak++;
            if (currentLosingStreak > highestLosingStreak) {
                highestLosingStreak = currentLosingStreak;
            }
        } else if (result.action === 'reset') {
            winCount = 0;
            lossCount = 0;
            highestLosingStreak = 0;
            currentLosingStreak = 0;
        }

        broadcastData();
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
