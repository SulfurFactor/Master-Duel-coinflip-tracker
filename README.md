# SulfurFactor/Master-Duel-coinflip-tracker
 This simple web source can be used as an overlay to display some data about your coinflips in YGO Masterduel.

Coinflip and lingering handtraps like Maxx C Tracker Overlay for Streaming

This project provides a manual coinflip and hantrap tracking overlay designed to be used with OBS. The overlay will display win/loss counts and statistics as you update them, perfect for integrating into your streaming setup.

Features

•	One click tracking: The overlay updates automatically as you input coinflip or maxx c results.

•	User-friendly interface: Simple buttons to log wins and losses.

•	Reset function: Clear all counts while keeping track of historical data.

Requirements

- Node.js (to run the WebSocket server)

Setup Instructions

1.	Clone the Repository

Download the latest release or clone the repository to your local machine.

2.	Install Dependencies

Ensure you have Node.js installed. And the ws library for WebSocket functionality.

3.	Run the WebSocket Server

Use the provided .bat file to start the WebSocket server.

•	Double-click start_server.bat to run the server.

4.	Open the HTML Files

•	Open MDtracker_index.html in a web browser to manually input coinflip or maxx c results.

•	Open cointoss_overlay.html and maxxc_overlay.html in a web browser to display the overlay. (or just add it to OBS)

5.	Add the source to OBS.

Add a browser source for the coinflip or handtraps overlays, you can just add the html file as the source.
