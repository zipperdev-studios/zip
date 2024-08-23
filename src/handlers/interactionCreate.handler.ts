import { ChatInputCommandInteraction, Events, Handler } from "discord.js";
import client from "@src/client";

const interactionCreate: Handler<Events.InteractionCreate> = {
    event: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(
                    interaction as ChatInputCommandInteraction,
                );
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "오류가 발생했어요 :no_entry_sign:",
                });
            }
        }
    },
};

export default interactionCreate;
