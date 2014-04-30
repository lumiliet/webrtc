var videoCall = {
	localVideo: {
		stream: {},
		enabled: false
	}
}


videoCall.acceptor = function(id, stream) {


	conversationList.get(id).video = true;
	conversationList.get(id).stream = stream;

	
	easyrtc.setVideoObjectSrc(videoCall.createVideoElement(id), stream);
}

videoCall.disconnectListener = function(id) {
	videoCall.deleteVideoElement(id);
}

videoCall.call = function() {

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

videoCall.disableCamera = function() {
	videoCall.localVideo.stream.stop();
	videoCall.localVideo.stream = {};
	videoCall.localVideo.enabled = false;
}

videoCall.createVideoElement = function(id) {

	var video = controller.cameraWindow.document.createElement("video");
	video.id = "video_" + id;
	controller.cameraWindow.document.body.appendChild(video);
	return video;
}

videoCall.deleteVideoElement = function(id) {
	var video = controller.cameraWindow.document.getElementById("video_" + id);
	controller.cameraWindow.document.body.removeChild(video);
}
