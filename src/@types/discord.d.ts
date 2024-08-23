import {
    ChatInputCommandInteraction,
    ClientEvents,
    Collection,
    Client as DiscordClient,
    SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { VoiceBasedChannel } from "discord.js";
import { AudioPlayer, AudioResource, VoiceConnection } from "@discordjs/voice";
import { Player } from "discord-player";
import DisTube from "distube";
import { DJ } from "@commands/dj/types";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, Command>;
        handlers: Collection<string, Handler<keyof ClientEvents>>;
        djs: Collection<string, DJ>;
    }

    export interface Command {
        data: SlashCommandOptionsOnlyBuilder;
        execute: (
            interaction: ChatInputCommandInteraction,
        ) => Promise<unknown> | unknown;
    }

    export interface Handler<Event extends keyof ClientEvents> {
        event: Event;
        once: boolean;
        execute: (...args: ClientEvents[Event]) => Promise<unknown> | unknown;
    }

    export * from "discord.js";
}
