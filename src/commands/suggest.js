const { Client, CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { colors } = require('discord-toolbox');
const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('quick.db');
const config = require("../../config.json");

module.exports = (client) => ({
    render() {
        return new SlashCommandBuilder()
            .setName("suggest")
            .setDescription("Yeni bir şey veya değişiklik önerin!")
            .addStringOption(option =>
                option.setRequired(true)
                    .setName("öneri")
                    .setDescription("Önerinizi açıklayın")
            )
    },
    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    async execute(client, interaction) {
        if(!db.has("suggestions")) db.set("suggestions", {});

        await interaction.deferReply();
        const errorEmbed = new MessageEmbed()
            .setColor(colors.green)
            .setDescription("Hata!!")
        
        const channel = interaction.guild.channels.cache
            .filter(channel => channel.type == "GUILD_TEXT")
            .get(config.channelId);
        if(!channel) return interaction.editReply({ embeds: [errorEmbed] }).catch(()=>void 0);
        
        const validEmbed = new MessageEmbed()
            .setColor(colors.green)
            .setDescription("✅ - Öneriniz gönderildi!" + ` (${channel.toString()})`)

        const details = interaction.options.getString("öneri");
        
        const ID = Object.values(db.get("suggestions")).length ? Object.values(db.get("suggestions")).sort((a,b) => a.id - b.id)[0] + 1 : 1;
        const suggestion = {
            id: ID,
            authorId: interaction.user.id,
            details, created: new Date(new Date().setHours(new Date().getHours() +2)),
            upvotes: [],
            downvotes: [],
            accepted: false,
            refused: false,
            deleted: false,
            active: true,
            acceptedBy: null,
            refusedBy: null,
            deletedBy: null
        };
        db.set(`suggestions.${ID}`, suggestion);

        let suggestionEmbed = new MessageEmbed()
            .setColor(colors[config.suggestionsColor] || config.suggestionsColor || colors.blue)
            .setAuthor( {name: `${interaction.user.tag}' Önerisi`, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`> ${details}`)
            .addField("👍 Olumlu Oy",`\`\`\`0\`\`\``, true)
            .addField("👎 Olumsuz Oy",`\`\`\`0\`\`\``, true)
            .setFooter({ text: "Bir şey önermek / Geri bildirimde bulunmak isterseniz /suggest komutunu kullanın"})
        let components = [
            new MessageActionRow().addComponents([
                new MessageButton()
                    .setStyle("SUCCESS")
                    .setEmoji("999096619649728552")
                    .setCustomId(`SUGGESTION_UPVOTE_${ID}`)
                , new MessageButton()
                    .setStyle("DANGER")
                    .setEmoji("999096621298110615")
                    .setCustomId(`SUGGESTION_DOWNVOTE_${ID}`)
            ])
        ];

        try {
            const message = await channel.send({ embeds: [suggestionEmbed], components });
            await message.startThread({ name: "Daha fazla bilgi" });

            interaction.editReply({ embeds: [validEmbed] }).catch(()=>void 0);
        } catch (err) {
            interaction.editReply({ embeds: [errorEmbed] }).catch(() => void 0);
            console.error(err);
        }
    }
});
