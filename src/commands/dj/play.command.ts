import { Command, SlashCommandBuilder } from "discord.js";
import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import yts from "youtube-sr";
import client from "@src/client";
import commandGuard, { CommandGuardExecute } from "@guards/command.guard";
import { stopQueue } from "./stop.command";
import { Audio, DJ, Repeat } from "./types";
import { getVoiceChannel } from "./utils";

type PlayOptions = [string];

const searchVideos = async (query: string): Promise<Audio[]> => {
    const videos = await yts.search(query, {
        type: "video",
        limit: 5,
    });

    const audios: Audio[] = [];
    for (const video of videos) {
        if (!video.live) {
            audios.push({
                title: video.title ?? "`알 수 없음`",
                url: video.url,
            });
        }
    }

    return audios;
};

const playQueue = (dj: DJ) => {
    const stream = ytdl(dj.queue[0].url, {
        filter: "audioonly",
        highWaterMark: 1 << 25,
    });
    const resource = createAudioResource(stream, { inlineVolume: true });

    resource.volume?.setVolume(dj.options.volume / 100);
    dj.player.play(resource);
    dj.resource = resource;
    client.djs.set(dj.voice.channel.guildId, dj);
};

const execute: CommandGuardExecute<PlayOptions> = async (
    interaction,
    [queryOrLink],
) => {
    const channel = await getVoiceChannel(interaction);
    if (!channel)
        return interaction.reply(
            "음악 설정을 위해서 음성 채널에 들어가주세요 :headphones:",
        );
    const guildId = interaction.guild.id;
    let dj = client.djs.get(guildId);

    let audio: Audio;
    if (yts.validate(queryOrLink, "VIDEO")) {
        const video = await yts.getVideo(queryOrLink);
        audio = {
            title: video.title ?? "`알 수 없음`",
            url: video.url,
        };
    } else {
        const audios = await searchVideos(queryOrLink);
        if (audios.length <= 0)
            return interaction.reply(
                "음악을 찾을 수 없어요 :open_file_folder:",
            );
        audio = audios[0];
    }

    if (!dj || dj.queue.length <= 0) {
        const player = createAudioPlayer();
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfMute: false,
        });
        connection.configureNetworking();
        connection.subscribe(player);

        dj = {
            player,
            queue: [audio],
            voice: { channel, connection },
            options: dj?.options ?? {
                volume: 100,
                repeat: Repeat.All,
            },
        };
        client.djs.set(guildId, dj);
        playQueue(dj);

        player.on("stateChange", (_, { status }) => {
            if (status === AudioPlayerStatus.Idle) {
                let dj = client.djs.get(guildId);
                if (!dj) return;

                switch (dj.options.repeat) {
                    case Repeat.None:
                        dj.queue.shift();
                        break;
                    case Repeat.All:
                        const curAudio = dj.queue[0];
                        dj.queue = dj.queue.slice(1);
                        dj.queue.push(curAudio);
                        break;
                    case Repeat.Single:
                        break;
                }

                client.djs.set(guildId, dj);
                if (dj.queue.length > 0) {
                    playQueue(dj);
                } else stopQueue(dj);
            }
        });

        return interaction.reply(`\`${audio.title}\`을 재생합니다 :notes:`);
    } else {
        dj.queue.push(audio);
        client.djs.set(guildId, dj);
        return interaction.reply(
            `\`${audio.title}\`을 대기열에 추가했어요 :inbox_tray:`,
        );
    }
};

const play: Command = {
    data: new SlashCommandBuilder()
        .setName("재생")
        .setDescription("음악을 재생합니다.")
        .addStringOption(option =>
            option
                .setName("검색_또는_링크")
                .setDescription("유튜브에서 영상을 검색하거나 찾습니다.")
                .setRequired(true),
        ),
    execute: interaction =>
        commandGuard<PlayOptions>(interaction, play.data, execute),
};

export default play;
