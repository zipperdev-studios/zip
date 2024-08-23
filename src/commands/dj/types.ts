import { VoiceBasedChannel } from "discord.js";
import { AudioPlayer, AudioResource, VoiceConnection } from "@discordjs/voice";

export interface Audio {
    title: string;
    url: string;
}

export const enum Repeat {
    None = "0",
    All = "1",
    Single = "2",
}

export interface DJOptions {
    volume: number;
    repeat: Repeat;
}

export interface DJ {
    queue: Audio[];
    player: AudioPlayer;
    resource?: AudioResource;
    voice: {
        channel: VoiceBasedChannel;
        connection: VoiceConnection;
    };
    options: DJOptions;
}
