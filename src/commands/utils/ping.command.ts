import { Command, SlashCommandBuilder } from "discord.js";
import moment from "moment";
import commandGuard from "@guards/command.guard";

const ping: Command = {
    data: new SlashCommandBuilder()
        .setName("핑")
        .setDescription("퐁! 집의 상태를 확인할 수 있습니다."),
    execute: interaction =>
        commandGuard(interaction, ping.data, interaction => {
            const createdAt = moment(interaction.createdTimestamp);
            const ping = moment().diff(createdAt, "milliseconds");
            return interaction.reply(`:ping_pong: 퐁! (\`${ping}ms\`)`);
        }),
};

export default ping;
