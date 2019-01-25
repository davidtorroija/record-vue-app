<template>
   <div>
       <h1>Simple Recorder.js demo</h1>
       <p>
           Matt Diamond‘s <a href="https://github.com/mattdiamond/Recorderjs">Recorder.js</a> is a popular JavaScript library for recording audio in the browser as uncompressed pcm audio in .wav containers. Before it the only way to record audio was to
           use Flash.
       </p>

       <p>Check out the <a href="https://github.com/addpipe/simple-recorderjs-demo" target="_blank">code on GitHub</a> and our <a href="https://addpipe.com/blog/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/" target="_blank">blog post
               on using Recorder.js to capture WAV audio</a>.</p>
       <div id="controls">
          <button id="recordButton">Record</button>
           <button id="recordButton2">Record2</button>
           <button id="pauseButton" disabled>Pause</button>
           <button id="stopButton" disabled>Stop</button>
       </div>
       <div id="formats">Format: start recording to see sample rate</div>
       <h3>Recordings</h3>
       <ol id="recordingsList"></ol>
   </div>
</template>
<script>
import "./record-audio/recorder.js"
//webkitURL is deprecated but nevertheless
var URL = window.URL || window.webkitURL;

//do something after mounting vue instance
var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

var recordButton;
var stopButton;
var pauseButton;
// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //audio context to help us record

function startRecording() {
	console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/

    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia()
	*/

	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false

	/*
    	We're using the standard promise based getUserMedia()
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device
		*/
		audioContext = new AudioContext();

		//update the format
		document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

		/*  assign to gumStream for later use  */
		gumStream = stream;

		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/*
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true
	});
}

function pauseRecording(){
	console.log("pauseButton clicked rec.recording=",rec.recording );
	if (rec.recording){
		//pause
		rec.stop();
		pauseButton.innerHTML="Resume";
	}else{
		//resume
		rec.record()
		pauseButton.innerHTML="Pause";

	}
}

function stopRecording() {
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML="Pause";

	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');

	//name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//save to disk link
	link.href = url;
	link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	link.innerHTML = "Save to disk";

	//add the new audio element to li
	li.appendChild(au);

	//add the filename to the li
	li.appendChild(document.createTextNode(filename+".wav "))

	//add the save to disk link to li
	li.appendChild(link);

	//upload link
	var upload = document.createElement('a');
	upload.href="#";
	upload.innerHTML = "Upload";
	upload.addEventListener("click", function(event){
		  var xhr=new XMLHttpRequest();
		  xhr.onload=function(e) {
		      if(this.readyState === 4) {
		          console.log("Server returned: ",e.target.responseText);
		      }
		  };
		  var fd=new FormData();
		  fd.append("audio_data",blob, filename);
		  xhr.open("POST","upload.php",true);
		  xhr.send(fd);
	})
	li.appendChild(document.createTextNode (" "))//add a space in between
	li.appendChild(upload)//add the upload link to li

	//add the li element to the ol
	recordingsList.appendChild(li);
}
export default {
    name: "",
    data() {
      return {};
    },
    mounted() {

      var recorder, gumStream;
      var recordButton = document.getElementById("recordButton2");
      recordButton.addEventListener("click", toggleRecording);
      function toggleRecording() {
        if (recorder && recorder.state=="recording"){
          recorder.stop();
          gumStream.getAudioTracks()[0].stop();
        }else{
          navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
            gumStream = stream;
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = function(e){
              var url = URL.createObjectURL(e.data);
              console.log(e.data, url, e)
              var preview = document.createElement('audio');
              preview.controls = true;preview.src = url;
              document.body.appendChild(preview);
              let fileReader = new FileReader();
              fileReader.addEventListener('load', e =>
                 // wavesurfer.loadArrayBuffer(e.target.result)
                 console.log(e.target.result)
              );
              fileReader.readAsArrayBuffer(e.data);
            };
            recorder.start();
          });
        }
      }
      console.log("mounted", document.getElementById("recordButton"));
      // shim for AudioContext when it's not avb.
      AudioContext = window.AudioContext || window.webkitAudioContext;

      recordButton = document.getElementById("recordButton");
      stopButton = document.getElementById("stopButton");
      pauseButton = document.getElementById("pauseButton");

      //add events to those 2 buttons
      recordButton.addEventListener("click", startRecording);
      stopButton.addEventListener("click", stopRecording);
      pauseButton.addEventListener("click", pauseRecording);
    }
}
</script>
<style>
* {
    padding: 0;
    margin: 0;
}
a {
    color: #337ab7;
}
p {
    margin-top: 1rem;
}
a:hover {
    color: #23527c;
}
a:visited {
    color: #8d75a3;
}
body {
    margin: 1rem;
    padding: 1rem;
    font-family: sans-serif;
    max-width: 28rem;
    margin: 0 auto;
    position: relative;
}
#controls {
    display: flex;
    margin-top: 2rem;
}
button {
    flex-grow: 1;
    height: 2.5rem;
    min-width: 2rem;
    border: none;
    border-radius: 0.15rem;
    background: #ed341d;
    margin-left: 2px;
    box-shadow: inset 0 -0.15rem 0 rgba(0, 0, 0, 0.2);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    font-weight: bold;
    font-size: 1rem;
}
button:focus,
button:hover {
    outline: none;
    background: #c72d1c;
}
button::-moz-focus-inner {
    border: 0;
}
button:active {
    box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.2);
    line-height: 3rem;
}
button:disabled {
    pointer-events: none;
    background: lightgray;
}
button:first-child {
    margin-left: 0;
}
audio {
    display: block;
    width: 100%;
    margin-top: 0.2rem;
}
li {
    list-style: none;
    margin-bottom: 1rem;
}
#formats {
    margin-top: 0.5rem;
    font-size: 80%;
}
</style>
