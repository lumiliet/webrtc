var conversation = {};

conversation.create = function(id, isGroupConversation) {
	return {
		messages: [],
		id: id,
		username: easyrtc.idToName(id),
		active: false,
		unseen: 0,
		audio: false,
		sendingVideo: false,
		waitingForGroupVideo: null,
		data: false,
		visible: false,
		online: true,
		mostRecentTime: 0,
		callCounter: {
			video: 0,
			file: 0,
		},


		cameraWindow: GUI.createCameraWindow(),	

		isGroupConversation: (isGroupConversation == true),
		participants: [],

		participantIn: [],

		addMessage: function(senderId, message) {
			this.messages.push({
				senderId: senderId,
				sender: (conversationList.get(senderId) ? conversationList.get(senderId).username : "Me"),
				message: message,
				time: function() {
					var date = new Date();
					conversationList.list[id].mostRecentTime = date.getTime();
					return date.getTime();
				}()
			});
		},

		addParticipant: function(id) {
			for (var i = 0; i < this.participants.length; i++) {
				if (this.participants[i] === id) return;
			}
			this.participants.push(id);
			conversationList.get(id).addParticipantIn(this.id);
		},

		isParticipant: function(id) {
			for (var i = 0; i < this.participants.length; i++) {
				if (this.participants[i] === id) return true;
			}
			return false;
		},

		addParticipantIn: function(groupConversationId) {
			this.participantIn.push(groupConversationId);
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

		toString: function() {
			var out = "";
			if (this.unseen) {
				out += "(" + this.unseen + ") ";
			}

			if (this.isGroupConversation) {
				if (this.participants.length) {
					out += "Group: ";
					for (var i = 0; i < this.participants.length; i++) {
						out += conversationList.get(this.participants[i]).username;
						if (i !== (this.participants.length -1)) out += ", ";
					}
				}
				else out += "Group conversation";
			}
			else {
				out += this.username;
			}


			return out;
		},

		toStringTitle: function() {
			var out = "";
			if (this.isGroupConversation) {
				if (this.participants.length) {
					out += "You are talking to ";
					for (var i = 0; i < this.participants.length; i++) {
						out += conversationList.get(this.participants[i]).username;
						if (!conversationList.get(this.participants[i]).online) out += " (offline)";
						if (i === (this.participants.length - 2)) out += " and ";
						else if (i !== (this.participants.length -1)) out += ", ";
					}
				}
				else {
					out += "You are alone";
				}
			}
			else {
				if (!this.online) out += this.username + " is offline";
				else out += "You are talking to " + this.username;
			}
			return out;
		}

	}
}
