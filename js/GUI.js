var GUI = {
	videoVisible: false,
	documentTitle: "Simens Superchat",
	focus: true
};

GUI.setup = function() {
	
	var messageField = document.getElementById("sendMessageField");
	messageField.onkeyup = function(e) {
		if (e.keyCode === 13) {
			controller.sendMessage();
		}
	}
	
	messageField.focus();
	
	document.title = GUI.documentTitle;
	
	window.onblur = function() {
		GUI.focus = false;
	};
	window.onfocus = function() {
		GUI.focus = true;
		GUI.notification("", true);
	};
}

GUI.writeHTMLToChat = function(html) {
	var chatArea = document.getElementById("chatArea");
	chatArea.innerHTML += html;
	
	chatArea.scrollTop = chatArea.scrollHeight;
}

GUI.cleanChat = function() {
	var chatArea = document.getElementById("chatArea");
	chatArea.innerHTML = "";
}

GUI.getTextFromMessageField = function() {
	var messageField = document.getElementById("sendMessageField");
	return messageField.value;
}

GUI.cleanMessageField = function() {
	var messageField = document.getElementById("sendMessageField");
	messageField.value = "";
}

GUI.notification = function(name, reset) {
	if (reset) document.title = this.documentTitle;
	else if (!GUI.focus){
		document.title = "New message from " + name + " - " + this.documentTitle;	
	}
}

GUI.setChatLabel = function(text) {
	var chatLabel = document.getElementById("chatLabel");
	chatLabel.innerHTML = text;
}

GUI.updateConversationList = function(list) {
	var conversationList = document.getElementById("conversationList");
	
	while (conversationList.hasChildNodes()) {
		conversationList.removeChild(conversationList.lastChild);
	}
	
	for (var id in list) {
		if (!list[id].visible) continue;
		var conversation = document.createElement("div");
		conversation.className = "conversation " + (list[id].active ? "conversationActive" : "conversationPassive");
		conversation.innerHTML += list[id].toString();
		conversation.id = "conversation_" + id;

		conversation.onclick = function(id) {
			return function() {
				controller.setCurrentConversation(id);
			}
		}(id);
		
		conversationList.appendChild(conversation);
	}
}

GUI.updateFriendList = function(friends) {
	var friendList = document.getElementById("friendList");
	
	while (friendList.hasChildNodes()) {
		friendList.removeChild(friendList.lastChild);
	}

	for (var id in friends) {
		var friend = document.createElement("div");
		friend.className = "friend";
		var friendText = document.createElement("span");
		friendText.className = "friendText";
		friendText.innerHTML += easyrtc.idToName(id);
		friend.id = "friend_" + id;
		friend.appendChild(friendText);

		friend.onclick = function(id) {
			return function() {
				controller.setCurrentConversation(id);
			}
		}(id);
		
		friendList.appendChild(friend);
	}
}


GUI.toggleVideo = function(visible) {
	if (GUI.videoVisible === visible) return;
	var videoChat = document.getElementById("videoContainer");
	var chatArea = document.getElementById("chatArea");

	if (!GUI.videoVisible) {
		videoChat.className = "videoShown";
		chatArea.className = "smallChat";
		GUI.videoVisible = true;
	}
	else {
		videoChat.className = "videoHidden";
		chatArea.className = "largeChat";
		GUI.videoVisible = false;
	}
}