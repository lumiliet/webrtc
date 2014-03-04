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
		if (this.multi) {
			out += "Group conversation";
			if (this.participants.length) {
				out += " with: ";
				for (var i = 0; i < this.participants.length; i++) {
					out += this.participants[i];
					if (i !== (this.participants.length -1)) out += ", ";
				}
			}
		}
		else {
			out += this.username;
		}
		
		if (this.unseen) {
			out += " (" + this.unseen + ")";
		}
		return out;
	}
}

conversations.newGroupConversation = function() {
	var id = "multi_" + this.multiCounter++;
	this.newConversation(id, true);
}

conversations.addIdToGroup = function(id, groupid) {
	this.get(groupid).participants.push(id);
}

conversations.get = function(id) {
	if (this.list[id]) return this.list[id];
	else {
		console.log("conversations.get - " + id + " does not exist");
	}
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

conversations.addHTML = function(id, html) {
	if (!this.list[id]) this.newConversation(id);
	this.list[id].html += html;
	this.list[id].visible = true;
	if (!this.list[id].active)this.list[id].unseen++;
}

conversations.addMessageToConversation = function(id, message) {
	var messageLabel = document.createElement("div");
	messageLabel.className = "chatMessage";
	
	var senderSpan = document.createElement("span");
	senderSpan.className = "bold";
	
	if (id === this.currentConversationId) senderSpan.innerHTML += "Me: ";
	else if (id) senderSpan.innerHTML += easyrtc.idToName(id) + ": ";
	else id = this.currentConversationId;
	var messageText = document.createTextNode(message);
	messageLabel.appendChild(senderSpan);
	messageLabel.appendChild(messageText);

	this.addHTML(id, messageLabel.outerHTML);
}

conversations.updateOnlineFriends = function(friends) {
	for (var id in this.list) {
		this.list[id].online = false;
	}
	for (var id in friends) {
		if (this.list[id]) this.list[id].online = true;
	}
}
