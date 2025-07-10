import dotenv from "dotenv";
import { REST, Routes } from "discord.js";
import { commandList } from "./commands";

dotenv.config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

if (!clientId || !guildId || !token) {
  throw new Error(
    "Missing environment variables: CLIENT_ID, GUILD_ID, or DISCORD_TOKEN",
  );
}

commandList.map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commandList.length} application (/) commands.`,
    );

    // PROD
    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commandList,
    });

    // DEV
    // const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    //   body: commandList,
    // });

    if (Array.isArray(data)) {
      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
  } catch (error) {
    console.error(error);
  }
})();
