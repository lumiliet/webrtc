var videoCall = {
	localStream: {
		stream: {},
		enabled: false
	},
	busy: false,
	sendingVideoTo: {},
}


videoCall.acceptor = function(id, stream) {

	console.log("Call from " + friendList.get(id).username);

	friendList.get(id).video = true;
	easyrtc.setVideoObjectSrc(GUI.createVideoElement(id), stream);


}

videoCall.disconnectListener = function(id) {
	console.log(friendList.get(id).username + " disconnected from video chat");

	friendList.get(id).video = false;

	if (videoCall.sendingVideoTo[id]) {
		delete videoCall.sendingVideoTo[id];
	}

	GUI.deleteVideoElement(id);

}

videoCall.setLocalStream = function(stream) {
	videoCall.localStream.stream = stream;
	videoCall.localStream.enabled = true;
}

videoCall.stopLocalStream = function() {
	videoCall.localStream.stream.stop();
	videoCall.localStream.stream = {};
	videoCall.localStream.enabled = false;
}

videoCall.sendVideo = function() {
	if (fileTransfer.busy || videoCall.busy) return;
	videoCall.busy = true;

	if (!videoCall.localStream.enabled) {
		videoCall.enableSource(true);
	}
	else videoCall.connect();
}

videoCall.enableSource = function(enable) {
	easyrtc.enableVideo(enable);
	//easyrtc.enableAudio(enable);
}

videoCall.connect = function() {
	var participants = conversation.participants;

	for (var p in participants) {
		videoCall.call(participants[p], conversation.id);
	}
}

videoCall.enableCamera = function() {
	easyrtc.initMediaSource(
		function(){
			videoCall.setLocalStream(easyrtc.getLocalStream());
			easyrtc.setVideoObjectSrc(GUI.createVideoElement(controller.id), videoCall.localStream.stream);
			controller.busy = false;

		},
		function(){
			easyrtc.showError("no-media", "Unable to get local media");
		}
	);
}

videoCall.disconnect = function(conversationId) {
	console.log(conversation.participants);
	if (!conversation.isFree()) {
		var participants = conversation.participants;
		for (var p in participants) {
			console.log( participants[p]);
			friendList.get( participants[p]).audiovideo = false;
			easyrtc.hangup( participants[p]);
		}
		controller.reset();
	}
}



videoCall.call = function(id, conversationId) {
	console.log("Call to "  + friendList.get(id).username);
	if (!friendList.get(id).online) {
		console.log("Call failed, friend no longer online");
		return;
	}
	if (friendList.get(id).audiovideo) {
		console.log("Video call to " + id + " already established");
		return;
	}
	easyrtc.call(id,
			function(otherCaller, mediaType) {
				console.log("Call succesful - " + otherCaller + " - " + mediaType);
			},
			function(errorCode, errMessage) {
				console.log("Call failed - " + errorCode + " - " + errMessage);
			},
			function(){
				return function(wasAccepted, easyrtcid) {
					if(wasAccepted){
						console.log("call accepted by " + easyrtc.idToName(easyrtcid));
						videoCall.sendingVideoTo[id] = true;
						friendList.get(easyrtcid).audiovideo = true;
					}
					else{
						console.log("call rejected" + easyrtc.idToName(easyrtcid));
					}

				}
			}(conversationId)
	);
}


