import { ChatInputCommandInteraction, VoiceBasedChannel } from "discord.js";
import client from "@src/client";

export const getVoiceChannel = async (
    interaction: ChatInputCommandInteraction,
): Promise<VoiceBasedChannel | undefined> => {
    try {
        if (!interaction.guild || !interaction.member) throw new Error();
        const guildId = interaction.guild.id;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) throw new Error();

        const member = guild.members.cache.get(interaction.member.user.id);
        if (!member) throw new Error();

        return member.voice.channel ?? undefined;
    } catch {
        await interaction.reply("오류가 발생했어요 :no_entry_sign:");
    }
};
