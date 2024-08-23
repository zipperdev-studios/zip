import {
    REST,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    Routes,
} from "discord.js";
import client from "@src/client";

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

const commandDatas: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
for (const command of client.commands.values()) {
    commandDatas.push(command.data.toJSON());
}

export const registerCommands = async (guildId?: string) => {
    try {
        if (guildId) {
            console.log("📤 Registering application (/) guild commands.");
            await rest.put(
                Routes.applicationGuildCommands(
                    process.env.DISCORD_CLIENT_ID,
                    guildId,
                ),
                { body: commandDatas },
            );
        } else {
            console.log("📤 Registering application (/) commands.");
            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: commandDatas },
            );
        }

        console.log(
            `✅ Successfully registered ${commandDatas.length} application (/) commands.`,
        );
    } catch (error) {
        console.log(error);
    }
};
