
controller.acceptor = function(id, stream) {
	if (controller.localVideo.enabled) return;
	
	controller.setCurrentConversation(id);
	
	controller.localVideo.stream = easyrtc.getLocalStream();
	controller.localVideo.enabled = true;
	
	conversationList.get(id).stream = stream;
	conversationList.get(id).video = true;
	
	var videoSelf = document.getElementById("videoSelf");
	var videoCaller = document.getElementById("videoCaller");
	easyrtc.setVideoObjectSrc(videoSelf, controller.localVideo.stream);
	easyrtc.setVideoObjectSrc(videoCaller, stream);
	
	GUI.toggleVideo(true);
	var currentdate = new Date(); 
	var datetime = "Call started: " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
	conversationList.addMessageToConversation("", datetime);
	controller.updateGUI();
}

controller.disconnectListener = function(id) {
	if (!controller.localVideo.enabled) return;
	
	//controller.localVideo.stream.stop();
	controller.localVideo.stream = {};
	controller.localVideo.enabled = false;
	
	conversationList.get(id).stream = {};
	conversationList.get(id).video = false;
	
	GUI.toggleVideo(false);
	var currentdate = new Date(); 
	var datetime = "Call ended: " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
	conversationList.addMessageToConversation("", datetime);
	controller.updateGUI();
	
}


controller.friendClickListener = function(id) {
	if (controller.friendSelectMode) {
		var current = conversationList.getCurrent();
		if (current && current.multi) {
			controller.inviteFriendToRoom(id, current.id);
		}
	}
	else controller.setCurrentConversation(id);
	controller.updateGUI();
}

controller.friendSelectModeListener = function() {
	var current = conversationList.getCurrent();
	if (!controller.friendSelectMode) {
		if (current && current.multi) {
			controller.setFriendSelectMode(true);
			
			
		}
	}
	else {
		controller.setFriendSelectMode(false);
		
	}
}


controller.roomListener = function(roomName, friends) {
	if (roomName === "default") {
		GUI.updateFriendList(friends);
		conversationList.updateOnlineFriends(friends);
		controller.updateGUI();
	}
	else {
		conversationList.conversationListener(roomName, friends);
	}
	conversationList.updateFriends(friends);
	controller.updateGUI();
}

controller.documentKeyListener = function(e) {
	if (e.keyCode === 27) {
		controller.setFriendSelectMode(false);
		
	}
	else if (e.keyCode === 13) {
		controller.setFriendSelectMode(false);
		
	}
	
}
