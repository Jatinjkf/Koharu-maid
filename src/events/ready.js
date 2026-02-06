const { REST, Routes } = require('discord.js');
const Config = require('../models/Config');
const Frequency = require('../models/Frequency');
const ai = require('../utils/ai');
const scheduler = require('../utils/scheduler');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log("---------------------------------------");
        console.log(`🌸 [SUCCESS] ${client.user.tag} HAS AWAKENED!`);
        console.log("---------------------------------------");

        // 1. Initial Status
        client.user.setActivity('over Master Jatin', { type: 3 });

        // 2. Start Scheduler (Silent)
        try {
            await scheduler.start(client);
        } catch (e) { console.error("[Scheduler] Start failed:", e.message); }

        // 3. Register Commands (Background)
        const commands = [];
        client.commands.forEach(cmd => commands.push(cmd.data.toJSON()));
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        (async () => {
            try {
                console.log('[System] Syncing mansion protocols with Discord...');
                await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
                console.log('[System] Protocols synchronized.');
            } catch (error) {
                console.error('[System] Sync failed:', error.message);
            }
        })();

        // 4. Initial Wake-up Check
        setTimeout(() => {
            scheduler.checkNow(client);
        }, 10000);
    },
};