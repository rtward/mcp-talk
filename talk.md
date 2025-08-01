% Model Context Protocol
% Robert Ward <robert@rtward.com>
%![](static/qrcode.png)<br/>Talk: [${TALK_URL}](${TALK_URL})<br/>Repo: [${REPO_URL}](${REPO_URL})

# Introduction

## The Problem

LLM models can't access data outside their training set.

## The solution

Model Context Protocol (MCP)

 - A standard API for LLMs
 - Simple data format with human (or LLM) readable specs
 - Can work locally or remotely

# What is MCP?

## Model Context Protocol Overview

A standardized protocol for connecting AI models to external data sources and tools:

- **Open standard** by Anthropic
- **Bidirectional communication** between AI and systems
- **Secure and controlled** access to resources

## Key Benefits

- **Real-time data access** - Live databases, APIs, files
- **Tool integration** - Execute commands, run scripts
- **Standardized interface** - Works across different AI systems
- **Security first** - Controlled access and permissions

::: notes

Emphasize that MCP is not just another API - it's a protocol designed specifically for AI-human-system interactions with security and context in mind.

:::

# Core Architecture

## MCP Components

**MCP Server**:
- Exposes resources and tools
- Handles authentication
- Manages data access

## MCP Components

**MCP Client**:
- AI application or assistant
- Makes requests to servers
- Processes responses

## MCP Components

**Transport Layer**:
- JSON-RPC over stdio, HTTP, or WebSockets
- Standardized message format

## Resource Types

- **Resources** - Read-only data (files, databases, APIs)
- **Tools** - Executable functions (scripts, commands)
- **Prompts** - Reusable prompt templates
- **Completions** - AI model completions

::: notes

Draw a simple diagram on the whiteboard showing the client-server relationship and data flow.

:::

# Building with MCP

## Quick Start Steps

```bash
npm init
npm install @modelcontextprotocol/sdk
```

## Creating an MCP Server

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-server",
  version: "1.0.0",
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Implementing Resources

```typescript
server.registerResource("user", "user://{userId}/info",
  {
    title: "Application Config",
    description: "Application configuration data",
  },
  async (uri, { userId }) => ({
    contents: [{
      uri: uri.href,
      text: `Profile data for user ${userId}`
    }]
  })
);
```

## Implementing Tools

```typescript
server.registerTool(
    "tool-name",
    "tool description", 
    { number: z.number() },
    (input) => result
);
```

## Implementing Prompts

```typescript
server.registerPrompt(
  "review-code",
  {
    title: "Code Review",
    description: "Review code for best practices and potential issues",
    argsSchema: { code: z.string() }
  },
  ({ code }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please review this code:\n\n${code}`
      }
    }]
  })
);
```

## Sampling

```typescript
async function toolHandler() {
    const someText = await getALotOfTextFromTheDatabase()
    const summary = await mcpServer.server.createMessage({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please summarize the following:\n\n${text}`,
          },
        },
      ],
      maxTokens: 500,
    });
    return summary;
}
```

# Connect to Claude

Go to Settings > Developer > Edit Config
```
{
  "servers": {
    "my-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/my/mcp.js"]
    },
  }
}
```

# Demo Time

# Questions & Discussion

---

Robert Ward <robert@rtward.com>

![](static/qrcode.png)

Talk: [${TALK_URL}](${TALK_URL})

Repo: [${REPO_URL}](${REPO_URL})
