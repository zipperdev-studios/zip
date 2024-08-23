import { Events, Handler } from "discord.js";

const interactionCreate: Handler<Events.ClientReady> = {
    event: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`🚀 Bot launched! Logged in as ${client.user.tag}`);
    },
};

export default interactionCreate;
