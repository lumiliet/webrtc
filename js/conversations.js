var conversations = {
	list: {},
	multiCounter: 0,
	currentConversationId: ""
}

conversations.newConversation = function(id, multi) {	
	if (this.list[id]) return;
	if (typeof(id) !== "string") return;
	
	this.list[id] = {
		html: "",
		id: id,
		username: easyrtc.idToName(id),
		active: false,
		unseen: 0,
		audio: false,
		video: false,
		stream: {},
		visible: false,
		online: true,
		
		multi: (multi == true),
		participants: []
	};
	
	this.list[id].toString = function() {
		var out = "";
		if (this.unseen) {
			out += "(" + this.unseen + ") ";
		}
		
		if (this.multi) {
			if (this.participants.length) {
				out += "Group: ";
				for (var i = 0; i < this.participants.length; i++) {
					out += conversations.get(this.participants[i]).username;
					if (i !== (this.participants.length -1)) out += ", ";
				}
			}
			else out += "New group conversation";
		}
		else {
			out += this.username;
		}
		
		
		return out;
	}
	
	this.list[id].toStringTitle = function() {
		var out = "";
		if (this.multi) {
			if (this.participants.length) {
				out += "You are talking to ";
				for (var i = 0; i < this.participants.length; i++) {
					out += conversations.get(this.participants[i]).username;
					if (!conversations.get(this.participants[i]).online) out += " (offline)";
					if (i !== (this.participants.length -1)) out += ", ";
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
	
	this.list[id].addParticipant = function(id) {
		for (var i = 0; i < this.participants.length; i++) {
			if (this.participants[i] === id) return;
		}
		this.participants.push(id);
	}
}

conversations.newGroupConversation = function(conversationId) {
	var id;
	if (conversationId) id = conversationId;
	else id = controller.id + "_" +  this.multiCounter++;
	this.newConversation(id, true);
	this.list[id].visible = true;
	return this.list[id];
}

conversations.conversationListener = function(id, participants) {
	if (!this.get(id)) {
		this.newGroupConversation(id);
	}
	for (var p in participants) {
		this.get(id).addParticipant(p);
	}
}


conversations.addIdToGroup = function(id, groupid) {
	this.get(groupid).participants.push(id);
}

conversations.get = function(id) {
	if (this.list[id]) return this.list[id];
}

conversations.getAll = function() {
	return this.list;
}

conversations.getCurrentConversation = function() {
	if (this.currentConversationId) {
		return this.get(this.currentConversationId);
	}
}

conversations.getCurrentConversationId = function() {
	return this.currentConversationId;	
}

conversations.setCurrentConversation = function(id) {
	if (this.list[this.currentConversationId]) this.list[this.currentConversationId].active = false;
	if (this.list[id]) {
		this.list[id].active = true;
	}
	else {
		this.newConversation(id);
		this.list[id].active = true;
	}
	this.currentConversationId = id;
	this.list[id].unseen = 0;
}

conversations.updateFriends = function(friends) {
	for (var id in friends) {
		if (!this.list[id]) this.newConversation(id);
	}
}

conversations.addHTML = function(id, html) {
	this.list[id].html += html;
	this.list[id].visible = true;
	if (!this.list[id].active) this.list[id].unseen++;
}

conversations.generateMessageHTML = function(id, message) {
	var messageLabel = document.createElement("div");
	messageLabel.className = "chatMessage";
	
	var senderSpan = document.createElement("span");
	senderSpan.className = "bold";
	
	if (id === this.currentConversationId) senderSpan.innerHTML += "Me: ";
	else if (id) senderSpan.innerHTML += this.get(id).username + ": ";
	//else id = this.currentConversationId;
	
	var messageText = document.createTextNode(message);
	messageLabel.appendChild(senderSpan);
	messageLabel.appendChild(messageText);

	return messageLabel.outerHTML;
}


conversations.updateOnlineFriends = function(friends) {
	for (var id in this.list) {
		if (!this.list[id].multi) this.list[id].online = false;
	}
	for (var id in friends) {
		if (this.list[id]) this.list[id].online = true;
	}
}
