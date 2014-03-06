var controller = {
	friendSelectMode: false,
	id: ""
}

controller.setCurrentConversation = function(id) {
	conversationList.setCurrentConversation(id);
	controller.updateGUI();
}

controller.updateGUI = function() {
	GUI.cleanChat();
	
	if (conversationList.getCurrentConversationId()) {
		GUI.writeHTMLToChat(conversationList.getCurrentConversation().html);
		if (conversationList.getCurrentConversation().multi) GUI.setButtonDisabled("friendSelectMode", false);
		else GUI.setButtonDisabled("friendSelectMode", true);
	}
	GUI.updateConversationList(conversationList.getAll());
	var text = "";
	if (conversationList.getCurrentConversation()) {	
		text += conversationList.getCurrentConversation().toStringTitle();
	}
	else {
		text += "";
	}
	GUI.setChatLabel(text);
	
}

controller.receiveMessage = function(id, msgType, message) {
	if (msgType === "message") {	
		controller.addMessageToConversation(id, message);
		GUI.notification(conversationList.get(id).username);
	}
	else if (msgType === "roomInvite") {
		if (!conversationList.get(message)) easyrtc.joinRoom(message);
	}
	else {
		if (conversationList.get(msgType)) {
			GUI.notification(conversationList.get(id).username);
			controller.addMessageToConversation(id, message, msgType)
		}
	}
	controller.updateGUI();
}

controller.addMessageToConversation = function(sender, message, conversation) {
	var html = conversationList.generateMessageHTML(sender, message);
	conversationList.addHTML((conversation ? conversation : sender), html);
}

controller.sendMessage = function() {
	var message = GUI.getTextFromMessageField();
	
	if (!message.length || !conversationList.getCurrentConversationId() || !conversationList.getCurrentConversation().online) return;
	
	GUI.cleanMessageField();
	
	if (conversationList.getCurrentConversation().multi) {
		var participants = conversationList.getCurrentConversation().participants
		for (var i in participants) {
			easyrtc.sendData(participants[i], conversationList.getCurrentConversationId(), message);
		}
	}
	else {
		easyrtc.sendData(conversationList.getCurrentConversationId(), "message", message);
	}
	controller.addMessageToConversation(conversationList.getCurrentConversationId(), message);
	controller.updateGUI();
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

controller.newGroupConversation = function() {
	var groupConversation = conversationList.newGroupConversation();
	easyrtc.joinRoom(groupConversation.id);	
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

controller.setFriendSelectMode = function(enable) {
	controller.friendSelectMode = enable;
	console.log("Friend select mode " + (enable? "activated" : "deactivated"));
}

controller.inviteFriendToRoom = function(id, room) {
	easyrtc.sendData(id, "roomInvite", room);
}

controller.friendClickListener = function(id) {
	if (controller.friendSelectMode) {
		var current = conversationList.getCurrentConversation();
		if (current && current.multi) {
			controller.inviteFriendToRoom(id, current.id);
		}
	}
	else controller.setCurrentConversation(id);
	controller.updateGUI();
}


controller.friendSelectModeListener = function() {
	var current = conversationList.getCurrentConversation();
	if (!controller.friendSelectMode) {
		if (current && current.multi) {
			controller.setFriendSelectMode(true);
			GUI.setButtonText("friendSelectMode", "Stop adding friends");
			
		}
	}
	else {
		controller.setFriendSelectMode(false);
		GUI.setButtonText("friendSelectMode", "Add friends to the conversation");
		
	}
}



controller.call = function() {
	if (!conversations.getCurrentConversationId()) return;
	
	if (!conversations.getCurrentConversation().video) {
		console.log("YO");
		/*
		easyrtc.call(conversations.getCurrentConversationId(),
			function(otherCaller, mediaType) {
				console.log("Call succesful - " + otherCaller + " - " + mediaType);
			},
			function(errorCode, errMessage) {
				console.log("Call failed - " + errorCode + " - " + errMessage);
			}
		);
		
		*/
		easyrtc.call( conversations.getCurrentConversationId(),
		       function(easyrtcid, mediaType){
		          console.log("Got mediatype " + mediaType + " from " + easyrtc.idToName(easyrtcid));
		       },
		       function(errorCode, errMessage){
		          console.log("call to  " + easyrtc.idToName(otherEasyrtcid) + " failed:" + errMessage);
		       },
		       function(wasAccepted, easyrtcid){
		           if( wasAccepted ){
		              console.log("call accepted by " + easyrtc.idToName(easyrtcid));
		           }
		           else{
		               console.log("call rejected" + easyrtc.idToName(easyrtcid));
		           }
		       });
	}
	else {
		easyrtc.hangup(conversations.getCurrentConversationId());
	}
}

controller.acceptor = function(id, stream) {
	if (controller.localVideo.enabled) return;
	
	controller.setCurrentConversation(id);
	
	controller.localVideo.stream = easyrtc.getLocalStream();
	controller.localVideo.enabled = true;
	
	conversations.get(id).stream = stream;
	conversations.get(id).video = true;
	
	var videoSelf = document.getElementById("videoSelf");
	var videoCaller = document.getElementById("videoCaller");
	easyrtc.setVideoObjectSrc(videoSelf, controller.localVideo.stream);
	easyrtc.setVideoObjectSrc(videoCaller, stream);
	
	GUI.toggleVideo(true);
	var currentdate = new Date(); 
	var datetime = "Call started: " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
	conversations.addMessageToConversation("", datetime);
	controller.updateGUI();
}

controller.disconnectListener = function(id) {
	if (!controller.localVideo.enabled) return;
	
	//controller.localVideo.stream.stop();
	controller.localVideo.stream = {};
	controller.localVideo.enabled = false;
	
	conversations.get(id).stream = {};
	conversations.get(id).video = false;
	
	GUI.toggleVideo(false);
	var currentdate = new Date(); 
	var datetime = "Call ended: " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
	conversations.addMessageToConversation("", datetime);
	controller.updateGUI();
	
}



var acceptor = function(input) {
	return input;
}

controller.acceptChecker = function(id, acceptor){
	if (!controller.videoConnected) acceptor(confirm("Accept call from " + easyrtc.idToName(id)));
	else acceptor(false);
}