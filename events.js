const { Client, MessageEmbed } = require('discord.js');
const { default: DisTube } = require('distube');

/**
 * 
 * @param {Client} client
 * @param {DisTube} distube
 */
module.exports = async (client, distube) => {
    distube.on('playSong', async (queue, song) => {
        queue.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('BLURPLE')
                    .setTitle('Now Playing')
                    .setDescription(`   [\`${song.name}\`](${song.url}) [${song.user}] `)
            ]
        });
    });

    distube.on('addSong', async (queue, song) => {
        queue.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('BLURPLE')
                    .setTitle('Song added to queue')
                    .setDescription(`   [\`${song.name}\`](${song.url}) [${song.user}] `)
            ]
        });
    });

    distube.on('disconnect', async (queue) => {
        queue.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('BLURPLE')
                    .setDescription(`Disconnected from ${queue.voiceChannel} Voice Channel`)
            ]
        });
    });
};