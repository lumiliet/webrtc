var controller = {
	id: "",
}

controller.updateGUI = function() {
	GUI.updateFriendList();
	controller.updateChat();
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
		if (friendList.get(participants[i]).online) easyrtc.sendDataWS(participants[i], conversation.id, message);
	}
	conversation.addMessage(controller.id, message);
	controller.updateGUI();
}

controller.receiveMessage = function(id, msgType, message) {
	if (msgType === "message") {	
		conversation.addMessage(id, message);
		GUI.notification(friendList.get(id).username);
	}
	else if (msgType === "roomInvite") {
		if (conversation.isFree()) {
			easyrtc.joinRoom(message);
		}
	}
	controller.updateGUI();
}

controller.call = function(id) {
	console.log("hohoho");
	if (conversation.isFree()) easyrtc.joinRoom(conversation.newId());
	controller.inviteFriendToRoom(id, conversation.id);
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

controller.signalVideoWaiting= function(id, conversationId) {
	if (conversationId) easyrtc.sendDataWS(id, "waitForVideo", conversationId);
	else easyrtc.sendDataWS(id, "stopWaitingForVideo");
}

