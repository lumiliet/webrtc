var controller = {}

controller.setCurrentConversation = function(id) {
	conversations.setCurrentConversation(id);
	controller.updateGUI();
}

controller.updateGUI = function() {
	GUI.cleanChat();
	
	if (conversations.getCurrentConversationId()) {
		GUI.writeHTMLToChat(conversations.getCurrentConversation().html);
	}
	GUI.updateConversationList(conversations.getAll());
	
	var text = "";
	if (conversations.getCurrentConversation()) {	
		if (conversations.getCurrentConversation().online) text += "You are talking to " + conversations.getCurrentConversation().username;
		else text += conversations.getCurrentConversation().username + " is offline";
	}
	else {
		text += "";
	}
	GUI.setChatLabel(text);
}

controller.receiveMessage = function(id, msgType, message) {	
	conversations.addMessageToConversation(id, message);
	if (id !== conversations.getCurrentConversationId()) GUI.notification(easyrtc.idToName(id));
	controller.updateGUI();
}


controller.sendMessage = function() {
	var message = GUI.getTextFromMessageField();
	
	if (!message.length || !conversations.getCurrentConversationId() || !conversations.getCurrentConversation().online) return;
	
	GUI.cleanMessageField();
	
	easyrtc.sendData(conversations.getCurrentConversationId(), "msgType", message);
		
	conversations.addMessageToConversation(conversations.getCurrentConversationId(), message);
	controller.updateGUI();
}

controller.roomListener = function(roomName, friends) {
	GUI.updateFriendList(friends);
	conversations.updateOnlineFriends(friends);
	controller.updateGUI();
}