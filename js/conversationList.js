var conversationList = {
	list: {},
	multiCounter: 0,
	currentId: ""
}

conversationList.new = function(id, multi) {	
	if (this.list[id]) return;
	if (typeof(id) !== "string") return;
	
	this.list[id] = {
		messages: [],
		id: id,
		username: easyrtc.idToName(id),
		active: false,
		unseen: 0,
		audio: false,
		video: false,
		data: false,
		stream: {},
		visible: false,
		online: true,
		mostRecentTime: 0,


		multi: (multi == true),
		participants: []
	};

	this.list[id].addMessage = function(senderId, message) {
		this.messages.push(
			{
				senderId: senderId,
				sender: (conversationList.get(senderId) ? conversationList.get(senderId).username : "Me"),
				message: message,
				time: function() {
					var date = new Date();
					conversationList.list[id].mostRecentTime = date.getTime();
					return date.getTime();
				}()
			}
		);
		console.log((new Date()).getTime());
	}

	this.list[id].addParticipant = function(id) {
		for (var i = 0; i < this.participants.length; i++) {
			if (this.participants[i] === id) return;
		}
		this.participants.push(id);
	}
	
	this.list[id].isParticipant = function(id) {
		for (var i = 0; i < this.participants.length; i++) {
			if (this.participants[i] === id) return true;
		}
		return false;
	}


	
	this.list[id].toString = function() {
		var out = "";
		if (this.unseen) {
			out += "(" + this.unseen + ") ";
		}
		
		if (this.multi) {
			if (this.participants.length) {
				out += "Group: ";
				for (var i = 0; i < this.participants.length; i++) {
					out += conversationList.get(this.participants[i]).username;
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
					out += conversationList.get(this.participants[i]).username;
					if (!conversationList.get(this.participants[i]).online) out += " (offline)";
					if (i === (this.participants.length - 2)) out += " and ";
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
	

}

conversationList.newGroupConversation = function(conversationId) {
	var id;
	if (conversationId) id = conversationId;
	else id = controller.id + "_" +  this.multiCounter++;
	this.new(id, true);
	this.list[id].visible = true;
	return this.list[id];
}

conversationList.conversationListener = function(id, participants) {
	if (!this.get(id)) {
		this.newGroupConversation(id);
	}
	for (var p in participants) {
		this.get(id).addParticipant(p);
	}
}


conversationList.addIdToGroup = function(id, groupid) {
	this.get(groupid).participants.push(id);
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
		this.new(id);
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
		if (!this.list[id]) this.new(id);
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
}
