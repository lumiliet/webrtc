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


