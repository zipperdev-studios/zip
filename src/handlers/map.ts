import fs from "fs";
import path from "path";
import client from "@src/client";

const handlerFileRegex = /.*.handler.[tj]s/;

const handlerFiles = fs.readdirSync(__dirname);
for (const file of handlerFiles) {
    if (!handlerFileRegex.test(file)) continue;

    const filePath = path.join(__dirname, file);
    const handler = require(filePath).default;

    if (handler && "event" in handler && "execute" in handler) {
        client.handlers.set(handler.event, handler);
    } else {
        console.log(`🚧 Warning! The handler at ${filePath} is invalid.`);
    }
}
