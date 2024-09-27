const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Initialize data for both trackers
let coinTossData = {
    winCount: 0,
    lossCount: 0,
    highestLosingStreak: 0,
    currentLosingStreak: 0,
};

let maxxCData = {
    ownMaxxC: 0,
    opponentMaxxC: 0,
    bricks: 0
};

// Helper function to calculate win percentage for Coin Toss
function calculateCoinTossMetrics() {
    const totalTosses = coinTossData.winCount + coinTossData.lossCount;
    const winPercentage = totalTosses > 0 ? ((coinTossData.winCount / totalTosses) * 100).toFixed(2) : 0;
    return {
        ...coinTossData,
        winPercentage
    };
}

// Helper function to calculate Maxx C percentages
function calculateMaxxCMetrics() {
    const totalMaxxC = maxxCData.ownMaxxC + maxxCData.opponentMaxxC;
    const ownMaxxCPercentage = totalMaxxC > 0 ? ((maxxCData.ownMaxxC / totalMaxxC) * 100).toFixed(2) : 0;
    const opponentMaxxCPercentage = totalMaxxC > 0 ? ((maxxCData.opponentMaxxC / totalMaxxC) * 100).toFixed(2) : 0;
    return {
        ...maxxCData,
        ownMaxxCPercentage,
        opponentMaxxCPercentage
    };
}

// Broadcast data to all connected clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', ws => {
    console.log('Client connected');

    // Send the initial state of both trackers on new connection
    ws.send(JSON.stringify({
        type: 'initial',
        coinTossData: calculateCoinTossMetrics(),
        maxxCData: calculateMaxxCMetrics(),
    }));

    ws.on('message', message => {
        const data = JSON.parse(message);

        // Handling Coin Toss actions
        if (data.type === 'cointoss') {
            if (data.action === 'win') {
                coinTossData.winCount++;
                coinTossData.currentLosingStreak = 0;
            } else if (data.action === 'loss') {
                coinTossData.lossCount++;
                coinTossData.currentLosingStreak++;
                if (coinTossData.currentLosingStreak > coinTossData.highestLosingStreak) {
                    coinTossData.highestLosingStreak = coinTossData.currentLosingStreak;
                }
            } else if (data.action === 'reset') {
                coinTossData = {
                    winCount: 0,
                    lossCount: 0,
                    highestLosingStreak: 0,
                    currentLosingStreak: 0,
                };
            }

            // Broadcast updated Coin Toss data
            broadcast({
                type: 'cointoss',
                data: calculateCoinTossMetrics()
            });
        }

        // Handling Maxx C actions
        if (data.type === 'maxxC') {
            if (data.action === 'increment') {
                if (data.category === 'ownMaxxC') {
                    maxxCData.ownMaxxC++;
                } else if (data.category === 'opponentMaxxC') {
                    maxxCData.opponentMaxxC++;
                } else if (data.category === 'bricks') {
                    maxxCData.bricks++;
                }
            } else if (data.action === 'reset') {
                maxxCData = {
                    ownMaxxC: 0,
                    opponentMaxxC: 0,
                    bricks: 0
                };
            }

            // Broadcast updated Maxx C data
            broadcast({
                type: 'maxxC',
                data: calculateMaxxCMetrics()
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server running on ws://localhost:8080');
