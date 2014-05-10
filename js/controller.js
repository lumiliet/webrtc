var controller = {
	myId: "",
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
		if (friendList.get(participants[i]).online) easyrtc.sendDataP2P(participants[i], "message" , message);
	}
	conversation.addMessage(controller.myId, message);
	controller.updateGUI();
}

controller.receiveMessage = function(id, msgType, message) {
	if (controller.busy) return;
	if (msgType === "message") {
		conversation.addMessage(id, message);
		GUI.notification(friendList.get(id).username);
	}
	else if (msgType === "roomInvite") {
		if (conversation.isFree()) {
			console.log("received invite to join room: " + message);
			easyrtc.joinRoom(message);
			controller.sendRoomInvite(id, message);
		}
	}
	else controller.receiveSignal(id, msgType);
	controller.updateGUI();
}

controller.signalAll = function(signal) {
	var participants = conversation.participants;
	for (var p in participants) {
		controller.sendSignal(participants[p], signal);
	}
}

controller.sendSignal = function(id, signal) {
	if (!friendList.get(id).data.enabled) return;
	console.log("Sending " + signal + " to " + friendList.get(id).username);
	easyrtc.sendDataP2P(id, signal, "");
}

controller.receiveSignal = function(id, signal) {
	console.log("Received " + signal + " from " + friendList.get(id).username);
	if (signal === "disableVideo") {
		videoCall.enableVideo(id, false);	
	}
	else if (signal === "enableVideo") {
		videoCall.enableVideo(id, true);	
	}
	else if (signal === "disableAudio") {
		videoCall.enableAudio(id, false);	
	}
	else if (signal === "enableAudio") {
		videoCall.enableAudio(id, true);	
	}
}

controller.initiateConversation = function(id) {
	var conversationId = conversation.id;
	if (!conversationId) {
		conversationId = conversation.generateId();
	}
	controller.sendRoomInvite(id, conversationId);
}

controller.sendRoomInvite = function(id, room) {
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
	easyrtc.leaveRoom(conversation.id);
	conversation.reset();
	controller.updateGUI();
}

controller.connect = function() {
	var participants = conversation.participants;

	for (var p in participants) {
		controller.call(participants[p], conversation.id);
	}
}

controller.disconnect = function(conversationId) {
	if (!conversation.isFree()) {
		easyrtc.hangupAll();	
		controller.reset();
	}
}

controller.call = function(id, conversationId) {
	console.log("Call to "  + friendList.get(id).username);
	if (!friendList.get(id).online) {
		console.log("Call failed, friend no longer online");
		return;
	}
	if (friendList.get(id).connection.enabled) {
		console.log("Call to " + id + " already established");
		return;
	}
	easyrtc.call(id,
			function(otherCaller, mediaType) {
				console.log("Call succesful - " + otherCaller + " - " + mediaType);
			},
			function(errorCode, errMessage) {
				console.log("Call failed - " + errorCode + " - " + errMessage);
			},
			function(wasAccepted, easyrtcid) {
				if(wasAccepted){
					console.log("call accepted by " + easyrtc.idToName(easyrtcid));
					friendList.get(easyrtcid).connection.enabled = true;
				}
				else{
					console.log("call rejected" + easyrtc.idToName(easyrtcid));
				}

			}
	);
}

