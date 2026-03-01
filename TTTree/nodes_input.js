import { LiteGraph } from 'litegraph.js'

// --- Inputs ---

// 1. Text Input Node
class TextInputNode {
    constructor() {
        this.addOutput("string", "string");
        // Add a widget for the text input
        this.widget = this.addWidget("text", "Text", "Hello TTTree", (v) => {
            this.properties.text = v;
        });

        this.properties = { text: "Hello TTTree" };
        this.color = "#008080"; // Primary brand color for inputs
        this.bgcolor = "#006b6b";

        // This is a dynamic node, so we want it to update
        this.serialize_widgets = true; // saves widget value to json automatically
    }

    onExecute() {
        // Output the current property string down the workflow
        this.setOutputData(0, this.properties.text);
    }
}
TextInputNode.title = "Text Input";
TextInputNode.desc = "Basic string input node";
LiteGraph.registerNodeType("gizmo/inputs/text", TextInputNode);


// 2. Boolean/Checkbox Node
class BooleanInputNode {
    constructor() {
        this.addOutput("boolean", "boolean");
        this.widget = this.addWidget("toggle", "Value", false, (v) => {
            this.properties.value = v;
        });
        this.properties = { value: false };
        this.color = "#008080";
        this.bgcolor = "#006b6b";
        this.serialize_widgets = true;
    }

    onExecute() {
        this.setOutputData(0, this.properties.value);
    }
}
BooleanInputNode.title = "Boolean (Checkbox)";
BooleanInputNode.desc = "Toggle true or false";
LiteGraph.registerNodeType("gizmo/inputs/boolean", BooleanInputNode);


// 3. Number/Slider Node (Combo of Percentage, Integer, Float)
class NumberInputNode {
    constructor() {
        this.addOutput("number", "number");

        this.properties = { value: 0 };
        this.widget = this.addWidget("number", "Value", this.properties.value, (v) => {
            this.properties.value = v;
        }, { min: -1000, max: 1000, step: 0.1, precision: 3 });

        this.color = "#008080";
        this.bgcolor = "#006b6b";
        this.serialize_widgets = true;
        this.size = [200, 60];
    }

    onExecute() {
        this.setOutputData(0, this.properties.value);
    }
}
NumberInputNode.title = "Number Input";
NumberInputNode.desc = "Standard numerical input";
LiteGraph.registerNodeType("gizmo/inputs/number", NumberInputNode);

// 4. Image Input Node
// A more complex node. It needs to accept a file locally and output an image element/blob.
class ImageInputNode {
    constructor() {
        this.addOutput("image", "image");
        this.properties = { url: "" };

        // A button widget to trigger the native file explorer
        this.addWidget("button", "Load Image...", null, () => {
            this.loadImageFile();
        });

        this.img = null;
        this.size = [200, 150];

        this.color = "#008080";
        this.bgcolor = "#006b6b";
    }

    loadImageFile() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                this.properties.url = dataUrl;
                this.loadImageFromUrl(dataUrl);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    loadImageFromUrl(url) {
        if (!url) return;
        this.img = new Image();
        this.img.src = url;
        this.img.onload = () => {
            this.setDirtyCanvas(true, true); // redraw
        }
    }

    // Lifecycle: when restoring from JSON
    onConfigure(info) {
        if (info.properties && info.properties.url) {
            this.loadImageFromUrl(info.properties.url);
        }
    }

    // Draw the image inside the node if it's there
    onDrawBackground(ctx) {
        if (this.flags.collapsed) return;
        if (this.img && this.img.width > 0) {
            // Draw image scaled to fit node retaining aspect ratio
            const aspect = this.img.width / this.img.height;
            const w = this.size[0] - 20;
            const h = w / aspect;

            // Adjust node size to fit the visual if needed, but not constantly
            if (this.size[1] < h + 50) this.size[1] = h + 50;

            ctx.drawImage(this.img, 10, 40, w, h);
        } else {
            // Placeholder text
            ctx.fillStyle = "#555";
            ctx.font = "12px DM Sans, sans-serif";
            ctx.fillText("No Image Loaded", 10, 60);
        }
    }

