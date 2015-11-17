window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// setting variables  for pitch shifting
var MIN_SAMPLES = 0;
var buf = new Float32Array(1024); 
var count = 5;
var grainSize = 1024,
    pitchRatio = 1,
    overlapRatio = 0.50;

var callPeer = function(call){
	// Hang up exisiting call
	if (window.exisitingCall){
		window.existingCall.close();
	}
	
	//
	call.on('stream', function(stream){
		var theirVideo = document.getElementById('theirs');
		theirVideo.src = URL.createObjectURL(stream);
		console.log('call successful !')
	});
	
	window.existingCall = call;
}

navigator.getUserMedia({audio: true}, function(stream) {

    //creating audio context
    var context = new AudioContext();

    //setting audio
    var audio = context.createMediaStreamSource(stream);

    // setting analyser for pitch detection
    var analyser = context.createAnalyser();
    analyser.fftSize = 2048;

    //setting pre-gain for better pitch shifting
    var preGain = context.createGain();
    preGain.gain.value = 0.5;

    //and pitch-shifting process
    context.createScriptProcessor = context.createScriptProcessor || context.createJavaScriptNode;
    var pitchShifterProcessor = context.createScriptProcessor(grainSize, 1, 1);
    pitchShifterProcessor.buffer = new Float32Array(grainSize * 2);
    pitchShifterProcessor.grainWindow = hannWindow(grainSize);
    pitchShifterProcessor.onaudioprocess = function (event) {
        pitchShift (event, pitchShifterProcessor);
    }

    //setting post-treatment filters
    var lowPassFilter = context.createBiquadFilter();
    lowPassFilter.type = "lowpass";
    lowPassFilter.frequency.value = 7500;
    lowPassFilter.gain.value = 2;

    var highPassFilter = context.createBiquadFilter();
    highPassFilter.type = "highpass";
    highPassFilter.frequency.value = 400;
    
    
    // Stream node
    var streamNode = context.createMediaStreamDestination();


    //connecting channels
    audio.connect(analyser);
    analyser.connect(preGain);
    preGain.connect(pitchShifterProcessor);
    pitchShifterProcessor.connect(lowPassFilter);
    lowPassFilter.connect(highPassFilter);
    highPassFilter.connect(context.destination);
    highPassFilter.connect(streamNode);
	
    var scale = createScale (110,5);

    //P2P part
    var peer = new Peer({host: '192.168.0.14', port: 9002, path :'/peerjs'});
    peer.on('open', function(id) {
    	console.log('My id is ' + id);
    });
    peer.on('call', function(call){
    	call.answer(streamNode.stream);
    	callPeer(call);
    })

	// function for the button that triggers the call
	document.getElementById('call').onclick = function(){
		var callid = document.getElementById('callto').value;
		var call = peer.call(callid, streamNode.stream);
		
		callPeer(call);
	};


    //initiate process for pitch update every 20 ms
    setInterval(function() {    
        analyser.getFloatTimeDomainData( buf );
        if (count == 5) {
            //drawWave(buf);
            count = 0;
        } else {
            count++;
        }
        // find frequency of the sound
	      var pitchFrequency = autoCorrelate( buf, context.sampleRate );
        // update pitch Ratio to get to the closer pitch if frequency was detected
        if (pitchFrequency != -1){
            var pitchShift = getCloserInTuneFrequency(pitchFrequency, scale);
            pitchRatio = pitchShift/pitchFrequency
        }
    }, 20);

}, function(err) {
    console.log("The following error occured: " + err);
});


