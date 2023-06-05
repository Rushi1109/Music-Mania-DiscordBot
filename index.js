const { Client, Message, MessageEmbed } = require('discord.js');
const { token, prefix } = require('./config.json');
const Distube = require('distube').default;

const client = new Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES']
});

const distube = new Distube(client, {
    emitNewSongOnly: false,
    leaveOnEmpty: false,
    leaveOnFinish: false,
    leaveOnStop: false,
    savePreviousSongs: true,
    searchSongs: 0,
});

client.on('ready', () => {
    console.log(`${client.user.username} is now Online`);
    client.user.setActivity({
        name: "Music",
        type: "STREAMING",
    });

    require('./events')(client, distube)
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    let args = message.content.slice(prefix.length).trim().split(/ +/);
    let cmd = args.shift()?.toLowerCase();

    let queue = distube.getQueue(message);
    switch (cmd) {
        case "ping": {
            message.reply(`Hey <@${message.author.id}> my ping is ${client.ws.ping}`);
        }
            break;

        case "play": {
            let song = args.join(" ");
            let voiceChannel = message.member.voice.channel;

            if (!voiceChannel) {
                return message.reply(`**You Must Join a Voice Channel First!!**`);
            }
            else if (!song) {
                return message.reply(`**You Must Provide a Valid Song Name/Link**`);
            }
            else {
                distube.play(voiceChannel, song, {
                    member: message.member,
                    message: message,
                    textChannel: message.channel,
                });
            }
        }
            break;

        case "skip": {
            let voiceChannel = message.member.voice.channel;

            if (!voiceChannel) {
                return message.reply(`**You Must Join a Voice Channel First!!**`);
            }
            else if (!queue) {
                return message.reply(`**Queue is empty**`);
            }
            else {
                queue.skip().then(s => {
                    message.reply(`**Song Skipped**`);
                });
            }
        }
            break;

        case "stop": {
            let voiceChannel = message.member.voice.channel;

            if (!voiceChannel) {
                return message.reply(`**You Must Join a Voice Channel First!!**`);
            }
            else if (!queue) {
                return message.reply(`**Queue is empty**`);
            }
            else {
                queue.stop().then(s => {
                    message.reply(`**Song Stopped**`);
                });
            }
        }
            break;

        case "pause": {
            let voiceChannel = message.member.voice.channel;

            if (!voiceChannel) {
                return message.reply(`**You Must Join a Voice Channel First!!**`);
            }
            else if (!queue) {
                return message.reply(`**Queue is empty**`);
            }
            else if (queue.paused) {
                return message.reply(`**Song is already Paused**`)
            }
            else {
                queue.pause();
                message.reply(`**Song Paused**`);
            }
        }
            break;

        case "resume": {
            let voiceChannel = message.member.voice.channel;

            if (!voiceChannel) {
                return message.reply(`**You Must Join a Voice Channel First!!**`);
            }
            else if (!queue) {
                return message.reply(`**Queue is empty**`);
            }
            else if (!queue.paused) {
                return message.reply(`**Song is already playing**`)
            }
            else {
                queue.resume();
                message.reply(`**Song Resumed**`);
            }
        }
            break;

        case "volume": {
            let voiceChannel = message.member.voice.channel;
            let volume = Number(args[0]);

            if (!voiceChannel) {
                return message.reply(`**You Must Join a Voice Channel First!!**`);
            }
            else if (!volume) {
                return message.reply(`**Please Provide Amount of Volume**`)
            }
            else {
                queue.setVolume(volume);
                message.reply(`**Volume adjusted to \`${queue.volume}%**```);
            }
        }
            break;

        case "queue": {
            let voiceChannel = message.member.voice.channel;


            if (!voiceChannel) {
                return message.reply(`**You Must Join a Voice Channel First!!**`);
            }
            else if (!queue) {
                return message.reply(`**Queue is empty**`);
            }
            else {
                let songs = queue.songs.slice(0, 10).map((song, index) => {
                    return `\`${index + 1}\` [\`${song.name}\`] (${song.url}) [${song.formattedDuration}] `
                }).join('\n');

                message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('BLURPLE')
                            .setTitle(`Queue of ${message.guild.name}`)
                            .setDescription(songs)
                            .setFooter({
                                text: `Requested by ${message.author.tag}`,
                                iconURL: message.author.displayAvatarURL({ dynamic: true }),
                            })
                    ]
                });
            }
        }
            break;

        case "loop": {
            let voiceChannel = message.member.voice.channel;
            let loopmode = args[0];
            let mods = ['song', 'queue', 'off'];

            if (!voiceChannel) {
                return message.reply(`**You Must Join a Voice Channel First!!**`);
            }
            else if (!queue) {
                return message.reply(`**Queue is empty**`);
            }
            else if (!mods.includes(loopmode)) {
                return message.reply(`**Wrong Usage \n Select Correct Option ${mods.join(" , ")}**`);
            }
            else {
                if (loopmode === "song") {
                    queue.setRepeatMode(1);
                    message.reply(`Song Loop Enabled`);
                }
                else if (loopmode === "queue") {
                    queue.setRepeatMode(2);
                    message.reply(`Queue Loop Enabled`);
                }
                else if (loopmode === "off") {
                    queue.setRepeatMode(0);
                    message.reply(`Loop Disabled`);
                }
            }
        }
            break;

        default:
            break;
    }
});

client.login(token);