
/* 


DR.UMAD


TODO:
- Stop Noise (Spacebar & Button)

- Background Visualization

- Looping Beat Set

- Song Recording (If not recording a new pad)

- Swap Sound Library (Nano?)
- Naming Pads
- Cute Pix per Pad
- Stickers on Machine


*/




var PRESETS = {"pad1" : {"name": "Kick Drum",
                              "path": "kick.wav"},
               "pad2" : {"name": "Snare",
                          "path": "snare.wav"},
                "pad3" : {"name": "Dream",
                          "path": "demo.mp3"},
                "pad4": {"name": "Mini",
                        "path": "ambient_clip.mp3"}
                };

var synth, pad_counter, mic, recorder, rec_pad, rec_state,
SOUNDS = PRESETS;

function preload() {
  for (var sound in PRESETS) {
    var sound_file = PRESETS[sound].path;
    PRESETS[sound].file = loadSound(sound_file);
  }
}

function setup() {
  /*var mycanvas = createCanvas(720, 200);
  mycanvas.parent("synth_wrapper");
  mycanvas.id("synth");*/

  // create an audio in
  mic = new p5.AudioIn();

  // users must manually enable their browser microphone for recording to work properly!
  mic.start();

  // create a sound recorder
  recorder = new p5.SoundRecorder();

  // connect the mic to the recorder
  recorder.setInput(mic);

  synth = createDiv("");
  synth.parent("synth");
  synth.id("pads");

  createDiv("").class("clear").parent("synth");

  pad_counter = 0;
  for (var sound in PRESETS) {
    pad_counter++;
    var pad = createDiv(PRESETS[sound].name).id("pad" + pad_counter)
    .class("pad ready")
    .parent("pads")
    .mousePressed(function() { playSound(this); });
  }

  newRecordingPad();
}

function newRecordingPad() {
  pad_counter++;
  rec_pad = createDiv("Record New")
    .id("pad" + pad_counter)
    .class("pad new")
    .parent("pads")
  .mousePressed(function(){ toggleRecording(this); });
  rec_state = 0;
}

function successRecording() {
  var pad_name = rec_pad.elt.id;
  rec_pad.removeClass("new")
  .addClass("ready")
  .html(pad_name)
  .mousePressed(function() { playSound(this); });

  // set up new recording pad
  newRecordingPad();

  // saveSound(soundFile, 'mySound.wav'); // save file
}

function toggleRecording(rec_pad) {
  if (rec_pad.elt.classList.contains("ready")) {
    return;
  }

  if (!mic.enabled) {
    alert("Please enable microphone access!");
    return;
  }

  if (rec_state === 0) {
    
    rec_pad.addClass("recording")
      .html("STOP REC");

    window.setTimeout(function() {
      SOUNDS[rec_pad.elt.id] = {"file": new p5.SoundFile()};
      // Tell recorder to record to a p5.SoundFile which we will use for playback
      recorder.record(SOUNDS[rec_pad.elt.id].file, 60, successRecording);
    }, 90);

    rec_state++;
  } else if (rec_state === 1) {
    rec_pad.removeClass("recording")
      .html("...");
    recorder.stop(); // stop recorder, and send the result to soundFile
  } 
}

function playSound(play_pad) {
  SOUNDS[play_pad.elt.id].file.play();
} 

function draw() {

}
