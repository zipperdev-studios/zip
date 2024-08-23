import { Command, SlashCommandBuilder } from "discord.js";
import commandGuard from "@guards/command.guard";
import voiceGuard, { VoiceGuardExecute } from "@guards/voice.guard";

const execute: VoiceGuardExecute<[]> = async (interaction, dj) => {
    dj.player.stop();
    return interaction.reply("음악을 건너뛰었어요 :next_track:");
};

const stop: Command = {
    data: new SlashCommandBuilder()
        .setName("스킵")
        .setDescription("현재 재생 중인 음악을 건너뜁니다."),
    execute: interaction =>
        commandGuard<[]>(interaction, stop.data, (...props) =>
            voiceGuard(...props, execute),
        ),
};

export default stop;
