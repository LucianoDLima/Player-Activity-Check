import dotenv from "dotenv";
import { createClient } from "./bot/client";
import { commandsHandler } from "./bot/events";

dotenv.config();

const client = createClient();

client.once("ready", () => {
  if (!client.user) {
    throw new Error("Client user is not defined");
  }

  console.log(`Disc bot online: ${client.user.tag}`);
});

commandsHandler(client);

client.login(process.env.DISCORD_TOKEN);
