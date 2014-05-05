var videoCall = {
	localVideo: {
		stream: {},
		enabled: false
	}
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
		window.setTimeout(addElementToWindow, 2000);
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


videoCall.sendVideo = function() {
	var conversation = conversationList.getCurrent();
	if (!conversation) return;

	if (conversation.multi) {
		var participants = conversation.participants;

		if (conversation.sendingVideo) {
			for (var p in participants) {
				easyrtc.hangup(participants[p]);
			}
			conversation.sendingVideo = false;
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
		}
		else videoCall.call(conversation.id);
	}
	controller.updateGUI();
}


videoCall.countCalls = function(conversationId, increment) {
	console.log("Counting video calls for conversationId: " + conversationId);
	var conversation = conversationList.get(conversationId);
	if (increment) conversation.callCounter.video ++;
	else conversation.callCounter.video --;
	if (conversation.callCounter.video === 0) {
		easyrtc.enableVideo(false);
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
	else easyrtc.enableVideo(true);
	
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
					videoCall.storeStream(easyrtc.getLocalStream());
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
				else easyrtc.enableVideo(false);
	
			}
		}(conversationId)
	);
}


