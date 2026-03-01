import './style.css'
import { LGraph, LGraphCanvas, LiteGraph } from 'litegraph.js'
import './nodes_input.js'
import './nodes_operator.js'
import './nodes_output.js'

// --- 1. Global Setup and Theming --- //
// Let's modify LiteGraph globals to match brand colors
LiteGraph.clear_background_color = "#1a1a1a";
LiteGraph.node_title_color = "#333333";
LiteGraph.node_bgcolor = "#2a2a2a";
LiteGraph.node_bgcolor_highlight = "#008080"; // primary teal
LiteGraph.node_border_color = "#555555";
LiteGraph.node_text_color = "#F5F5F5";

// Create Graph and Canvas
const graph = new LGraph();
const canvasElement = document.getElementById("gizmograph-canvas");

// LGraphCanvas binds the graph to the actual DOM canvas element
const graphCanvas = new LGraphCanvas(canvasElement, graph, {
    autoresize: true // allows canvas to automatically resize to the container
});

// Configure the canvas grid to match our darker aesthetic
graphCanvas.bg_color = "#1a1a1a";
graphCanvas.grid_color = "#333333";
graphCanvas.clear_background = true;

// Starts the execution loop
graph.start();

// --- 2. Initial testing / Hello World node --- //
// Let's drop a basic node in to verify it is working on load
const node_const = LiteGraph.createNode("basic/const");
node_const.pos = [200, 200];
graph.add(node_const);
node_const.setValue(4.5);

const node_watch = LiteGraph.createNode("basic/watch");
node_watch.pos = [500, 200];
graph.add(node_watch);

node_const.connect(0, node_watch, 0);


// --- 3. UI Interactions --- //
document.getElementById('btn-save').addEventListener('click', () => {
    // Save to JSON strategy
    // In LGraph, serialize() exports the internal JSON layout and state
    const data = JSON.stringify(graph.serialize());

    // We create a temporary anchor element to trigger a file download natively
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;

    // Grab the custom name from the header input
    let filename = document.getElementById('graph-name').value.trim();
    if (!filename) filename = "gizmograph-workflow";
    if (!filename.endsWith('.json')) filename += ".json";

    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById('btn-load').addEventListener('click', () => {
    // Triggers hidden file input
    document.getElementById('file-input-load').click();
});

document.getElementById('file-input-load').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            // Replace current graph
            graph.configure(data, false);
        } catch (err) {
            console.error("Failed to parse JSON", err);
            alert("Invalid GizmoGraph JSON workflow.");
        }
    };
    reader.readAsText(file);

    // reset input so the same file could trigger change again
    e.target.value = null;
});

document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear the entire workspace?")) {
        graph.clear();
    }
});

document.getElementById('btn-arrange').addEventListener('click', () => {
    graph.arrange(); // Built in LiteGraph auto-layout
});

document.getElementById('btn-present').addEventListener('click', () => {
    // We will build this presentation connection later, for now just open the tab.
    window.open('/presentation.html', '_blank', 'GizmoGraph Presentation', 'width=1280,height=720');
});

// Toggle Split View Presentation Panel
document.getElementById('btn-toggle-panel').addEventListener('click', () => {
    const workspace = document.querySelector('.workspace');
    const panel = document.getElementById('side-panel');

    // Toggle classes
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        workspace.classList.add('split-view');
        // Force a graph resize slightly after the CSS transition finishes
        setTimeout(() => graphCanvas.resize(), 300);
    } else {
        panel.classList.add('hidden');
        workspace.classList.remove('split-view');
        setTimeout(() => graphCanvas.resize(), 300);
    }
});

// Update the canvas size explicitly on load
window.addEventListener('resize', () => {
    graphCanvas.resize();
});
