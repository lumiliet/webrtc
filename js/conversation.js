var conversation = {
	idCounter: 0
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

conversation.isFree = function() {
	if (conversation.id === "") return true;
	return false;
}

conversation.reset = function() {
	this.messages = [];
	this.id = "";
	this.visible = false;
	this.participants = [];
}

conversation.generateId = function() {
	return controller.myId + "_" + this.idCounter++;
}

conversation.groupConversationListener = function(id, participants) {
	if (Object.keys(participants).length === 0 && id === this.id) {
		this.reset();
		easyrtc.leaveRoom(id);
		return;
	}

	for (var p in participants) this.addParticipant(p);
	if (this.id !== id) {
		controller.connect();
		this.id = id;
	}
}



