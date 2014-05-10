var friendList = {
	list: {},
}

friendList.newFriend = function(id) {
	this.list[id] = {
		id: id,
		username: easyrtc.idToName(id),
		connection: {enabled: false},
		audiovideo: {
			enabled: false,
			audioMuted: false,
			videoMuted: false,
			stream: {}
		},
		data: {
			enabled: false,
		},
		online: true,
	}
}

friendList.get = function(id) {
	if (this.list[id]) return this.list[id];
}

friendList.updateFriends = function(friends) {
	for (var id in friends) {
		if (!this.list[id]) this.newFriend(id);
	}
}

friendList.updateOnlineFriends = function(friends) {
	for (var id in friends) {
		if (this.list[id]) this.list[id].online = true;
	}
}

