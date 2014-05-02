Basic chat using Easyrtc
======

List of bugs:
- Cannot hangup a single conversation. If there are multiple calls to one id, every call will terminate if you try to hang up one of them.
- Whenever a user is added to a group conversation, every call that user participates in will terminate.