    onExecute() {
        if (this.img) {
            // We pass the actual Image HTML element to downstream nodes
            this.setOutputData(0, this.img);
        } else {
            this.setOutputData(0, null);
        }
    }
}

ImageInputNode.title = "Image Input";
ImageInputNode.desc = "Load a local image file";
LiteGraph.registerNodeType("gizmo/inputs/image", ImageInputNode);

// 4b. Video Input Node
// Accepts an mp4/webm file natively. Outputs an HTMLVideoElement.
class VideoInputNode {
    constructor() {
        this.addOutput("video", "video"); // Semantic type
        this.properties = { url: "" };

        this.addWidget("button", "Load Video...", null, () => {
            this.loadVideoFile();
        });

        this.vid = null;
        this.size = [200, 150];

        this.color = "#008080";
        this.bgcolor = "#006b6b";

        // Ensure the node redraws frequently so we see the video frame updates
        this.last_draw_time = 0;
    }

    loadVideoFile() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "video/*";
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                this.properties.url = dataUrl;
                this.loadVideoFromUrl(dataUrl);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    loadVideoFromUrl(url) {
        if (!url) return;
        if (this.vid) {
            this.vid.pause();
            this.vid.removeAttribute('src');
            this.vid.load();
        }

        this.vid = document.createElement("video");
        this.vid.src = url;
        this.vid.autoplay = true;
        this.vid.loop = true;
        this.vid.muted = true; // Needs to be muted to auto-play in most browsers
        this.vid.playsInline = true;

        this.vid.onloadeddata = () => {
            this.setDirtyCanvas(true, true);
        }
    }

    onConfigure(info) {
        if (info.properties && info.properties.url) {
            this.loadVideoFromUrl(info.properties.url);
        }
    }

    onDrawBackground(ctx) {
        if (this.flags.collapsed) return;

        if (this.vid && this.vid.videoWidth > 0) {
            const aspect = this.vid.videoWidth / this.vid.videoHeight;
            const w = this.size[0] - 20;
            const h = w / aspect;

            if (this.size[1] < h + 50) this.size[1] = h + 50;

            // Draw the current video frame onto the canvas
            ctx.drawImage(this.vid, 10, 40, w, h);

            // Because video is moving, we constantly mark the canvas as dirty if playing
            if (!this.vid.paused) {
                const now = performance.now();
                if (now - this.last_draw_time > 33) { // ~30fps 
                    this.setDirtyCanvas(true, true);
                    this.last_draw_time = now;
                }
            }
        } else {
            ctx.fillStyle = "#555";
            ctx.font = "12px DM Sans, sans-serif";
            ctx.fillText("No Video Loaded", 10, 60);
        }
    }

    onExecute() {
        if (this.vid) {
            // Because downstream Render nodes evaluate standard formats, we wrap it with our type specifier
            this.setOutputData(0, { type: 'video', src: this.vid.src, element: this.vid });
        } else {
            this.setOutputData(0, null);
        }
    }
}
VideoInputNode.title = "Video Input";
VideoInputNode.desc = "Load a local video file";
LiteGraph.registerNodeType("gizmo/inputs/video", VideoInputNode);

// 4c. Data/Text File Input Node
// Accepts .txt, .csv, .json and parses to string.
class DataInputNode {
    constructor() {
        this.addOutput("data (str)", "string");
        this.properties = { text: "", filename: "" };

        this.addWidget("button", "Load TXT/CSV...", null, () => {
            this.loadDataFile();
        });

        this.size = [200, 100];
        this.color = "#008080";
        this.bgcolor = "#006b6b";
        this.serialize_widgets = true;
    }

