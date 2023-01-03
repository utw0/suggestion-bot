const { Client, Interaction } = require('discord.js');
const config = require('../../config.json');
const db = require('quick.db');

/**
 * 
 * @param {Client} client 
 * @param {Interaction} interaction 
 */
module.exports = async (client, interaction) => {
    if(!interaction.guild || !interaction.guild.available || interaction.guild.id !== config.guildId) return;
    
    if(interaction.isCommand()) {
        const commandName = interaction.commandName;
        const command = client.commands.get(commandName);
        if(command) command.execute(client, interaction);
    };

    if(interaction.isButton() && interaction.customId.startsWith("SUGGESTION")) {
        const props = interaction.customId.split("_");
        const action = props[1];
        const suggestion = db.get(`suggestions.${props[2]}`);
        
        if(action == "UPVOTE") {
            if(suggestion.upvotes.includes(interaction.user.id)) {
                suggestion.upvotes.splice(suggestion.upvotes.indexOf(interaction.user.id), 1);
            } else {
                if(suggestion.downvotes.includes(interaction.user.id)) suggestion.downvotes.splice(suggestion.downvotes.indexOf(interaction.user.id), 1);
                suggestion.upvotes.push(interaction.user.id);
            };
            
            db.set(`suggestions.${suggestion.id}`, suggestion);
            let embed = interaction.message.embeds[0];
            embed.spliceFields(0, embed.fields.length);
            embed.addField("👍 Olumlu Oy",`\`\`\`${suggestion.upvotes.length}\`\`\``, true)
            embed.addField("👎 Olumsuz Oy",`\`\`\`${suggestion.downvotes.length}\`\`\``, true)
            try {
                await interaction.update({ content: interaction.message.content || null, embeds: [embed], components: interaction.message.components });
            } catch (err) {
                throw err;
            };
        } else if(action == "DOWNVOTE") {
            if(suggestion.downvotes.includes(interaction.user.id)) {
                suggestion.downvotes.splice(suggestion.downvotes.indexOf(interaction.user.id), 1);
            } else {
                if(suggestion.upvotes.includes(interaction.user.id)) suggestion.upvotes.splice(suggestion.upvotes.indexOf(interaction.user.id), 1);
                suggestion.downvotes.push(interaction.user.id);
            };
            
            db.set(`suggestions.${suggestion.id}`, suggestion);
            let embed = interaction.message.embeds[0];
            embed.spliceFields(0, embed.fields.length);
            embed.addField("👍 Olumlu Oy",`\`\`\`${suggestion.upvotes.length}\`\`\``, true)
            embed.addField("👎 Olumsuz Oy",`\`\`\`${suggestion.downvotes.length}\`\`\``, true)
            try {
                await interaction.update({ content: interaction.message.content || null, embeds: [embed], components: interaction.message.components });
            } catch (err) {
                throw err;
            };
        };
    };
};