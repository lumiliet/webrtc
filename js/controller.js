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
		var messages = conversationList.getCurrent().messages;
		for (var x in messages) GUI.writeMessageToChat(messages[x]);
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
	controller.addMessageToConversation(controller.id, message, conversationList.getCurrentId());
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

controller.addMessageToConversation = function(senderId, message, conversationId) {
	conversationList.addMessage((conversationId ? conversationId : senderId), senderId, message);
}

controller.newGroupConversation = function() {
	var groupConversation = conversationList.newGroupConversation();
	easyrtc.joinRoom(groupConversation.id);	
	controller.updateGUI();
}

controller.setFriendSelectMode = function(enable) {
	controller.friendSelectMode = enable;
	console.log("Friend select mode " + (enable? "activated" : "deactivated"));
	controller.updateGUI();
	
}

controller.inviteFriendToRoom = function(id, room) {
	easyrtc.sendData(id, "roomInvite", room);
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

controller.closeConversation = function(conversationId) {
	conversationList.closeConversation(conversationId);
	conversationList.setCurrent("");
	controller.updateGUI();
}
