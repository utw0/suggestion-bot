const config = require('../config.json');
const data = require('quick.db');
const { Client, Intents, Collection,Discord } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: Object.values(Intents.FLAGS),
    partials: ["CHANNEL", "GUILD_MEMBER", "USER", "GUILD"]
});
client.commands = new Collection();
client.login(config.token);

fs.readdirSync(path.resolve(__dirname, "events"))
.filter(f => f.endsWith(".js"))
.forEach(name => client.on(name.split(".js")[0], (...args) => require(`./events/${name}`)( client, ...args )));

