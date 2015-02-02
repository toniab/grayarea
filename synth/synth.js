window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var recIndex = 0;

function recordPad() {
    if ($(".new").size()) {
        return;
    }
    
    var newPad = document.createElement("div");
    newPad.className = "pad new";
    newPad.id = "pad" + ($(".pad").length + 1);
    newPad.innerHTML = "START REC"
    document.getElementById("pads").appendChild(newPad);
    $(newPad).click(function(e){toggleRecording(this);});
}

function gotBuffers( buffers ) {
    /*var canvas = document.getElementById( "wavedisplay" );

    drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );
*/
    // the ONLY time gotBuffers is called is right after a new recording is completed - 
    // so here's where we should set up the download.
    audioRecorder.exportWAV(doneEncoding);
}

function doneEncoding(blob) {
    var selector = $(".new").attr("id");
    var url = Recorder.setupDownload(blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav", selector);
    var $link = $("#" + selector);
    $link.data("sound", url).attr("data-sound", url);
    addAudioProperties(document.getElementById(selector));
    $link.html(selector).removeClass("new").addClass("ready")
    recIndex++;
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

//    audioInput = convertToMono( input );
/*
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );*/

    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
}

function toggleRecording(elem) {
    if (!$(elem).hasClass("new")) {
        return
    }
    if (elem.classList.contains("recording")) {
        // stop recording
        audioRecorder.stop();
        elem.classList.remove("recording");
        elem.innerHTML = "[..]";
        audioRecorder.getBuffers(gotBuffers);
    } else {
        // start recording
        if (!audioRecorder)
            return;
        elem.classList.add("recording");
        elem.innerHTML = "STOP REC";
        window.setTimeout(function() {
            audioRecorder.clear();
            audioRecorder.record();
        }, 50);
    }
}


function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
}

function addAudioProperties(object) {
    console.log(object);
    object.name = object.id; // the "id" attribute of the HTML element
    object.source = $(object).data('sound'); // the "data-sound" attribute of the HTML element
    loadAudio(object, object.source);
    object.play = function () {
        if (object.s) {
            object.s.stop();
        }
        var s = audioContext.createBufferSource();
        s.buffer = object.buffer;
        s.connect(audioContext.destination);
        s.start(0);
        object.s = s;
    }
    $(object).bind("click", object.play);
}

function loadAudio(object, url) {
    // similar to $.ajax, but I am not sure that $.ajax
    // allows responseType 'arraybuffer'
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    // request.onload is like the $.ajax 'success' callback function
    request.onload = function() {
        audioContext.decodeAudioData(request.response, function(buffer) {
            object.buffer = buffer;
            console.log('buffer', buffer, 'channel data', buffer.getChannelData(0));
        });
    }
    request.send();
}

$(document).ready(function() {
    function hasGetUserMedia() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }
    if (hasGetUserMedia()) {
        $("#record_pad").show();
        initAudio();
    } else {
        alert('use Chrome to add your own sound!');
    }

    $("#record_pad").click(recordPad);
});

$(window).load(function() {

    $('.pad').each(function() { // for each HTML element with CSS class "pad"...
        // 'this' is the object representing the HTML element,
        // like what we get from document.getElementById
        addAudioProperties(this);
    });

    $('.pad').click(function() {
        this.play();
    });

    $('.wave').each(function() {
        this.is_playing = false;
    });

    $('.wave').click(function() {
        if (this.is_playing) {
            this.oscillator.stop();
        } else {
            this.oscillator = audioContext.createOscillator(); 
            this.oscillator.type = $(this).data('type');
            this.oscillator.frequency.value = $(this).data('freq');
            this.oscillator.connect(audioContext.destination);
            this.oscillator.start(0);
            console.log('playing oscillator', this.oscillator);
        }
        this.is_playing = !this.is_playing;
    });
});
