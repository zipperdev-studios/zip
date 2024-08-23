import client from "@src/client";
import { DJ } from "@commands/dj/types";
import { getVoiceChannel } from "@commands/dj/utils";
import { ExecuteInteraction } from "./command.guard";

export type VoiceGuardExecute<O extends unknown[]> = (
    interaction: ExecuteInteraction,
    dj: DJ,
    options: O,
) => Promise<unknown> | unknown;

const voiceGuard = async <O extends unknown[]>(
    interaction: ExecuteInteraction,
    options: O,
    execute: VoiceGuardExecute<O>,
) => {
    const channel = await getVoiceChannel(interaction);
    if (!channel)
        return interaction.reply(
            "음악 설정을 위해서 음성 채널에 들어가주세요 :headphones:",
        );

    const guildId = interaction.guild.id;
    const dj = client.djs.get(guildId);
    if (!dj)
        return interaction.reply("음악이 재생 중이지 않습니다 :no_entry_sign:");
    if (channel.id !== dj.voice.channel.id)
        return interaction.reply(
            "같은 음성 채널에 있지 않습니다 :no_entry_sign:",
        );

    await execute(interaction, dj, options);
};

export default voiceGuard;
