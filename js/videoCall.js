var videoCall = {
	localStream: {
		stream: {},
		enabled: false
	},
	busy: false,
	connectionCounter: {
		value: 0,
		increment: function() {
			this.value++;
			console.log("connectionCounter: " + this.value);
		},
		decrement: function() {
			this.value--;
			console.log("connectionCounter: " + this.value);
			if (this.value === 0) {
				videoCall.stopLocalStream();
			}
		}
	},
	sendingVideoTo: {},
}


videoCall.acceptor = function(id, stream) {

	console.log("Call from " + conversationList.get(id).username);
	
	conversationList.get(id).video = true;

	var conversationId = id;
	if (conversationList.get(id).waitingForGroupVideo) {
		conversationId = conversationList.get(id).waitingForGroupVideo.id;
	}
	controller.setCurrentConversation(conversationId);

	var addElementToWindow = function() {
		console.log("Stage freeze!");
		var cameraWindow = conversationList.get(conversationId).cameraWindow;
		easyrtc.setVideoObjectSrc(cameraWindow.createVideoElement(id), stream);
		cameraWindow.setTitle(conversationList.get(conversationId).toString());
		
	}
	if (!conversationList.get(conversationId).cameraWindow.open) {
		conversationList.get(conversationId).cameraWindow.openWindow();
		window.setTimeout(addElementToWindow, 1500);
	}
	else addElementToWindow();
}

videoCall.disconnectListener = function(id) {
	console.log(conversationList.get(id).username + " disconnected from video chat");

	if (conversationList.get(id).cameraWindow.open) conversationList.get(id).cameraWindow.closeWindow();

	if (conversationList.get(id).video) {
		var groups = conversationList.get(id).participantIn;
		for (var g in groups) {
			var cameraWindow = conversationList.get(groups[g]).cameraWindow;
			if (cameraWindow.open) {
				console.log("trying to delete " + id);
				cameraWindow.deleteVideoElement(id);
				if (cameraWindow.videoElements === 0) cameraWindow.closeWindow();
			}
		}
	}
	conversationList.get(id).video = false;

	if (videoCall.sendingVideoTo[id]) {
		videoCall.connectionCounter.decrement();
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

videoCall.videoGlyphListener = function() {
	if (fileTransfer.busy || videoCall.busy) return;
	if (conversationList.getCurrent().sendingVideo) videoCall.disconnect();
	else videoCall.sendVideo();
}

videoCall.sendVideo = function() {
	if (!conversationList.getCurrent()) return;
	if (fileTransfer.busy || videoCall.busy) return;
	videoCall.busy = true;

	if (!videoCall.localStream.enabled) {
		videoCall.enableSource(true);
		easyrtc.initMediaSource(
			function(){
				videoCall.enableSource(false);
				videoCall.setLocalStream(easyrtc.getLocalStream());
				videoCall.connect();

			},
			function(){
				easyrtc.showError("no-media", "Unable to get local media");
			}
		);
	}
	else videoCall.connect();
}

videoCall.enableSource = function(enable) {
		easyrtc.enableVideo(enable);
		//easyrtc.enableAudio(enable);
}

videoCall.connect = function() {
	var conversation = conversationList.getCurrent();
	if (conversation.isGroupConversation) {
		var participants = conversation.participants;

		for (var p in participants) {
			videoCall.call(participants[p], conversation.id);
		}
	}
	else {
		videoCall.call(conversation.id);
	}
}

videoCall.disconnect = function(conversationId) {
	var conversation = (conversationId ? conversationList.get(conversationId) : conversationList.getCurrent());
	if (!conversation) return;
	if (conversation.isGroupConversation) {
		var participants = conversation.participants;

		for (var p in participants) {
			easyrtc.hangup(participants[p]);
			conversationList.get(participants[p]).sendingVideo = false;
		}
		conversation.sendingVideo = false;
		videoCall.busy = false;
	}
	else {
		easyrtc.hangup(conversation.id);
		conversation.sendingVideo = false;
		videoCall.busy = false;
	}
}

videoCall.countCalls = function(conversationId, increment) {
	var conversation = conversationList.get(conversationId);
	if (increment) conversation.callCounter.video ++;
	else conversation.callCounter.video --;
	if (conversation.callCounter.video === 0) {
		videoCall.enableSource(false);
		videoCall.busy = false;
	}
	else {
		videoCall.enableSource(true);
	}
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
					videoCall.connectionCounter.increment();
					videoCall.setLocalStream(easyrtc.getLocalStream());
					if (conversationId) {
						conversationList.get(conversationId).sendingVideo = true;
					}
					conversationList.get(easyrtcid).sendingVideo = true;
				}
				else{
					console.log("call rejected" + easyrtc.idToName(easyrtcid));
				}
				if (conversationId) {
				   	controller.signalVideoWaiting(easyrtcid);
					videoCall.countCalls(conversationId, false);
				}
				else videoCall.countCalls(id, false);
	
			}
		}(conversationId)
	);
}


