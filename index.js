// PRODUCTION PROTOCOL: FORCED IPv4
const dns = require('node:dns');
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const connectDB = require('./src/utils/db');

console.log("[System] Koharu is initiating the Instant Awakening Protocol...");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers // Added for better identification
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User],
    rest: { timeout: 60000 }
});

client.commands = new Collection();

// 1. Load Commands
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
}

// 2. Load Events
const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));
}

// Start Systems
(async () => {
    try {
        console.log("[System] Connecting to Memory...");
        await connectDB();

        console.log("[System] Opening Mansion Doors (WebUI)...");
        require('./src/utils/server')(client);

        const token = process.env.DISCORD_TOKEN?.trim();
        if (!token) {
            console.error("[CRITICAL] DISCORD_TOKEN is missing!");
            return;
        }

        console.log("[System] Dispatching handshake to Discord HQ...");
        
        // Final Handshake strategy: Non-blocking login with a timeout catch
        client.login(token).catch(err => {
            console.error("[CRITICAL] Discord Connection Failed:", err.message);
            // If it fails immediately, Render will restart
            process.exit(1); 
        });

        // If she doesn't log in within 60s, restart the mansion
        setTimeout(() => {
            if (!client.isReady()) {
                console.error("[CRITICAL] Handshake timeout. Forcing restart...");
                process.exit(1);
            }
        }, 60000);

    } catch (err) {
        console.error('[CRITICAL ERROR] Boot sequence failed:', err.message);
        process.exit(1);
    }
})();