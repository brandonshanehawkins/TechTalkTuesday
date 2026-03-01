# TTTree User Guide

Welcome to the **TTTree Node Editor**! This guide will help you understand the custom nodes built specifically for your Tech Talk Tuesday presentations, how to use them, and the special Dual-Tab Presentation workflow.

## General Navigation
Since TTTree runs on the **LiteGraph.js** engine (identical to ComfyUI), navigation is simple:
- **Add Nodes:** Right-click anywhere on the dark canvas grid. Navigate to the `tttree` category in the menu, or just use the search box at the top of the menu!
- **Connect Pins:** Click and drag from an output pin (circle on the right side of a node) to an input pin (circle on the left side of another node).
- **Pan & Zoom:** Middle-click (or hold Space) and drag to pan around. Scroll wheel to zoom in and out.
- **Top Controls:**
  - `Save Graph` / `Load Graph`: Download your current setup as a `.json` file to your computer, and load it back later.
  - `Clear Canvas`: Wipe everything.
  - `Auto-Arrange`: Magically untangle spaghetti wires using an auto-layout algorithm.
  - `Start Presentation`: Opens the dedicated presentation broadcasting tab.

---

## 🛠️ The GizmoGraph Custom Nodes
These nodes can be found in the right-click menu under `gizmo/`.

### Inputs (`gizmo/inputs/`)
Inputs are teal-colored nodes. They are the sources of your data.
*   **Text Input**: A simple box to type strings of text.
*   **Note**: A large, multi-line text box you can use anywhere on the canvas as a sticky-note scratchpad for your own personal documentation.
*   **Theme Colors**: A master node containing all 5 Tech Talk Tuesday brand hex colors. It outputs the strings individually so you can wire them into text styling or other nodes.
*   **Boolean (Checkbox)**: A simple true/false toggle.
*   **Number Input**: Defines a numerical value. Expand the widget to see the slider.
*   **Image Input**: Click the button to launch a file browser. Select a picture from your hard drive, and you'll see a small preview inside the node. It outputs an image data package that can be saved or broadcast.

### Operators (`tttree/operators/`)
Operators are orange-colored. They take data in, change it, and push it out.
*   **Math Operation**: Takes two numbers (`A` and `B`), and performs Addition, Subtraction, Multiplication, or Division. You can also toggle rounding.
*   **Combine Text**: Takes `str1` and `str2`, and merges them with a configurable separator (default is a space).
*   **Combine Elements (Scene Builder)**: Takes multiple fully-formed elements (like an Image and Text) and groups them together into a "Scene" using absolute positioning.
*   **HTML Container (Flex)**: Takes multiple elements and wraps them in a WebFlow CSS Flexbox container. You can control justification (Left/Center/Right), layout direction (Row/Col), Padding, and Gap. Think of this as the intelligent version of the Scene Builder!
*   **Render to Image**: Takes a 'Scene', 'Container', or 'Styled Object' and explicitly rasterizes the HTML DOM into an Image pixel payload so you can save it out. Wait for the preview image to populate on the node!
*   **Style Transform (PSR)**: *The Composer Concept!* 
    *   Takes any item (an image, text, etc.), and values for Position X, Position Y, Scale, and Opacity.
    *   It wraps the inputs into a special "Styled Object" that the HTML Output node understands.

### Outputs (`tttree/outputs/`)
Outputs are rust-colored. They represent the final action of the flow.
*   **Save File (Data)**: Takes text, JSON, or numbers, and triggers a file download to your computer.
*   **Save Image**: Takes image data and immediately downloads the modified image payload to your computer.
*   **HTML Output (Present)**: *The most important node!* This accepts basically anything (Text, Images, or Styled Objects from the Style Transform node) and instantly beams it to the Presentation tab.

---

## 🎭 The Presentation Workflow
This is how you get that "WOW factor" during your Teams meetings. The goal is to show the clean results on the Teams screen share, while you operate the complex node graph on your own private monitor.

1.  **Start the Server**: Open your terminal in the `TTTree` folder and run `npm run dev`. Go to `http://localhost:5173`.
2.  **Open the Presentation Window**: Click the **Start Presentation** button in the top right. A new window will pop up saying *"Waiting for TTTree graph signals..."*
3.  **Position Your Windows**: Keep the main Node Editor on your laptop screen, and drag the Presentation Window to your second monitor to screen-share on Teams.
4.  **Wire It Up**: 
    1.  Add an `Image Input` node and select an uploaded picture.
    2.  Add the `HTML Output (Present)` node.
    3.  Connect the Image Output to the HTML Input.
    4.  *Magic!* The image instantly appears beautifully centered on the Presentation screen!
5.  **Tinker Live**: Every time you change a slider, edit text, or add a Style Transformer, the Presentation Window updates in real-time instantly without refreshing.

---

## ⚙️ Under the Hood (For the Tinkerer)
You might notice that if you right-click the canvas and explore outside the `tttree/` folder, there are *hundreds* of other nodes (Math, Logic, Graphics, etc.). 

**Where did these come from?**
These are the default nodes built directly into the open-source **LiteGraph.js** engine. LiteGraph was originally designed to build 3D shaders and complex graphics applications (which is why ComfyUI uses it so well!).

**Can I use them?**
You can certainly drop them on the canvas, but they will likely *not* work with our custom Presentation Mode. Why? Because the default LiteGraph nodes output raw numbers, WebGL data, or standard JS arrays, while our `HTML Output (Present)` node specifically expects text, images, or our custom "Styled Objects" / "Scenes" to broadcast over the `BroadcastChannel`. 

**Wait, what about nodes like "Crop"? ComfyUI has that!**
ComfyUI's nodes are actually calling Python scripts on a backend server to do the heavy lifting of cropping an image array. TTTree is currently a 100% Frontend Vanilla JS application running entirely in your browser.

If we want a "Crop Image" node in the future, we don't need Python or an AI model! We would simply write a new JavaScript node in `TTTree` that takes the Image Input, uses a hidden HTML5 `<canvas>` element to draw and crop the pixels using standard browser APIs, and outputs the new image payload. 

Essentially, any tool you need for the studio (image adjustments, video triggers, text parsing) can absolutely be built directly into TTTree using pure JavaScript, without ever needing an API key or an external server. The system is extremely extensible by design!
