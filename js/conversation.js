var conversation = {
}

conversation.addMessage = function(senderId, message) {
	this.messages.push({
		senderId: senderId,
		sender: (friendList.get(senderId) ? friendList.get(senderId).username : "Me"),
		message: message,
	});
}

conversation.addParticipant = function(id) {
	for (var i = 0; i < this.participants.length; i++) {
		if (this.participants[i] === id) return;
	}
	this.participants.push(id);
}

conversation.isParticipant = function(id) {
	for (var i = 0; i < this.participants.length; i++) {
		if (this.participants[i] === id) return true;
	}
	return false;
}

conversation.startVideoWaiting = function(groupConversationId) {
	console.log("Wating for group video");
	this.waitingForGroupVideo = {
		id: groupConversationId
	};
}

conversation.stopVideoWaiting = function() {
	console.log("Stopped waiting for group video");
	this.waitingForGroupVideo = null;
}

conversation.isFree = function() {
	if (Object.keys(easyrtc.getRoomsJoined()).length === 1) return true;
	return false;
}

conversation.reset = function() {
	this.messages = [];
	this.id = "";
	this.visible = false;
	this.idCounter = 0;
	this.participants = [];
}

conversation.generateId = function() {
	return controller.id + "_" + this.idCounter++;
}

conversation.groupConversationListener = function(id, participants) {
	if (Object.keys(participants).length === 0 && id === this.id) {
		this.reset();
		console.log("Leaving room: " + id);	
		easyrtc.leaveRoom(id);
		return;
	}

	for (var p in participants) this.addParticipant(p);
	if (this.id !== id) {
		videoCall.connect();
		this.id = id;
	}
}



