var videoCall = {
}

videoCall.acceptor = function(id, stream) {
	console.log("Call from " + friendList.get(id).username);
	friendList.get(id).audiovideo.enabled = true;
	friendList.get(id).audiovideo.stream = stream;
	easyrtc.setVideoObjectSrc(GUI.createVideoElement(id), stream);
}

videoCall.disconnectListener = function(id) {
	console.log(friendList.get(id).username + " disconnected from video chat");
	friendList.get(id).audiovideo.enabled = false;
	friendList.get(id).audiovideo.stream = {};
	GUI.deleteVideoElement(id);
}

videoCall.setLocalStream = function(stream) {
	friendList.get(controller.myId).audiovideo.stream = stream;
	friendList.get(controller.myId).audiovideo.enabled = true;
}

videoCall.stopLocalStream = function() {
	friendList.get(controller.myId).audiovideo.stream.stop();
	friendList.get(controller.myId).audiovideo.stream = {};
	friendList.get(controller.myId).audiovideo.enabled = false;
}

videoCall.enableCamera = function() {
	easyrtc.initMediaSource(
		function(){
			videoCall.setLocalStream(easyrtc.getLocalStream());
			easyrtc.setVideoObjectSrc(GUI.createVideoElement(controller.myId), friendList.get(controller.myId).audiovideo.stream);
			controller.busy = false;
		},
		function(){
			easyrtc.showError("no-media", "Unable to get local media");
		}
	);
}

videoCall.enableAudio = function(id, enable) {
	friendList.get(id).audiovideo.audioMuted = !enable;
	GUI.enableAudio(id, enable);
	if (id === controller.myId) {
		controller.signalAll((enable ? "enableAudio" : "disableAudio"));
		easyrtc.enableMicrophone(enable);
	}
}

videoCall.enableVideo = function(id, enable) {
	friendList.get(id).audiovideo.videoMuted = !enable;
	GUI.enableVideo(id, enable);
	if (id === controller.myId) {
		controller.signalAll((enable ? "enableVideo" : "disableVideo"));
		easyrtc.enableCamera(enable);
	}
}




