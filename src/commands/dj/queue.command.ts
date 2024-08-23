import { Command, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import commandGuard from "@guards/command.guard";
import voiceGuard, { VoiceGuardExecute } from "@guards/voice.guard";

const execute: VoiceGuardExecute<[]> = (interaction, dj) => {
    let queueStr = "";
    let i = 0;
    for (const audio of dj.queue) {
        i++;
        if (i == 1) {
            queueStr += `**1. ${audio.title}\n**`;
        } else queueStr += `${i}. ${audio.title}\n`;
    }

    const queueEmbed = new EmbedBuilder()
        .setColor(0xffbc4f)
        .setTitle("대기열 :clipboard:")
        .setDescription(queueStr);

    return interaction.reply({ embeds: [queueEmbed] });
};

const queue: Command = {
    data: new SlashCommandBuilder()
        .setName("대기열")
        .setDescription("음악 대기열을 알려줍니다."),
    execute: interaction =>
        commandGuard<[]>(interaction, queue.data, (...props) =>
            voiceGuard(...props, execute),
        ),
};

export default queue;
