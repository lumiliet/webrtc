var conversation = {
		reset();	

		addMessage: function(senderId, message) {
			this.messages.push({
				senderId: senderId,
				sender: (friendList.get(senderId) ? friendList.get(senderId).username : "Me"),
				message: message,
			});
		},

		addParticipant: function(id) {
			for (var i = 0; i < this.participants.length; i++) {
				if (this.participants[i] === id) return;
			}
			this.participants.push(id);
			friendList.get(id).addParticipantIn(this.id);
		},

		isParticipant: function(id) {
			for (var i = 0; i < this.participants.length; i++) {
				if (this.participants[i] === id) return true;
			}
			return false;
		},

		startVideoWaiting: function(groupConversationId) {
			console.log("Wating for group video");
			this.waitingForGroupVideo = {
				id: groupConversationId
			};
		},

		stopVideoWaiting: function() {
			console.log("Stopped waiting for group video");
			this.waitingForGroupVideo = null;
		},

	


	}
}


conversation.reset = function() {
	console.log("It's happening");
		this.messages: [],
		this.id: id,
		this.active: false,
		this.unseen: 0,
		this.waitingForGroupVideo: null,
		this.visible: false,
		this.idCounter: 0,
		this.mostRecentTime: 0,
		this.callCounter: {
			audiovideo: 0,
			file: 0,
		},

		this.participants: [],
}


conversation.newGroupConversation = function(conversationId) {
	var id;
	id = controller.id + "_" +  this.idCounter++;
	this.newConversation(id, true);
	return this.list[id];
}

conversation.groupConversationListener = function(id, participants) {
	if (!this.get(id)) {
		this.newGroupConversation(id);
	}
	this.get(id).participants.length = 0;
	for (var p in participants) {
		this.get(id).addParticipant(p);
	}
}

conversation.addMessage = function(conversationId, senderId, message) {
	this.list[conversationId].addMessage(senderId, message);

	if (conversationId !== this.currentId) this.list[conversationId].unseen ++;

	this.list[conversationId].visible = true;
}

conversation.closeConversation = function(conversationId) {
	this.list[conversationId].messages.length = 0;
	this.list[conversationId].unseen = 0;
	this.list[conversationId].visible = false;
	this.list[conversationId].mostRecentTime = 0;
}

