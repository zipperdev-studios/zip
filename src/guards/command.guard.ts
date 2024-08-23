import {
    ChatInputCommandInteraction,
    SlashCommandOptionsOnlyBuilder,
} from "discord.js";

type NonNullFields<I> = { [K in keyof I]: NonNullable<I[K]> };
export type ExecuteInteraction = NonNullFields<
    Pick<ChatInputCommandInteraction, "guild" | "member">
> &
    ChatInputCommandInteraction;

export type CommandGuardExecute<O extends unknown[]> = (
    interaction: ExecuteInteraction,
    options: O,
) => Promise<unknown> | unknown;

const commandGuard = async <O extends unknown[]>(
    interaction: ChatInputCommandInteraction,
    data: SlashCommandOptionsOnlyBuilder,
    execute: CommandGuardExecute<O>,
) => {
    try {
        const options = [];
        if (data.options.length > 0) {
            for (const option of data.options) {
                const { name, required } = option.toJSON();
                const info = interaction.options.get(name, required);
                if (!info || !info.value) throw new Error();
                options.push(info.value);
            }
        }

        if (interaction.guild === null || interaction.member === null)
            throw new Error();

        await execute(interaction as ExecuteInteraction, options as O);
    } catch (error) {
        console.error(error);
        return interaction.reply({
            content: "오류가 발생했어요 :no_entry_sign:",
        });
    }
};

export default commandGuard;
