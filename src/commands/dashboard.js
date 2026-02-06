const { SlashCommandBuilder } = require('discord.js');
const { generateDashboardEmbed } = require('../utils/dashboardHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('View your current learning schedule'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        
        // Pass GuildID so Koharu knows which mansion's rhythms to show
        const embed = await generateDashboardEmbed(interaction.client, interaction.user.id, interaction.guild.id);
        
        await interaction.editReply({ embeds: [embed] });
    }
};