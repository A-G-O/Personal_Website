# Blender MCP Setup Instructions

This file contains instructions for completing the Blender MCP setup.

## ✅ Completed Steps

- ✅ `uv` package manager is installed
- ✅ Blender 3.0+ is installed
- ✅ `addon.py` file downloaded to project root

## 📋 Remaining Manual Steps

### 1. Add MCP Server to Cursor Global Settings

1. Open Cursor Settings (`Cmd + ,` or Cursor > Settings)
2. Navigate to **MCP** section
3. Click **"Add new global MCP server"** button
4. Paste the following configuration:

```json
{
    "mcpServers": {
        "blender": {
            "command": "uvx",
            "args": [
                "blender-mcp"
            ]
        }
    }
}
```

5. Save the configuration

### 2. Install Blender Addon

1. Open Blender
2. Go to **Edit > Preferences > Add-ons**
3. Click **"Install..."** button
4. Navigate to this project directory and select `addon.py`
5. Enable the addon by checking the box next to **"Interface: Blender MCP"**

### 3. Start the Connection

1. In Blender, open the 3D View sidebar (press `N` if not visible)
2. Find the **"BlenderMCP"** tab in the sidebar
3. (Optional) Turn on the **Poly Haven** checkbox if you want assets from their API
4. Click **"Connect to Claude"**
5. The MCP server will start automatically when you use Blender MCP tools in Cursor

## 🎯 Usage

Once configured, you can ask Cursor's AI to:
- Create and modify 3D objects in Blender
- Apply materials and colors
- Set up lighting and cameras
- Get scene information
- Download models from Poly Haven
- Generate 3D models using Hyper3D Rodin

## 📝 Notes

- Only run one instance of the MCP server (either in Cursor or Claude Desktop, not both)
- The first command may not go through initially, but subsequent commands should work
- Always save your Blender work before using `execute_blender_code` tool
- Default connection: `localhost:9876` (can be changed via environment variables)

## 🔧 Environment Variables (Optional)

If you need to connect to a remote Blender instance:

```bash
export BLENDER_HOST='host.docker.internal'
export BLENDER_PORT=9876
```



