import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Command,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import client from "@src/client";
import commandGuard from "@guards/command.guard";
import voiceGuard, { VoiceGuardExecute } from "@guards/voice.guard";
import { stopQueue } from "./stop.command";
import { Audio } from "./types";

type EditMode = "select" | "move";
const BUTTON = {
    PREV: "dj_edit:prev",
    NEXT: "dj_edit:next",
    MOVE: "dj_edit:move",
    REMOVE: "dj_edit:remove",
    EXIT: "dj_edit:exit",
};

const getQueueStr = (queue: Audio[], target: number) => {
    let queueStr = "";
    let i = 0;
    for (const audio of queue) {
        i++;
        if (i == target + 1) {
            queueStr += `**${i}. ${audio.title}\n**`;
        } else queueStr += `${i}. ${audio.title}\n`;
    }
    return queueStr;
};

const execute: VoiceGuardExecute<[]> = async (interaction, dj) => {
    let queue: Audio[] = dj.queue;
    let target: number = 0;
    let mode: EditMode = "select";

    const queueEmbed = new EmbedBuilder()
        .setColor(0xffbc4f)
        .setTitle("대기열 편집 :memo:")
        .setDescription(getQueueStr(queue, target));
    const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
            .setCustomId(BUTTON.PREV)
            .setEmoji("◀️")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(BUTTON.NEXT)
            .setEmoji("▶️")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(BUTTON.MOVE)
            .setEmoji("↔️")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(BUTTON.REMOVE)
            .setEmoji("🗑️")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(BUTTON.EXIT)
            .setLabel("나가기")
            .setStyle(ButtonStyle.Danger),
    );

    const reply = await interaction.reply({
        embeds: [queueEmbed],
        components: [actionRow],
    });
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: i => i.user.id === interaction.user.id,
        idle: 1000 * 15,
    });

    collector.on("collect", async i => {
        let prevQueue: Audio[] = [...queue];
        const curTarget = target;
        switch (i.customId) {
            case BUTTON.PREV:
                target = (target + queue.length - 1) % queue.length;
                break;
            case BUTTON.NEXT:
                target = (target + 1) % queue.length;
                break;
            case BUTTON.MOVE:
                if (mode === "select") {
                    mode = "move";
                } else mode = "select";
                break;
            case BUTTON.REMOVE:
                queue = queue
                    .toSpliced(target, 1)
                    .filter(audio => audio !== undefined);
                if (target >= queue.length) target = queue.length - 1;
                break;
            case BUTTON.EXIT:
                await reply.edit({ components: [] });
                collector.stop();
                return i.deferUpdate();
        }

        if (
            mode === "move" &&
            (i.customId === BUTTON.PREV || i.customId === BUTTON.NEXT)
        ) {
            queue[target] = queue.splice(curTarget, 1, queue[target])[0];
        }

        queueEmbed.setTitle(
            "대기열 편집 :memo:" + (mode === "move" ? " (이동)" : ""),
        );
        queueEmbed.setColor(mode === "select" ? 0xffbc4f : 0xa9de88);
        if (queue.length <= 0) {
            queueEmbed.setDescription("대기열이 비어있어요.");
            collector.stop();
            stopQueue(dj);
            await reply.edit({ embeds: [queueEmbed], components: [] });
        } else {
            queueEmbed.setDescription(getQueueStr(queue, target));
            if (JSON.stringify(queue) !== JSON.stringify(prevQueue)) {
                if (queue[0].url === prevQueue[0].url) {
                    client.djs.set(interaction.guild.id, {
                        ...dj,
                        queue,
                    });
                } else {
                    prevQueue = [...queue];
                    prevQueue.unshift(prevQueue.pop()!);
                    client.djs.set(interaction.guild.id, {
                        ...dj,
                        queue: prevQueue,
                    });
                    dj.player.stop();
                }
            }
            await reply.edit({ embeds: [queueEmbed] });
        }
        return i.deferUpdate();
    });

    collector.on("end", () => {
        queueEmbed.setTitle("대기열 편집 :memo:");
        queueEmbed.setColor(0xffbc4f);
        reply.edit({ embeds: [queueEmbed], components: [] });
    });
};

const edit: Command = {
    data: new SlashCommandBuilder()
        .setName("대기열_편집")
        .setDescription("대기열을 편집합니다."),
    execute: interaction =>
        commandGuard<[]>(interaction, edit.data, (...props) =>
            voiceGuard(...props, execute),
        ),
};

export default edit;
