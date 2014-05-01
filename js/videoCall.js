var videoCall = {
	localVideo: {
		stream: {},
		enabled: false
	}
}


videoCall.acceptor = function(id, stream) {

	console.log("Call from " + id);

	if (conversationList.get(id).waitingForGroupVideo) {
		
		groupId = conversationList.get(id).waitingForGroupVideo.id;
	}

	var addElementToWindow = function() {
		console.log("Stage freeze!");
		easyrtc.setVideoObjectSrc(conversationList.get(groupId).cameraWindow.createVideoElement(id), stream);
	}
	if (!conversationList.get(groupId).cameraWindow.open) {
		conversationList.get(groupId).cameraWindow.openWindow();
		window.setTimeout(addElementToWindow, 2000);
	}
	else addElementToWindow();
}

videoCall.disconnectListener = function(id) {
	if (conversationList.get(id).cameraWindow.open) conversationList.get(id).cameraWindow.closeWindow();

	var groups = conversationList.get(id).participantIn;
	for (var g in groups) {
		var cameraWindow = conversationList.get(groups[g]).cameraWindow;
		if (cameraWindow.open) {
			cameraWindow.deleteVideoElement(id);
			if (cameraWindow.videoElements === 0) cameraWindow.closeWindow();
		}
	}
}


videoCall.enableCamera = function() {
	easyrtc.initMediaSource(
		function(){

			videoCall.localVideo.stream = easyrtc.getLocalStream();
			videoCall.localVideo.enabled = true;

			easyrtc.setVideoObjectSrc( controller.cameraWindow.document.getElementById("videoSelf"), videoCall.localVideo.stream);
		},
		function(){
			easyrtc.showError("no-media", "Unable to get local media");
		}
	);
}
videoCall.storeStream = function(stream) {
	videoCall.localVideo.stream = stream;
	videoCall.localVideo.enabled = true;
}

videoCall.stopStream = function() {
	videoCall.localVideo.stream.stop();
	videoCall.localVideo.stream = {};
	videoCall.localVideo.enabled = false;
}

