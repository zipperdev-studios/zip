import fs from "fs";
import path from "path";
import client from "@src/client";

const commandFileRegex = /.*.command.[tj]s/;

const commandFolders = fs.readdirSync(__dirname);
for (const folder of commandFolders) {
    const commandsPath = path.join(__dirname, folder);
    if (fs.lstatSync(commandsPath).isFile()) continue;

    const commandFiles = fs.readdirSync(commandsPath).filter(file => {
        return commandFileRegex.test(file);
    });
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath).default;

        if (command && "data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`🚧 Warning! The command at ${filePath} is invalid.`);
        }
    }
}
