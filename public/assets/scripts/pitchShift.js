var hannWindow = function (length) {

    var window = new Float32Array(length);
    for (var i = 0; i < length; i++) {
        window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
    }
    return window;
};

var linearInterpolation = function (a, b, t) {
    return Math.max(-1, Math.min(1, a + (b - a) * t));
};


var pitchShift = function (event, pS) {

    var inputData = event.inputBuffer.getChannelData(0);
    var outputData = event.outputBuffer.getChannelData(0);

    for (i = 0; i < inputData.length; i++) {

        // Apply the window to the input buffer
        inputData[i] *= pS.grainWindow[i];

        // Shift half of the buffer
        pS.buffer[i] = pS.buffer[i + grainSize];

        // Empty the buffer tail
        pS.buffer[i + grainSize] = 0.0;
    }

    // Calculate the pitch shifted grain re-sampling and looping the input
    var grainData = new Float32Array(grainSize * 2);
    for (var i = 0, j = 0.0;
         i < grainSize;
         i++, j += pitchRatio) {

        var index = Math.floor(j) % grainSize;
        var a = inputData[index];
        var b = inputData[(index + 1) % grainSize];
        grainData[i] += linearInterpolation(a, b, j % 2.0) * pS.grainWindow[i];
    }

    // Copy the grain multiple times overlapping it
    for (i = 0; i < grainSize; i += Math.round(grainSize * (Math.abs(1 - overlapRatio)))) {
        for (j = 0; j <= grainSize; j++) {
            pS.buffer[i + j] += grainData[j];
        }
    }

    // Output the first half of the buffer
    for (i = 0; i < grainSize; i++) {
        outputData[i] = pS.buffer[i];
    }
};
