import { LiteGraph } from 'litegraph.js'

// --- Outputs ---

// 1. Save Image Output Node
// We take image input and trigger a download
class SaveImageNode {
    constructor() {
        this.addInput("image", "image");
        this.properties = { filename: "tttree-output.png" };
        this.addWidget("text", "Filename", "tttree-output.png", (v) => {
            this.properties.filename = v;
        });

        this.addWidget("button", "Save Now", null, () => {
            this.saveImage();
        });

        this.color = "#BD5E3E"; // Accent color for Outputs
        this.bgcolor = "#99472e";
    }

    saveImage() {
        const img = this.getInputData(0);
        if (!img || !img.src) {
            alert("No valid image data connected to Save node.");
            return;
        }

        const a = document.createElement("a");
        a.href = img.src;
        a.download = this.properties.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
SaveImageNode.title = "Save Image";
SaveImageNode.desc = "Trigger Image download";
LiteGraph.registerNodeType("tttree/outputs/save_image", SaveImageNode);


// 2. Save Text/Data Node (CSV/TXT)
class SaveFileNode {
    constructor() {
        // Can take almost anything that transforms to string
        this.addInput("data", 0);

        this.properties = { filename: "tttree-data.txt" };
        this.addWidget("text", "Filename", "tttree-data.txt", (v) => {
            this.properties.filename = v;
        });

        this.addWidget("button", "Save File", null, () => {
            this.saveData();
        });

        this.color = "#BD5E3E";
        this.bgcolor = "#99472e";
    }

    saveData() {
        let payload = this.getInputData(0);
        if (payload == null) return;

        // Ensure stringification
        if (typeof payload === 'object') {
            try {
                // If it's a styled object wrap from our composer, pull content just in case,
                // or serialize entire JSON based on extension.
                if (this.properties.filename.endsWith('.json')) {
                    payload = JSON.stringify(payload, null, 2);
                } else {
                    // try basic conversion
                    payload = String(payload);
                    if (payload === "[object Object]") payload = JSON.stringify(payload);
                }
            } catch (e) { /* fallback to default toString */ payload = String(payload); }
        } else {
            payload = String(payload);
        }

        const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = this.properties.filename;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
SaveFileNode.title = "Save File (Data)";
SaveFileNode.desc = "Download string/data to local file";
LiteGraph.registerNodeType("tttree/outputs/save_file", SaveFileNode);


// --- The Core Strategy: HTML Presentation Node ---
// This node collects whatever data, image, or styled object is fed to it,
// And broadcasts it over the BroadcastChannel API so `presentation.html` can render it live.

const tttBroadcastChannel = new BroadcastChannel("tttree_presentation_channel");

class HTMLPresentationNode {
    constructor() {
        // A single input that can accept text, HTML elements, images, or styled objects.
        this.addInput("scene_data", 0);
        this.color = "#BD5E3E";
        this.bgcolor = "#99472e";

        // Automatically sync the data when executed
        this.serialize_widgets = true;
    }

    onExecute() {
        let payload = this.getInputData(0);
        if (payload === undefined || payload === null) {
            // Send clear signal
            tttBroadcastChannel.postMessage({ type: 'clear' });
            return;
        }

        // We use a recursive function to break down complex scenes holding arrays
        const processPayload = (p) => {
            let style = {};
            let content = null;

            if (p && typeof p === 'object' && p.__is_scene) {
                // It's a group of elements from CombineElementsNode!
                return { type: 'scene', elements: p.elements.map(processPayload) };
            }

            // Is it our internal styled object from the Style Transform node?
            if (p && typeof p === 'object' && p.content !== undefined && p.style !== undefined) {
                style = p.style;
                p = p.content; // extract the raw content for further processing
            }

            if (p && typeof p === 'object' && p.__is_html) {
                // Return explicitly parsed HTML string from MarkdownNode
                return { content: { type: 'html', val: p.val }, style: {} };
            }

            // Process the base content type
            if (p instanceof HTMLImageElement) {
                // It's the Image from ImageInputNode!
                content = { type: 'image', src: p.src };
            } else if (typeof p === 'string' || typeof p === 'number' || typeof p === 'boolean') {
                // Basic primitives
                content = { type: 'text', val: String(p) };
            } else {
                // Fallback for everything else
                content = { type: 'json', val: JSON.stringify(p) };
            }

            return { content, style };
        };

        const message = { type: 'render', data: processPayload(payload) };
        tttBroadcastChannel.postMessage(message);
    }

    // Add a button incase automatic execution isn't desired by user
    onAction() {
        this.onExecute();
    }
}

HTMLPresentationNode.title = "HTML Output (Present)";
HTMLPresentationNode.desc = "Broadcasts to the Presentation window";
LiteGraph.registerNodeType("tttree/outputs/html_presentation", HTMLPresentationNode);
