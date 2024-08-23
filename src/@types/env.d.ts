export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "dev" | "prod";
            DISCORD_TOKEN: string;
            DISCORD_CLIENT_ID: string;
            TEST_GUILD_ID?: string;
        }
    }
}
