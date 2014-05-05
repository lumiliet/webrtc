var controller = {
	friendSelectMode: false,
	friendSelection: {},
	id: "",
}

controller.setCurrentConversation = function(id) {
	conversationList.setCurrent(id);
	controller.updateGUI();
}

controller.updateGUI = function() {
	GUI.cleanChat();

	if (controller.friendSelectMode) {
		GUI.setButtonText("newGroupConversationButton", " Done");
	}
	else {
		GUI.setButtonText("newGroupConversationButton", "<span class=\"glyphicon glyphicon-plus\"></span> New group conversation");

	}

	if (conversationList.getCurrentId()) {
		var messages = conversationList.getCurrent().messages;
		for (var x in messages) GUI.writeMessageToChat(messages[x]);
	}
	GUI.updateConversationList(conversationList.getAll());
	GUI.updateFriendList();

	var text = "";
	if (conversationList.getCurrent()) {	
		text += conversationList.getCurrent().toStringTitle();
	}
	else {
		text += "";
	}


	GUI.setChatLabel(text);	
	GUI.focusize();
}

controller.sendMessage = function() {
	var message = GUI.getTextFromMessageField();

	if (!message.length || !conversationList.getCurrentId() || !conversationList.getCurrent().online) return;

	GUI.cleanMessageField();


	if (conversationList.getCurrent().multi) {
		var participants = conversationList.getCurrent().participants
			for (var i in participants) {
				if (conversationList.get(participants[i]).online) easyrtc.sendDataWS(participants[i], conversationList.getCurrentId(), message);
			}
	}
	else {
		easyrtc.sendDataWS(conversationList.getCurrentId(), "message", message);
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
	else if (msgType === "waitForVideo") {
		conversationList.get(id).startVideoWaiting(message);	
	}
	else if (msgType === "stopWaitingForVideo") {
		conversationList.get(id).stopVideoWaiting();
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

controller.selectGroupMembersButtonListener = function() {
	if (controller.friendSelectMode) {

		if (Object.keys(controller.friendSelection).length !== 0) controller.createGroupConversation();
		controller.setFriendSelectMode(false);
	}

	else {
		controller.setFriendSelectMode(true);
	}
	controller.updateGUI();
}

controller.createGroupConversation = function() {
	var groupConversation = conversationList.newGroupConversation();
	easyrtc.joinRoom(groupConversation.id);	

	controller.setCurrentConversation(groupConversation.id);
	for (var friend in controller.friendSelection) {
		controller.inviteFriendToRoom(friend, groupConversation.id);
	}
}

controller.setFriendSelectMode = function(enable) {
	controller.friendSelectMode = enable;
	if (!enable) controller.friendSelection = {};
	console.log("Friend select mode " + (enable? "activated" : "deactivated"));
	controller.updateGUI();

}

controller.toggleFriendSelect = function(id) {
	if (!controller.friendSelectMode) return;
	if (controller.friendSelection[id]) delete controller.friendSelection[id];
	else controller.friendSelection[id] = {};

	console.log(controller.friendSelection);
}

controller.isFriendSelected = function(id) {
	if (controller.friendSelection[id]) return true;
	return false;
}

controller.inviteFriendToRoom = function(id, room) {
	easyrtc.sendDataWS(id, "roomInvite", room);
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
}

controller.closeConversation = function(conversationId) {
	conversationList.closeConversation(conversationId);
	if (conversationList.getCurrentId() === conversationId) conversationList.setCurrent("");
	controller.updateGUI();
}

controller.signalVideoWaiting= function(id, conversationId) {
	if (conversationId) easyrtc.sendDataWS(id, "waitForVideo", conversationId);
	else easyrtc.sendDataWS(id, "stopWaitingForVideo");
}

controller.call = function(type) {
	if (type === "video") {
		videoCall.sendVideo();
	}
}


