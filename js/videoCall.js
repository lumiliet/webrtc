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



}

videoCall.disconnectListener = function(id) {
	console.log(conversationList.get(id).username + " disconnected from video chat");

	friendList.get(id).video = false;

	if (videoCall.sendingVideoTo[id]) {
		delete videoCall.sendingVideoTo[id];
	}

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
	if (!conversationList.getCurrent()) return;
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

		},
		function(){
			easyrtc.showError("no-media", "Unable to get local media");
		}
	);

}

videoCall.disconnect = function(conversationId) {
	
}



videoCall.call = function(id, conversationId) {
	console.log("Call to "  + conversationList.get(id));
	if (!conversationList.get(id).online) {
		console.log("Call failed, friend no longer online");
		return;
	}
	if (conversationList.get(id).sendingVideo) {
		console.log("Video call to " + id + " already established");
		return;
	}

	if (conversationId) {
		controller.signalVideoWaiting(id, conversationId);
		videoCall.countCalls(conversationId, true);
	}
	else videoCall.countCalls(id, true);

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
						videoCall.setLocalStream(easyrtc.getLocalStream());
						if (conversationId) {
							conversationList.get(conversationId).sendingVideo = true;
						}
						conversationList.get(easyrtcid).sendingVideo = true;
					}
					else{
						console.log("call rejected" + easyrtc.idToName(easyrtcid));
					}

				}
			}(conversationId)
	);
}


