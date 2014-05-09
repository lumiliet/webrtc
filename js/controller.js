var controller = {
	id: "",
	busy: true,
}

controller.updateGUI = function() {
	GUI.updateFriendList();
	controller.updateChat();
	GUI.updateVideoElements();

	if (conversation.isFree()) GUI.setExitButtonVisible(false);
	else GUI.setExitButtonVisible(true);

}

controller.updateChat = function() {
	GUI.cleanChat();

	var messages = conversation.messages;
	for (var x in messages) GUI.writeMessageToChat(messages[x]);
	
	GUI.updateFriendList();

	GUI.focusize();
}

controller.sendMessage = function() {
	var message = GUI.getTextFromMessageField();

	if (!message.length || conversation.isFree()) return;

	GUI.cleanMessageField();
	var participants = conversation.participants
	for (var i in participants) {
		if (friendList.get(participants[i]).online) easyrtc.sendDataWS(participants[i], "message" , message);
	}
	conversation.addMessage(controller.id, message);
	controller.updateGUI();
}

controller.receiveMessage = function(id, msgType, message) {
	if (controller.busy) return;
	if (msgType === "message") {
		console.log(message);
		conversation.addMessage(id, message);
		GUI.notification(friendList.get(id).username);
	}
	else if (msgType === "roomInvite") {
		if (conversation.isFree()) {
			console.log("received invite to join room: " + message);
			easyrtc.joinRoom(message);
			controller.inviteFriendToRoom(id, message);
		}
	}
	controller.updateGUI();
}

controller.call = function(id) {
	var conversationId = conversation.id;
	console.log("id now : " + conversationId);
	if (!conversationId) {
		conversationId = conversation.generateId();
	}
	console.log("id now : " + conversationId);
	controller.inviteFriendToRoom(id, conversationId);
}

controller.inviteFriendToRoom = function(id, room) {
	easyrtc.sendDataWS(id, "roomInvite", room);
}

controller.roomListener = function(roomName, friends) {
	if (!(roomName && friends)) return;
	if (roomName === "default") {
		GUI.updateFriendList(friends);
		friendList.updateOnlineFriends(friends);
		controller.updateGUI();
	}
	else {
		conversation.groupConversationListener(roomName, friends);
	}
	friendList.updateFriends(friends);
	controller.updateGUI();
}



controller.reset = function() {
	console.log(conversation.id);
	easyrtc.leaveRoom(conversation.id);
	conversation.reset();
	controller.updateGUI();
}
