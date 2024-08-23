// sort-imports-ignore
import "./env";
import "@handlers/map";
import "@commands/map";
import { registerCommands } from "@commands/register";
import client from "./client";

(async () => {
    if (process.env.NODE_ENV === "dev" && process.env.TEST_GUILD_ID) {
        await registerCommands(process.env.TEST_GUILD_ID);
    } else {
        await registerCommands();
    }
})();

for (const [event, handler] of client.handlers) {
    if (handler.once) {
        client.once(event, handler.execute);
    } else {
        client.on(event, handler.execute);
    }
}

client.login(process.env.DISCORD_TOKEN);
