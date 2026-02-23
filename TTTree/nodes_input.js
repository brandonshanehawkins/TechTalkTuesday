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
LiteGraph.registerNodeType("tttree/inputs/text", TextInputNode);


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
LiteGraph.registerNodeType("tttree/inputs/boolean", BooleanInputNode);


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
LiteGraph.registerNodeType("tttree/inputs/number", NumberInputNode);

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
LiteGraph.registerNodeType("tttree/inputs/image", ImageInputNode);
