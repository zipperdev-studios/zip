import {
    ActionRowBuilder,
    Command,
    ComponentType,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
} from "discord.js";
import client from "@src/client";
import commandGuard from "@guards/command.guard";
import voiceGuard, { VoiceGuardExecute } from "@guards/voice.guard";
import { Repeat } from "./types";
import { getVoiceChannel } from "./utils";

const options = new Map([
    [
        Repeat.All,
        {
            label: "🔁 전체 반복",
            description: "전체 음악 목록을 반복합니다.",
            value: Repeat.All,
        },
    ],
    [
        Repeat.Single,
        {
            label: "🔂 한 곡 반복",
            description: "현재 음악만 반복합니다.",
            value: Repeat.Single,
        },
    ],
    [
        Repeat.None,
        {
            label: "📤 반복 없음",
            description: "반복을 해제합니다.",
            value: Repeat.None,
        },
    ],
]);

const execute: VoiceGuardExecute<[]> = async interaction => {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder("원하는 반복 모드를 선택해주세요.")
        .setOptions(Array.from(options.values()));
    const actionRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu,
        );

    const reply = await interaction.reply({
        components: [actionRow],
    });
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: i =>
            i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 1000 * 30,
    });

    collector.on("collect", async selectInteraction => {
        if (!interaction.guild) return;
        const guildId = interaction.guild.id;
        let dj = client.djs.get(guildId);
        const channel = await getVoiceChannel(interaction);
        if (!channel)
            return selectInteraction.reply(
                "음악 설정을 위해서 음성 채널에 들어가주세요 :headphones:",
            );
        if (!dj)
            return selectInteraction.reply(
                "음악이 재생 중이지 않습니다 :no_entry_sign:",
            );

        let repeat = Repeat.All;
        switch (selectInteraction.values[0]) {
            case Repeat.None:
                repeat = Repeat.None;
                break;
            case Repeat.Single:
                repeat = Repeat.Single;
                break;
        }

        dj.options.repeat = repeat;
        client.djs.set(guildId, dj);

        return selectInteraction.reply(
            `반복 모드를 \`${options.get(repeat)!.label}\`으로 설정했어요 :white_check_mark:`,
        );
    });
};

const setRepeat: Command = {
    data: new SlashCommandBuilder()
        .setName("반복")
        .setDescription("음악 반복 모드를 설정합니다."),
    execute: interaction =>
        commandGuard<[]>(interaction, setRepeat.data, (...props) =>
            voiceGuard(...props, execute),
        ),
};

export default setRepeat;
