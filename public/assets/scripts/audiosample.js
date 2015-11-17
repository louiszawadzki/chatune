video.src = '/Autotunes/Live/sample2.mp3';
video.volume = 1;
audiosrc = context.createMediaElementSource(video);
audio.disconnect();
audiosrc.connect(analyser);
video.play();
