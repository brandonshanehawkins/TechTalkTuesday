// ============================================================================
// TechTalkTuesday_AutoEdit.jsx
// Creates a 30s 1080p/30fps comp, imports music + 7 clips, places them on beats,
// adds comp markers, builds 3-frame cross-dissolves, and adds a retro text tag.
// Place this .jsx in the SAME FOLDER as the media files (or you'll be prompted).
// ============================================================================

(function TechTalkTuesday_AutoEdit() {
app.beginUndoGroup("Tech Talk Tuesday — Auto Edit");

// --- Project + Comp settings ---
var COMP_NAME = "TechTalkTuesday_Jingle_30s";
var W = 1920, H = 1080, PAR = 1.0, FPS = 30, DUR = 30.0;

// 3-frame cross dissolve (centered on cut)
var XFADE_FRAMES = 3;
var XFADE_DUR   = XFADE_FRAMES / FPS; // 0.1s at 30fps
var HALF_XFADE  = XFADE_DUR / 2.0;   // 0.05s

// --- Key musical moments (also used as cut points) ---
var markers = [
    { t:  0.00, name: "0:00 Cold open / intro"         },
    { t:  4.00, name: "0:04 Verse kicks in"            },
    { t:  8.00, name: "0:08 'Deadlines looming' energy up" },
    { t: 12.00, name: "0:12 'Don't you worry' shift"   },
    { t: 16.00, name: "0:16 CHORUS HITS (biggest)"     },
    { t: 22.00, name: "0:22 Second chorus line"        },
    { t: 26.00, name: "0:26 Announcer tag begins"      },
    { t: 29.00, name: "0:29 Final hold + cymbal crash" }
];

// --- Media (expected next to script) ---
var MUSIC_CANDIDATES = [
    "Tech_Talk_Tuesday_Jingle.wav",
    "Tech_Talk_Tuesday_Jingle.mp3"
];

var clipSpecs = [
    { file: "Scene1_ON_AIR_Sign.mp4",           start:  0.00, end:  4.00 },
    { file: "Scene2_Meet_The_Host.mp4",          start:  4.00, end:  8.00 },
    { file: "Scene3_Spreadsheet_Disaster.mp4",   start:  8.00, end: 12.00 },
    { file: "Scene4_Inbox_Apocalypse.mp4",       start: 12.00, end: 16.00 },
    { file: "Scene5_Copilot_Save.mp4",           start: 16.00, end: 22.00 },
    { file: "Scene6_Dance_Party.mp4",            start: 22.00, end: 26.00 },
    { file: "Scene7_Big_Cheesy_Finale.mp4",      start: 26.00, end: 30.00 }
];

// --- Helpers ---

function secondsClamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}

function findNearestMarkerTime(targetSeconds) {
    var bestT = markers[0].t;
    var bestD = Math.abs(targetSeconds - bestT);
    for (var i = 1; i < markers.length; i++) {
        var d = Math.abs(targetSeconds - markers[i].t);
        if (d < bestD) { bestD = d; bestT = markers[i].t; }
    }
    return bestT;
}

function getScriptFolderOrPrompt() {
    var folder = null;
    try {
        if ($.fileName) {
            var sf = new File($.fileName);
            if (sf.exists) folder = sf.parent;
        }
    } catch (e) {}
    if (!folder) {
        folder = Folder.selectDialog("Select folder containing Tech Talk Tuesday media");
    }
    return folder;
}

function ensureNewProject() {
    // Note: If a project is open and unsaved, AE may prompt you to save.
    try { app.newProject(); } catch (e) {}
    if (!app.project) app.newProject();
    return app.project;
}

function addProjectFolder(proj, name) {
    return proj.items.addFolder(name);
}

function importFileInto(proj, parentFolderItem, fileObj) {
    var io   = new ImportOptions(fileObj);
    var item = proj.importFile(io);
    if (parentFolderItem) item.parentFolder = parentFolderItem;
    return item;
}

function resolveExistingFile(baseFolder, filename) {
    var f = new File(baseFolder.fsName + "/" + filename);
    if (f.exists) return f;
    return null;
}

function setOpacityKeys(layer, keys) {
    // keys: [{t: Number, v: Number}, ...]
    var op = layer.property("ADBE Transform Group").property("ADBE Opacity");
    for (var i = 0; i < keys.length; i++) {
        op.setValueAtTime(keys[i].t, keys[i].v);
    }
}

// --- Build project ---

var proj       = ensureNewProject();
proj.bitsPerChannel = 16;

var assetsFolder = getScriptFolderOrPrompt();
if (!assetsFolder) {
    alert("No folder selected. Aborting.");
    app.endUndoGroup();
    return;
}

// Locate music (wav preferred, then mp3)
var musicFile = null;
for (var m = 0; m < MUSIC_CANDIDATES.length; m++) {
    musicFile = resolveExistingFile(assetsFolder, MUSIC_CANDIDATES[m]);
    if (musicFile) break;
}
if (!musicFile) {
    alert("Music file not found (Tech_Talk_Tuesday_Jingle.wav or .mp3) in:\n" + assetsFolder.fsName);
    app.endUndoGroup();
    return;
}

// Validate clips exist
for (var c = 0; c < clipSpecs.length; c++) {
    var cf = resolveExistingFile(assetsFolder, clipSpecs[c].file);
    if (!cf) {
        alert("Missing clip:\n" + clipSpecs[c].file + "\n\nExpected in:\n" + assetsFolder.fsName);
        app.endUndoGroup();
        return;
    }
}

// Import into bins
var binAudio = addProjectFolder(proj, "01_AUDIO");
var binVideo = addProjectFolder(proj, "02_VIDEO");

var musicItem = importFileInto(proj, binAudio, musicFile);

var footageItems = []; // parallel to clipSpecs
for (var i = 0; i < clipSpecs.length; i++) {
    var fObj = resolveExistingFile(assetsFolder, clipSpecs[i].file);
    footageItems[i] = importFileInto(proj, binVideo, fObj);
}

// Create comp
var comp = proj.items.addComp(COMP_NAME, W, H, PAR, DUR, FPS);

// Add comp markers
for (var k = 0; k < markers.length; k++) {
    var mv = new MarkerValue(markers[k].name);
    comp.markerProperty.setValueAtTime(markers[k].t, mv);
}

// Add music
var musicLayer    = comp.layers.add(musicItem);
musicLayer.name   = "MUSIC — Tech Talk Tuesday Jingle";
musicLayer.startTime = 0;
musicLayer.inPoint   = 0;
musicLayer.outPoint  = DUR;

// Build video layers with beat-aligned cuts + 3-frame cross dissolves
// Cuts are aligned to the nearest key musical marker time.
for (var j = 0; j < clipSpecs.length; j++) {
    var spec = clipSpecs[j];

    var cutIn  = (j === 0)                     ? 0.0 : findNearestMarkerTime(spec.start);
    var cutOut = (j === clipSpecs.length - 1)  ? DUR : findNearestMarkerTime(spec.end);

    // Center dissolve on the cut point:
    //   incoming visible from (cutIn  - half) to (cutIn  + half)
    //   outgoing fades  over  (cutOut - half) to (cutOut + half)
    var layerIn  = (j === 0)                    ? cutIn  : secondsClamp(cutIn  - HALF_XFADE, 0, DUR);
    var layerOut = (j === clipSpecs.length - 1) ? cutOut : secondsClamp(cutOut + HALF_XFADE, 0, DUR);

    // Create layer
    var lyr  = comp.layers.add(footageItems[j]);
    lyr.name = "VID " + (j + 1) + " — " + spec.file;

    // Disable any clip audio; music drives the edit
    try { lyr.audioEnabled = false; } catch (e) {}

    // Place footage so it begins at layerIn (footage time 0 at layerIn)
    lyr.startTime = layerIn;
    lyr.inPoint   = layerIn;
    lyr.outPoint  = layerOut;

    // Opacity animation for cross-dissolve polish
    var keys = [];

    // Fade in (except first clip: keep solid from t=0)
    if (j === 0) {
        keys.push({ t: 0.0, v: 100 });
    } else {
        var fi0 = secondsClamp(cutIn - HALF_XFADE, 0, DUR);
        var fi1 = secondsClamp(cutIn + HALF_XFADE, 0, DUR);
        keys.push({ t: fi0, v: 0   });
        keys.push({ t: fi1, v: 100 });
    }

    // Fade out (except last clip)
    if (j < clipSpecs.length - 1) {
        var fo0 = secondsClamp(cutOut - HALF_XFADE, 0, DUR);
        var fo1 = secondsClamp(cutOut + HALF_XFADE, 0, DUR);
        keys.push({ t: fo0, v: 100 });
        keys.push({ t: fo1, v: 0   });
    } else {
        // Last clip stays up
        keys.push({ t: secondsClamp(cutOut, 0, DUR), v: 100 });
    }

    setOpacityKeys(lyr, keys);
}

// Add "Tuuuues-daaaaay!" retro tag at 00:26
var TAG_TIME = 26.0;
var tagLayer = comp.layers.addText("Tuuuues-daaaaay!");
tagLayer.name      = "TITLE — Tuuuues-daaaaay!";
tagLayer.startTime = TAG_TIME;
tagLayer.inPoint   = TAG_TIME;
tagLayer.outPoint  = DUR;

// Style text (built-in text tools). Font availability varies by system.
var td = tagLayer.property("ADBE Text Properties")
                 .property("ADBE Text Document").value;
td.fontSize       = 140;
td.applyFill      = true;
td.fillColor      = [1.0, 0.86, 0.20];  // warm yellow
td.applyStroke    = true;
td.strokeColor    = [0.25, 0.10, 0.02]; // deep brown
td.strokeWidth    = 10;
td.strokeOverFill = false;
td.justification  = ParagraphJustification.CENTER_JUSTIFY;

// Try a few "retro-ish block" fonts, fall back safely
var fontCandidates = [
    "CooperBlackStd", "Cooper Black", "ITC Cooper Std Black",
    "Arial Black", "Helvetica-Bold"
];
for (var f = 0; f < fontCandidates.length; f++) {
    try { td.font = fontCandidates[f]; break; } catch (eFont) {}
}
tagLayer.property("ADBE Text Properties")
        .property("ADBE Text Document").setValue(td);

// Position center-lower third
var pos = tagLayer.property("ADBE Transform Group").property("ADBE Position");
pos.setValue([W / 2, H * 0.72]);

// Add a subtle drop shadow effect for 70s punch
try {
    var ds = tagLayer.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
    ds.property("ADBE Drop Shadow-0002").setValue(12);   // Distance
    ds.property("ADBE Drop Shadow-0003").setValue(140);  // Direction
    ds.property("ADBE Drop Shadow-0004").setValue(25);   // Softness
    ds.property("ADBE Drop Shadow-0005").setValue(0.45); // Opacity
} catch (eDS) {}

// Make sure music is at bottom and text on top
try { musicLayer.moveToEnd();       } catch (eOrder) {}
try { tagLayer.moveToBeginning();   } catch (eOrder) {}

app.endUndoGroup();

alert("Done!\n\nCreated comp:\n" + COMP_NAME + "\n\nImported from:\n" + assetsFolder.fsName);

})();