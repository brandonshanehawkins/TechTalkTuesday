# Antigravity Cross-Project Context & Workflow

This file was created on the Mac Mini before migrating to the Mac Studio. It serves as a reminder and context-anchor for Antigravity when picking back up on cross-repository workflows.

## The Goal
To build a connected ecosystem of applications (GizmoGraph, Song-Builder, Song-Section-Pro, etc.) while allowing the Antigravity agent to understand the context and share code/logic between them seamlessly.

## Recommended Workflow Strategies

When working on a new machine or a new project, you can provide context to the agent using these three methods:

### 1. Cross-Workspace Knowledge Items (KIs)
Antigravity distills important architectural decisions into "Knowledge Items" automatically.
- **How to use:** When opening a new project (like `song-builder`), you can simply ask the agent to *"Reference the GizmoGraph KIs to see how we set up LiteGraph.js"* and it will parse the relevant context from the other project's history.

### 2. Absolute Path Referencing (The Direct Approach)
If you know exactly what file contains the logic you want to share.
- **How to use:** Paste the absolute path in the chat.
  - *Example:* "I want to rebuild the BroadcastChannel logic here. Read `/Users/shane/Documents/GitHub/TechTalkTuesday/TTTree/nodes_output.js` to see how we did it in GizmoGraph."

### 3. The "Big Bucket" Workspace (Monorepo Approach)
This is the most seamless approach for projects that heavily intermingle.
- **How to use:** Create a parent folder (e.g., `/Users/shane/Documents/GitHub/My-Ecosystem/`) and move the related project folders inside it. By opening Antigravity at this root parent folder, the agent gains native file-system access to *all* the sub-projects simultaneously, allowing it to easily read from GizmoGraph and write to Song-Builder in the exact same chat session.

## Next Steps on the Mac Studio
1. Pull this repo down.
2. Decide if you want to keep the repositories separate (using Methods 1 & 2) or combine them into a consolidated parent folder (Method 3).
3. Point Antigravity to this file (`CONTEXT_MIGRATION.md`) to quickly get the agent up to speed!
