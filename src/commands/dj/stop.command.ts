import { Command, SlashCommandBuilder } from "discord.js";
import client from "@src/client";
import commandGuard, { CommandGuardExecute } from "@guards/command.guard";
import { DJ } from "./types";
import { getVoiceChannel } from "./utils";

export const stopQueue = (dj: DJ) => {
    dj.player.stop();
    dj.voice.connection.disconnect();
    dj.queue = [];
    dj.resource = undefined;
    client.djs.set(dj.voice.channel.guild.id, dj);
};

const execute: CommandGuardExecute<[]> = async interaction => {
    const channel = await getVoiceChannel(interaction);
    if (!channel)
        return interaction.reply(
            "음악 설정을 위해서 음성 채널에 들어가주세요 :headphones:",
        );
    if (client.voice.adapters.size <= 0)
        return interaction.reply("음악이 재생 중이지 않습니다 :no_entry_sign:");
    const guildId = interaction.guild.id;
    let dj = client.djs.get(guildId);

    if (dj) stopQueue(dj);

    return interaction.reply("재생을 중지했어요 :stop_sign:");
};

const stop: Command = {
    data: new SlashCommandBuilder()
        .setName("멈춤")
        .setDescription("음악 재생을 마칩니다."),
    execute: interaction => commandGuard<[]>(interaction, stop.data, execute),
};

export default stop;
