var GUI = {
	videoVisible: false,
	documentTitle: "Webrtc Chat",
	focus: true
};

GUI.setup = function() {
	
	var messageField = document.getElementById("sendMessageField");
	messageField.onkeyup = function(e) {
		if (e.keyCode === 13) {
			controller.sendMessage();
		}
	}
	
	var midLabel = document.getElementById("midLabel");
	midLabel.onclick = function(e) {
		controller.call();
	}
	
    var dropZone = document.getElementById('chatArea');
    dropZone.addEventListener('dragover', fileTransfer.handleDragOver);
    dropZone.addEventListener('drop', fileTransfer.handleDrop);
	
	document.onkeyup = controller.documentKeyListener;
	
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

GUI.setButtonDisabled = function(id, disabled) {
	var button = document.getElementById(id);
	button.disabled = disabled;
}

GUI.setButtonText = function(id, text) {
	var button = document.getElementById(id);
	button.innerHTML = text;
}

GUI.writeMessageToChat = function(message) {
	var chatArea = document.getElementById("chatArea");
	var html = GUI.generateMessageHTML(message);
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
	var chatLabel = document.getElementById("midLabel");
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
		conversation.id = "conversation_" + id;

		var conversationText = document.createElement("span");
		conversationText.className = "conversationText";
		conversationText.innerHTML += list[id].toString();
		conversation.appendChild(conversationText);
		conversationText.onclick = function(id) {
			return function() {
				controller.setCurrentConversation(id);
			}
		}(id);
		
			
		var glyphContainer = document.createElement("span");
		glyphContainer.className = "closeConversationGlyph";

		var closeGlyph = document.createElement("span");
		closeGlyph.className = " glyphicon glyphicon-remove";

		conversation.onmouseover = function(closeGlyph) {
			return function() {
				closeGlyph.style.visibility = "visible";
			}
		}(closeGlyph);

		conversation.onmouseout = function(closeGlyph) {
			return function() {
				closeGlyph.style.visibility = "hidden";
			}
		}(closeGlyph);

		closeGlyph.onclick = function(id) {
			return function() {
				controller.closeConversation(id);
			}
		}(id);

	

		glyphContainer.appendChild(closeGlyph);

		conversation.appendChild(glyphContainer);
		
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
				controller.friendClickListener(id);
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

GUI.generateMessageHTML = function(message) {
	var messageLabel = document.createElement("div");
	messageLabel.className = "chatMessage";
	
	var senderSpan = document.createElement("span");
	senderSpan.className = "bold";
	senderSpan.innerHTML += message.sender + ": ";
	
	var messageText = document.createTextNode(message.message);
	messageLabel.appendChild(senderSpan);
	messageLabel.appendChild(messageText);

	return messageLabel.outerHTML;
}

