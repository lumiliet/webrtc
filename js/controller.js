var controller = {
	friendSelectMode: false,
	id: ""
}

controller.setCurrentConversation = function(id) {
	conversations.setCurrentConversation(id);
	controller.updateGUI();
}

controller.updateGUI = function() {
	GUI.cleanChat();
	
	if (conversations.getCurrentConversationId()) {
		GUI.writeHTMLToChat(conversations.getCurrentConversation().html);
		if (conversations.getCurrentConversation().multi) GUI.setButtonDisabled("friendSelectMode", false);
		else GUI.setButtonDisabled("friendSelectMode", true);
	}
	GUI.updateConversationList(conversations.getAll());
	var text = "";
	if (conversations.getCurrentConversation()) {	
		text += conversations.getCurrentConversation().toStringTitle();
	}
	else {
		text += "";
	}
	GUI.setChatLabel(text);
	
}

controller.receiveMessage = function(id, msgType, message) {
	if (msgType === "message") {	
		controller.addMessageToConversation(id, message);
		GUI.notification(conversations.get(id).username);
	}
	else if (msgType === "roomInvite") {
		if (!conversations.get(message)) easyrtc.joinRoom(message);
	}
	else {
		if (conversations.get(msgType)) {
			GUI.notification(conversations.get(id).username);
			controller.addMessageToConversation(id, message, msgType)
		}
	}
	controller.updateGUI();
}

controller.addMessageToConversation = function(sender, message, conversation) {
	var html = conversations.generateMessageHTML(sender, message);
	conversations.addHTML((conversation ? conversation : sender), html);
}

controller.sendMessage = function() {
	var message = GUI.getTextFromMessageField();
	
	if (!message.length || !conversations.getCurrentConversationId() || !conversations.getCurrentConversation().online) return;
	
	GUI.cleanMessageField();
	
	if (conversations.getCurrentConversation().multi) {
		var participants = conversations.getCurrentConversation().participants
		for (var i in participants) {
			easyrtc.sendData(participants[i], conversations.getCurrentConversationId(), message);
		}
	}
	else {
		easyrtc.sendData(conversations.getCurrentConversationId(), "message", message);
	}
	controller.addMessageToConversation(conversations.getCurrentConversationId(), message);
	controller.updateGUI();
}


controller.roomListener = function(roomName, friends) {
	if (roomName === "default") {
		GUI.updateFriendList(friends);
		conversations.updateOnlineFriends(friends);
		controller.updateGUI();
	}
	else {
		conversations.conversationListener(roomName, friends);
	}
	conversations.updateFriends(friends);
	controller.updateGUI();
}

controller.newGroupConversation = function() {
	var groupConversation = conversations.newGroupConversation();
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
		var current = conversations.getCurrentConversation();
		if (current && current.multi) {
			controller.inviteFriendToRoom(id, current.id);
		}
	}
	else controller.setCurrentConversation(id);
	controller.updateGUI();
}


controller.friendSelectModeListener = function() {
	var current = conversations.getCurrentConversation();
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


