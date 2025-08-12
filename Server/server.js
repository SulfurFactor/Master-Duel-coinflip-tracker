const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Unified data store for all trackers
let trackerData = {
    wins: 0, losses: 0, currentLosingStreak: 0, highestLosingStreak: 0,
    bricks: 0,
    ownMaxxC: 0, opponentMaxxC: 0,
    ownDroll: 0, opponentDroll: 0,
    ownGamma: 0, opponentGamma: 0,
};

// Helper function to calculate all derived metrics
function calculateAllMetrics() {
    const totalTosses = trackerData.wins + trackerData.losses;
    const winPercentage = totalTosses > 0 ? ((trackerData.wins / totalTosses) * 100).toFixed(2) : "0.00";

    const totalMaxxC = trackerData.ownMaxxC + trackerData.opponentMaxxC;
    const ownMaxxCPercentage = totalMaxxC > 0 ? ((trackerData.ownMaxxC / totalMaxxC) * 100).toFixed(2) : "0.00";
    const opponentMaxxCPercentage = totalMaxxC > 0 ? ((trackerData.opponentMaxxC / totalMaxxC) * 100).toFixed(2) : "0.00";

    const totalDroll = trackerData.ownDroll + trackerData.opponentDroll;
    const ownDrollPercentage = totalDroll > 0 ? ((trackerData.ownDroll / totalDroll) * 100).toFixed(2) : "0.00";
    const opponentDrollPercentage = totalDroll > 0 ? ((trackerData.opponentDroll / totalDroll) * 100).toFixed(2) : "0.00";

    const totalGamma = trackerData.ownGamma + trackerData.opponentGamma;
    const ownGammaPercentage = totalGamma > 0 ? ((trackerData.ownGamma / totalGamma) * 100).toFixed(2) : "0.00";
    const opponentGammaPercentage = totalGamma > 0 ? ((trackerData.opponentGamma / totalGamma) * 100).toFixed(2) : "0.00";

    return {
        ...trackerData,
        winPercentage,
        ownMaxxCPercentage, opponentMaxxCPercentage,
        ownDrollPercentage, opponentDrollPercentage,
        ownGammaPercentage, opponentGammaPercentage,
    };
}

// Broadcast data to all connected clients
function broadcast() {
    const dataToSend = { type: 'update', data: calculateAllMetrics() };
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(dataToSend));
        }
    });
}

wss.on('connection', ws => {
    console.log('Client connected');
    ws.send(JSON.stringify({ type: 'initial', data: calculateAllMetrics() }));

    ws.on('message', message => {
        try {
            const { action, category } = JSON.parse(message);

            if (action === 'increment') {
                trackerData[category]++;
                if (category === 'wins') {
                    trackerData.currentLosingStreak = 0;
                } else if (category === 'losses') {
                    trackerData.currentLosingStreak++;
                    if (trackerData.currentLosingStreak > trackerData.highestLosingStreak) {
                        trackerData.highestLosingStreak = trackerData.currentLosingStreak;
                    }
                }
            } else if (action === 'decrement') {
                if (trackerData[category] > 0) {
                    trackerData[category]--;
                }
                 if (category === 'losses' && trackerData.currentLosingStreak > 0) {
                    trackerData.currentLosingStreak--;
                 }
            } else if (action === 'reset') {
                // Handle specific resets based on category
                switch (category) {
                    case 'cointoss':
                        trackerData.wins = 0;
                        trackerData.losses = 0;
                        trackerData.currentLosingStreak = 0;
                        trackerData.highestLosingStreak = 0;
                        break;
                    case 'maxxC':
                        trackerData.ownMaxxC = 0;
                        trackerData.opponentMaxxC = 0;
                        break;
                    case 'droll':
                        trackerData.ownDroll = 0;
                        trackerData.opponentDroll = 0;
                        break;
                    case 'gamma':
                        trackerData.ownGamma = 0;
                        trackerData.opponentGamma = 0;
                        break;
                    case 'bricks':
                        trackerData.bricks = 0;
                        break;
                }
            }
            broadcast();
        } catch (error) {
            console.error("Failed to process message:", error);
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});

console.log('🚀 WebSocket server running on ws://localhost:8080');