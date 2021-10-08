import { Command } from "./command";
import { Embed, SlashCommandBuilder } from '@discordjs/builders';
// @ts-ignore
import fetch from "node-fetch";
import { Client, CommandInteraction, MessageEmbedOptions } from "discord.js";
import type { CommandFunction } from "../types";

export class InfoCommand extends Command {
    public get applicationCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName('info')
            .setDescription('Get Bot Info')
    }

    async handle(command: CommandInteraction, client: Client): Promise<unknown> {
        const contributors = await fetchContributions();
        const formattedContributors = formatContributors(contributors);

        const embed: MessageEmbedOptions = buildEmbed(formattedContributors, client.user?.avatarURL() ?? undefined);
        return command.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}

interface Contributors {
    type: string,
    html_url: string,
    contributions: number
};

const fetchContributions = async (): Promise<Array<Contributors>> => {
    return fetch("https://api.github.com/repos/NullDev/CSC-Bot/contributors", {
        headers: { Accept: "application/vnd.github.v3+json" }
    }).then((res: any) => res.json());
};

const formatContributors = (contributors: Array<Contributors>): string => {
    return contributors
        .filter(e => e.type === "User")
        .map(e => `<${e.html_url}> (Contributions: ${e.contributions})`)
        .join("\n");
};

const buildEmbed = (fmtContributors: string, avatarUrl?: string): MessageEmbedOptions => {
    return {
        color: 2007432,
        footer: {
            text: `${new Date().toDateString()} ${new Date().toLocaleTimeString()}`
        },
        author: {
            name: "Shitpost Bot",
            url: "https://discordapp.com/users/663146938811547660/",
            icon_url: avatarUrl
        },
        fields: [
            {
                name: "⚙️ Eckdaten",
                value: "**Programmiersprache:** NodeJS \n" +
                    `**NodeJS Version:** ${process.version} \n` +
                    `**PID:** ${process.pid} \n` +
                    `**Uptime:** ${Math.floor(process.uptime())}s \n` +
                    `**Platform:** ${process.platform} \n` +
                    `**System CPU usage time:** ${process.cpuUsage().system} \n` +
                    `**User CPU usage time:** ${process.cpuUsage().user} \n` +
                    `**Architecture:** ${process.arch}`,
                inline: true
            },
            {
                name: "🔗 Source Code",
                value: "**Link:** https://github.com/NullDev/CSC-Bot ",
                inline: true
            },
            {
                name: "🪛 Contributors",
                value: `${fmtContributors}`,
                inline: false
            }
        ]
    };
}

export const run: CommandFunction = async(client, message, args) => {
    const contributors = await fetchContributions();
    const formattedContributors = formatContributors(contributors);

    const embed: MessageEmbedOptions = buildEmbed(formattedContributors, client.user?.avatarURL() ?? undefined);
    await message.channel.send({ embeds: [embed] });
    await message.react("⚙️"); // Only react when the message was actually sent
};

export const description = "Listet Informationen über diesen Bot in einem Embed auf";
