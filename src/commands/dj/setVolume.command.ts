import { Command, SlashCommandBuilder } from "discord.js";
import commandGuard from "@guards/command.guard";
import voiceGuard, { VoiceGuardExecute } from "@guards/voice.guard";

type SetVolumeOption = [number];

const execute: VoiceGuardExecute<SetVolumeOption> = async (
    interaction,
    dj,
    [volume],
) => {
    if (volume < 1 || volume > 100)
        return interaction.reply("볼륨이 범위를 벗어나요 :no_entry_sign:");

    dj.options.volume = volume;
    dj.resource?.volume?.setVolume(volume / 100);

    return interaction.reply(
        `볼륨을 \`${volume}%\`로 설정했어요 :white_check_mark:`,
    );
};

const setVolume: Command = {
    data: new SlashCommandBuilder()
        .setName("볼륨")
        .setDescription("음악 볼륨을 조절합니다.")
        .addNumberOption(option =>
            option
                .setName("볼륨")
                .setDescription("원하는 볼륨을 설정합니다. (1 ~ 100)")
                .setRequired(true),
        ),
    execute: interaction =>
        commandGuard<SetVolumeOption>(interaction, setVolume.data, (...props) =>
            voiceGuard(...props, execute),
        ),
};

export default setVolume;
