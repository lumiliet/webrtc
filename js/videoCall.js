var videoCall = {
	localStream: {
		stream: {},
		enabled: false
	},
	busy: false,
	connectionCounter: 0,
}


videoCall.acceptor = function(id, stream) {

	console.log("Call from " + conversationList.get(id).username);
	
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

	var groups = conversationList.get(id).participantIn;
	for (var g in groups) {
		var cameraWindow = conversationList.get(groups[g]).cameraWindow;
		if (cameraWindow.open) {
			cameraWindow.deleteVideoElement(id);
			if (cameraWindow.videoElements === 0) cameraWindow.closeWindow();
		}
	}

	videoCall.connectionCounter--;

	if (videoCall.connectionCounter === 0) {
		videoCall.stopLocalStream();
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
	if (videoCall.busy) return;
	videoCall.busy = true;

	if (!videoCall.localStream.enabled) {
		easyrtc.enableVideo(true);
		easyrtc.initMediaSource(
			function(){
				easyrtc.enableVideo(false);
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

videoCall.connect = function() {
	var conversation = conversationList.getCurrent();
	if (conversation.multi) {
		var participants = conversation.participants;

		if (conversation.sendingVideo) {
			for (var p in participants) {
				easyrtc.hangup(participants[p]);
			}
			conversation.sendingVideo = false;
			videoCall.busy = false;
		}
		else {
			for (var p in participants) {
				videoCall.call(participants[p], conversation.id);
			}
		}
	}
	else {
		if (conversation.sendingVideo) {
			easyrtc.hangup(conversation.id);
			conversation.sendingVideo = false;
			videoCall.busy = false;
		}
		else videoCall.call(conversation.id);
	}
}	

videoCall.countCalls = function(conversationId, increment) {
	var conversation = conversationList.get(conversationId);
	if (increment) conversation.callCounter.video ++;
	else conversation.callCounter.video --;
	if (conversation.callCounter.video === 0) {
		easyrtc.enableVideo(false);
		videoCall.busy = false;
	}
	else {
		easyrtc.enableVideo(true);
	}
}


videoCall.call = function(id, conversationId) {
	console.log("Call to "  + conversationList.get(id));
	if (!conversationList.get(id).online) {
		console.log("Call failed, friend no longer online");
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
					videoCall.connectionCounter++;
					videoCall.setLocalStream(easyrtc.getLocalStream());
					if (conversationId) {
						conversationList.get(conversationId).sendingVideo = true;
					}
					else conversationList.get(easyrtcid).sendingVideo = true;
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


