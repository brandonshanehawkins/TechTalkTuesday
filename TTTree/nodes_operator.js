import { LiteGraph } from 'litegraph.js'
import { marked } from 'marked'

// --- Operators ---

// 1. Math Node (Add, Sub, Div, Mul)
class MathOperationNode {
    constructor() {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("result", "number");

        // Let user choose the operation
        this.properties = { op: "+", round: false };
        this.addWidget("combo", "Operation", "+", (v) => {
            this.properties.op = v;
        }, { values: ["+", "-", "*", "/"] });

        this.addWidget("toggle", "Round Result", false, (v) => {
            this.properties.round = v;
        });

        this.color = "#FFA500"; // Secondary brand color for Operators
        this.bgcolor = "#cc8400";
        this.title_text_color = "#1a1a1a";
        this.serialize_widgets = true;
    }

    onExecute() {
        const A = this.getInputData(0);
        const B = this.getInputData(1);

        if (A == null || B == null) return;

        let result = 0;
        switch (this.properties.op) {
            case "+": result = A + B; break;
            case "-": result = A - B; break;
            case "*": result = A * B; break;
            case "/":
                if (B !== 0) result = A / B;
                else result = 0; // basic divide by zero protection
                break;
        }

        if (this.properties.round) {
            result = Math.round(result);
        }

        this.setOutputData(0, result);
    }
}
MathOperationNode.title = "Math Operation";
MathOperationNode.desc = "Basic A and B math";
LiteGraph.registerNodeType("tttree/operators/math", MathOperationNode);

// 2. Combine Text Node
class CombineTextNode {
    constructor() {
        this.addInput("str1", "string");
        this.addInput("str2", "string");
        this.addOutput("combined", "string");

        this.properties = { separator: " " };
        this.addWidget("text", "Separator", " ", (v) => {
            this.properties.separator = v;
        });

        this.color = "#FFA500";
        this.bgcolor = "#cc8400";
        this.title_text_color = "#1a1a1a";
        this.serialize_widgets = true;
    }

    onExecute() {
        let s1 = this.getInputData(0);
        let s2 = this.getInputData(1);

        if (s1 == null && s2 == null) return;
        if (s1 == null) s1 = "";
        if (s2 == null) s2 = "";

        const result = String(s1) + this.properties.separator + String(s2);
        this.setOutputData(0, result);
    }
}
CombineTextNode.title = "Combine Text";
CombineTextNode.desc = "Concatenate two strings";
LiteGraph.registerNodeType("tttree/operators/combine_text", CombineTextNode);

// 3. Compositing/Style Transform Node (The Core CSS manipulation)
// This conceptual node takes a base element and applies PSR to it
class StyleTransformNode {
    constructor() {
        this.addInput("element", 0); // accepts any object/element
        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addInput("scale", "number");
        this.addInput("opacity", "number");

        this.addOutput("styled_object", 0); // outputs a config object representing styled state

        this.properties = {
            default_x: 0,
            default_y: 0,
            default_scale: 1,
            default_opacity: 1
        };

        this.color = "#FFA500";
        this.bgcolor = "#cc8400";
        this.title_text_color = "#1a1a1a";
    }

    onExecute() {
        const item = this.getInputData(0);
        if (!item) return;

        const x = this.getInputData(1) !== undefined ? this.getInputData(1) : this.properties.default_x;
        const y = this.getInputData(2) !== undefined ? this.getInputData(2) : this.properties.default_y;
        const scale = this.getInputData(3) !== undefined ? this.getInputData(3) : this.properties.default_scale;

        // Using `!= null` to properly catch 0 but fallback if strictly undefined
        let opacity = this.getInputData(4);
        if (opacity === undefined || opacity === null) opacity = this.properties.default_opacity;

        // Ensure opacity is bound 0 to 1 if user fed percentage
        if (opacity > 1) opacity = opacity / 100;

        // Instead of directly mutating DOM (which breaks purity of the graph), 
        // we wrap the item in our own internal styled datastructure.
        // The HTML presentation node will know how to unpack this.
        const representation = {
            content: item, // could be text string, image HTML node, etc.
            style: {
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                opacity: opacity
            }
        }

        this.setOutputData(0, representation);
    }
}
StyleTransformNode.title = "Style Transform (PSR)";
StyleTransformNode.desc = "Applies Position, Scale, Opacity (CSS)";
LiteGraph.registerNodeType("tttree/operators/style_transform", StyleTransformNode);

// 4. Combine Elements Node (Scene Builder)
class CombineElementsNode {
    constructor() {
        this.addInput("element 1", 0);
        this.addInput("element 2", 0);
        this.addOutput("scene", 0);

        this.properties = {};

        // Dynamically add or remove inputs
        this.addWidget("button", "Add Input", null, () => {
            this.addInput("element " + (this.inputs.length + 1), 0);
        });

        this.addWidget("button", "Remove Input", null, () => {
            if (this.inputs.length > 2) {
                this.removeInput(this.inputs.length - 1);
            }
        });

        this.color = "#FFA500";
        this.bgcolor = "#cc8400";
        this.title_text_color = "#1a1a1a";
    }

    onExecute() {
        let scene = [];
        for (let i = 0; i < this.inputs.length; i++) {
            let data = this.getInputData(i);
            if (data != null) {
                scene.push(data);
            }
        }
        // Output an object marked as a scene containing the array of elements
        this.setOutputData(0, { __is_scene: true, elements: scene });
    }
}
CombineElementsNode.title = "Combine Elements";
CombineElementsNode.desc = "Stacks multiple elements together";
LiteGraph.registerNodeType("tttree/operators/combine_elements", CombineElementsNode);

// 5. Markdown Node
class MarkdownNode {
    constructor() {
        this.addInput("markdown", "string");
        this.addOutput("html", 0);

        this.properties = { text: "# Markdown Title\nType your markdown here..." };
        this.addWidget("text", "MD", this.properties.text, (v) => {
            this.properties.text = v;
        }, { multiline: true });

        this.color = "#FFA500";
        this.bgcolor = "#cc8400";
        this.title_text_color = "#1a1a1a";
        this.serialize_widgets = true;
        this.size = [250, 60];
    }

    onExecute() {
        let md = this.getInputData(0);
        if (md == null) md = this.properties.text;

        // Parse markdown to HTML string
        const parsedHTML = marked.parse(String(md));

        this.setOutputData(0, { __is_html: true, val: parsedHTML });
    }
}
MarkdownNode.title = "Markdown";
MarkdownNode.desc = "Converts markdown text to HTML";
LiteGraph.registerNodeType("tttree/operators/markdown", MarkdownNode);


