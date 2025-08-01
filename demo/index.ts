import {
  McpServer,
  ReadResourceCallback,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolResult,
  ContentBlock,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
});

server.registerResource(
  "character",
  new ResourceTemplate("character://{characterUid}", { list: undefined }),
  {
    title: "Star Trek Character",
    description:
      "Fetch information about a specific star trek character by name",
  },
  async (uri, { characterUid }) => {
    const response = await fetch(
      `https://stapi.co/api/v1/rest/character?uid=${characterUid}`
    );

    const json = await response.json();
    console.error(JSON.stringify(json, null, 2));

    const parsed = z
      .object({
        character: z.object({
          name: z.string(),
          characterSpecies: z.union([
            z.array(
              z.object({
                name: z.string(),
              })
            ),
            z.object({
              name: z.string(),
            }),
          ]),
          performers: z.array(
            z.object({
              name: z.string(),
            })
          ),
          episodes: z.array(
            z.object({
              title: z.string(),
              series: z.object({
                title: z.string(),
              }),
              season: z.object({
                title: z.string(),
              }),
            })
          ),
          movies: z.array(
            z.object({
              title: z.string(),
            })
          ),
        }),
      })
      .parse(json);

    const result: ReadResourceResult = {
      contents: [
        {
          uri: uri.toString(),
          type: "text",
          text: JSON.stringify(parsed),
        },
      ],
    };

    return result;
  }
);

server.registerTool(
  "character-search",
  {
    title: "Star Trek Character Search",
    description: "Search for a star trek character by name",
    inputSchema: z.object({ name: z.string() }).shape,
  },
  async ({ name }): Promise<CallToolResult> => {
    console.error(`searching for characters names ${name}`);

    const fetchBody = new URLSearchParams();
    fetchBody.append("title", name);
    fetchBody.append("name", name);

    const response = await fetch(
      "https://stapi.co/api/v1/rest/character/search",
      {
        method: "POST",
        body: fetchBody,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
      }
    );

    const json = await response.json();

    const parsed = z
      .object({
        characters: z.array(
          z.object({
            uid: z.string(),
          })
        ),
      })
      .parse(json);

    const withDetails = await Promise.all(
      parsed.characters.slice(0, 10).map(async ({ uid }) => {
        const charDetailsResp = await fetch(
          `https://stapi.co/api/v1/rest/character?uid=${uid}`
        );

        const json = await charDetailsResp.json();

        const parsed = z
          .object({
            character: z.object({
              name: z.string(),
              characterSpecies: z.union([
                z.array(
                  z.object({
                    name: z.string(),
                  })
                ),
                z.object({
                  name: z.string(),
                }),
              ]),
              performers: z.array(
                z.object({
                  name: z.string(),
                })
              ),
              episodes: z.array(
                z.object({
                  title: z.string(),
                  series: z.object({
                    title: z.string(),
                  }),
                  season: z.object({
                    title: z.string(),
                  }),
                })
              ),
              movies: z.array(
                z.object({
                  title: z.string(),
                })
              ),
            }),
          })
          .parse(json);

        return parsed.character;
      })
    );

    return {
      content: withDetails.flatMap((char): ContentBlock[] => [
        {
          type: "text",
          text: [
            `Name: ${char.name}`,
            `Species: ${[char.characterSpecies]
              .flat()
              .map(({ name }) => name)
              .join(", ")}`,
            `Episodes: `,
            ...char.episodes.map((ep) => ` - ${ep.season.title} - ${ep.title}`),
            `Movies:`,
            ...char.movies.map((ep) => ` - ${ep.title}`),
          ].join("\n"),
        },
      ]),
      structuredContent: parsed,
    };
  }
);

const transport = new StdioServerTransport();
server.connect(transport).catch((err) => {
  console.error("error with MCP server");
  console.error(err);
});
