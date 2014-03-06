var controller = {
	friendSelectMode: false,
	id: ""
}

controller.setCurrentConversation = function(id) {
	conversationList.setCurrent(id);
	controller.updateGUI();
}

controller.updateGUI = function() {
	GUI.cleanChat();
	
	if (conversationList.getCurrentId()) {
		GUI.writeHTMLToChat(conversationList.getCurrent().html);
		if (conversationList.getCurrent().multi) GUI.setButtonDisabled("friendSelectMode", false);
		else GUI.setButtonDisabled("friendSelectMode", true);
	}
	GUI.updateConversationList(conversationList.getAll());
	var text = "";
	if (conversationList.getCurrent()) {	
		text += conversationList.getCurrent().toStringTitle();
	}
	else {
		text += "";
	}
	GUI.setChatLabel(text);	
}

controller.sendMessage = function() {
	var message = GUI.getTextFromMessageField();
	
	if (!message.length || !conversationList.getCurrentId() || !conversationList.getCurrent().online) return;
	
	GUI.cleanMessageField();
	
	
	if (conversationList.getCurrent().multi) {
		var participants = conversationList.getCurrent().participants
		for (var i in participants) {
			easyrtc.sendData(participants[i], conversationList.getCurrentId(), message);
		}
	}
	else {
		easyrtc.sendData(conversationList.getCurrentId(), "message", message);
	}
	controller.addMessageToConversation(conversationList.getCurrentId(), message);
	controller.updateGUI();
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

controller.newGroupConversation = function() {
	var groupConversation = conversationList.newGroupConversation();
	easyrtc.joinRoom(groupConversation.id);	
	controller.updateGUI();
}

controller.setFriendSelectMode = function(enable) {
	controller.friendSelectMode = enable;
	console.log("Friend select mode " + (enable? "activated" : "deactivated"));
	if (!enable) GUI.setButtonText("friendSelectMode", "Add friends to the conversation");
	else GUI.setButtonText("friendSelectMode", "Stop adding friends");
	controller.updateGUI();
	
}

controller.inviteFriendToRoom = function(id, room) {
	easyrtc.sendData(id, "roomInvite", room);
}

controller.call = function() {
	if (!conversationList.getCurrentId()) return;
	
	if (!conversationList.getCurrent().video) {		
		easyrtc.call(conversationList.getCurrentId(),
			function(otherCaller, mediaType) {
				console.log("Call succesful - " + otherCaller + " - " + mediaType);
			},
			function(errorCode, errMessage) {
				console.log("Call failed - " + errorCode + " - " + errMessage);
			},
			function(wasAccepted, easyrtcid){
				if( wasAccepted ){
					console.log("call accepted by " + easyrtc.idToName(easyrtcid));
				}
				else{
				  	console.log("call rejected" + easyrtc.idToName(easyrtcid));
				}
			}
		);
	}
	else {
		easyrtc.hangup(conversationList.getCurrentId());
	}
}