    loadDataFile() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".txt,.csv,.json,.md";
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            this.properties.filename = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                this.properties.text = event.target.result;
                this.setDirtyCanvas(true, true);
            };
            reader.readAsText(file);
        };
        input.click();
    }

    onDrawBackground(ctx) {
        if (this.flags.collapsed) return;

        ctx.fillStyle = "#F5F5F5";
        ctx.font = "12px DM Sans, sans-serif";

        if (this.properties.filename) {
            ctx.fillText("File: " + this.properties.filename, 10, 50);

            // Show snippet of data
            ctx.fillStyle = "#aaa";
            let preview = this.properties.text.substring(0, 40);
            if (this.properties.text.length > 40) preview += "...";
            // strip newlines for preview
            preview = preview.replace(/(\r\n|\n|\r)/gm, " ");
            ctx.fillText(preview, 10, 70);
        } else {
            ctx.fillStyle = "#555";
            ctx.fillText("No File Loaded", 10, 50);
        }
    }

    onExecute() {
        this.setOutputData(0, this.properties.text);
    }
}
DataInputNode.title = "Load Text/Data";
DataInputNode.desc = "Load .txt, .csv, or .json file";
LiteGraph.registerNodeType("gizmo/inputs/data", DataInputNode);

// 5. Note Node (Large scratchpad)
class NoteNode {
    constructor() {
        this.properties = { text: "Type your notes here..." };

        this.addWidget("button", "Edit Note", null, () => {
            const newText = prompt("Edit Note text:", this.properties.text);
            if (newText !== null) {
                this.properties.text = newText;
                this.setDirtyCanvas(true, true);
            }
        });

        this.color = "#333333";
        this.bgcolor = "#222222";
        this.serialize_widgets = true;
        this.size = [250, 150];
    }

    onDrawBackground(ctx) {
        if (this.flags.collapsed) return;

        // Render wrapping text
        ctx.fillStyle = "#F5F5F5";
        ctx.font = "14px 'DM Sans', sans-serif";
        ctx.textAlign = "left";

        const lines = String(this.properties.text || "").split('\n');
        // Start below the Edit button widget
        let y = 60;
        const lineHeight = 18;
        const maxWidth = this.size[0] - 20;

        for (let i = 0; i < lines.length; i++) {
            let words = lines[i].split(' ');
            let currentLine = '';
            for (let j = 0; j < words.length; j++) {
                let testLine = currentLine + words[j] + ' ';
                let metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && j > 0) {
                    ctx.fillText(currentLine, 10, y);
                    currentLine = words[j] + ' ';
                    y += lineHeight;
                } else {
                    currentLine = testLine;
                }
            }
            ctx.fillText(currentLine, 10, y);
            y += lineHeight;
        }

        // Auto expand node height if text is long
        const neededHeight = y + 20;
        if (this.size[1] < neededHeight) {
            this.size[1] = neededHeight;
        }
    }
}
NoteNode.title = "Note";
NoteNode.desc = "A simple text scratchpad";
LiteGraph.registerNodeType("gizmo/inputs/note", NoteNode);

// 6. Theme Color Node
class ThemeColorNode {
    constructor() {
        this.addOutput("Primary", "string");
        this.addOutput("Secondary", "string");
        this.addOutput("Accent", "string");
        this.addOutput("Dark BG", "string");
        this.addOutput("Light Text", "string");

        this.properties = {
            primary: "#008080",
            secondary: "#FFA500",
            accent: "#BD5E3E",
            dark: "#333333",
            light: "#F5F5F5"
        };

        this.addWidget("text", "Primary", this.properties.primary, (v) => { this.properties.primary = v; });
        this.addWidget("text", "Secondary", this.properties.secondary, (v) => { this.properties.secondary = v; });
        this.addWidget("text", "Accent", this.properties.accent, (v) => { this.properties.accent = v; });
        this.addWidget("text", "Dark BG", this.properties.dark, (v) => { this.properties.dark = v; });
        this.addWidget("text", "Light Text", this.properties.light, (v) => { this.properties.light = v; });

        this.color = "#008080";
        this.bgcolor = "#006b6b";
        this.serialize_widgets = true;
        this.size = [250, 260];
    }

    onExecute() {
        this.setOutputData(0, this.properties.primary);
        this.setOutputData(1, this.properties.secondary);
        this.setOutputData(2, this.properties.accent);
        this.setOutputData(3, this.properties.dark);
        this.setOutputData(4, this.properties.light);
    }
}
ThemeColorNode.title = "Theme Colors";
ThemeColorNode.desc = "Outputs brand hex colors";
LiteGraph.registerNodeType("gizmo/inputs/theme_colors", ThemeColorNode);
