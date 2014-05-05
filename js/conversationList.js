var conversationList = {
	list: {},
	multiCounter: 0,
	currentId: ""
}

conversationList.newConversation = function(id, multi) {	
	if (this.list[id]) return;
	if (typeof(id) !== "string") return;
	
	this.list[id] = conversation.create(id, multi);
}

conversationList.newGroupConversation = function(conversationId) {
	var id;
	if (conversationId) id = conversationId;
	else id = controller.id + "_" +  this.multiCounter++;
	this.newConversation(id, true);
	this.list[id].visible = true;
	return this.list[id];
}

conversationList.groupConversationListener = function(id, participants) {
	if (!this.get(id)) {
		this.newGroupConversation(id);
	}
	for (var p in participants) {
		this.get(id).addParticipant(p);
	}
}

conversationList.get = function(id) {
	if (this.list[id]) return this.list[id];
}

conversationList.getAll = function() {
	var tempList = [];
	for (var conversation in this.list) {
		tempList.push(this.list[conversation]);
	}
	tempList.sort(function(a,b) {return b.mostRecentTime - a.mostRecentTime;});

	return tempList;
}

conversationList.getCurrent = function() {
	if (this.currentId) {
		return this.get(this.currentId);
	}
}

conversationList.getCurrentId = function() {
	return this.currentId;	
}

conversationList.setCurrent = function(id) {
	if (this.list[this.currentId]) this.list[this.currentId].active = false;
	

	if (id === "");
	else if (this.list[id]) {
		this.list[id].active = true;
		this.list[id].unseen = 0;
	}
	else {
		this.newConversation(id);
		this.list[id].active = true;
		this.list[id].unseen = 0;
	}
	this.currentId = id;

	
	if (this.list[id] && this.list[id].mostRecentTime === 0) {
		this.list[id].visible = true;
		this.list[id].mostRecentTime = (new Date()).getTime();
	}
}

conversationList.updateFriends = function(friends) {
	for (var id in friends) {
		if (!this.list[id]) this.newConversation(id);
	}
}

conversationList.updateOnlineFriends = function(friends) {
	for (var id in this.list) {
		if (!this.list[id].multi) this.list[id].online = false;
	}
	for (var id in friends) {
		if (this.list[id]) this.list[id].online = true;
	}
}

conversationList.addMessage = function(conversationId, senderId, message) {
	this.list[conversationId].addMessage(senderId, message);

	if (conversationId !== this.currentId) this.list[conversationId].unseen ++;

	this.list[conversationId].visible = true;
}

conversationList.closeConversation = function(conversationId) {
	this.list[conversationId].messages.length = 0;
	this.list[conversationId].unseen = 0;
	this.list[conversationId].visible = false;
	this.list[conversationId].mostRecentTime = 0;
}
