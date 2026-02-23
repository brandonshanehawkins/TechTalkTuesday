# TTTree Backlog & Idea Tracker

Welcome to the backlog! Whenever you have a "shower thought" or a cool idea while tinkering with TTTree, just drop it in here. 

When you're ready to have me (Antigravity) build some of these out, just say: 
*"Hey, let's tackle the top 3 items in the backlog today!"*

## 🟢 New Ideas / Feature Requests
*(Add your ideas here as bullet points or checkboxes)*
- [2] Create a new custom node that has the TTT brand colors coded in, or even better, TTT brand colors by defualt, but the fields are editable for use with other color themes. Each color should have an output wire. A graph could be built using this one node to pull all color values from, therby enabling a very quick theme change to the whole flow.
- [2] Create a Note Node that can display a larger, wrapped text field; for explanations or scratchpad thoughts, etc.
- [2] I like 'Combine Elements' node you added, not sure if I want it revised or to create a new node. I want an 'element' node intended for the the 'Combine Elements'. Basically the same functionality...
- [2] I'm not sure if the save image node is working like I had hoped. It does work, I can pipe an image input into it and it will save that image to downloads, as expected. But adding the Style Transform to adjust, then sending the transform output to the save image input returns an error. I'm guessing becuase Transform outputs an 'object' of some sort whereas save image want pixels. Is there a node that needs to go between to make 'pixels' for the save image node?

## 🟡 In Progress
*(I will move items here when we start actively working on them)*

## 🔵 Completed
*(A history of the awesome stuff we've built from this list)*
- [x] Create a Markdown Node that accepts markdown text and renders it as HTML for presentation.
- [x] The nodes based on #FFA500 should have dark text, if possible, for legibility
- [x] Create a Graph Name field or button; Save Graph should use this as filename for graph state saves.
- [x] Document under-the-hood LiteGraph details vs Custom TTTree nodes (Answered question about Crop/Python backend).
- [x] Initial TTTree Vite architecture.
- [x] Custom LiteGraph `tttree` node categories.
- [x] Dual-window `BroadcastChannel` presentation mode.
- [x] Multi-element Scene Builder operator.
