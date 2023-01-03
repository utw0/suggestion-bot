const { Client } = require('discord.js');
const config = require('../../config.json');
const path = require('path');
const fs = require('fs');

/**
 * 
 * @param {Client} client 
 */
module.exports = async (client) => {
    const guild = client.guilds.cache.get(config.guildId);
    await guild.commands.fetch();
    for(let [name, cmd] of guild.commands.cache.filter(cmd => cmd.applicationId == client.user.id)) await cmd.delete().catch(()=>void 0); 
    
    function handle(dirname = path.join(process.cwd(), "src/commands")) {
        fs.readdirSync(dirname)
        .forEach(async (dir) => {
            if(dir.endsWith(".js")) {
                const command = require(path.relative(__dirname, path.join(dirname, dir)))( client );
                client.commands.set(command.render().name, command);

                try {
                    await guild.commands.create(command.render().toJSON());
                } catch (err) {
                    console.error(err);
                };
            } else handle(path.join(dirname, dir));
        });
    }; handle();

    console.log(`Bot Bağlandı ${client.user.username}`);
};