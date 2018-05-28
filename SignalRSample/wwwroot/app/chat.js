$(document).ready(function () {
    var connection = new signalR.HubConnection('/hub/chat');
    var _messages = [];
    var _registerationInfo;
    var _chatWrapperId = '#chat-wrapper';
    var _txtUserNameId = '#txtUserName';
    var _btnUserNameOkId = '#btnUserNameOk';
    var _txtMsgId = '#txtMsg';
    var _sendButtonId = '#btnSend';
    var _msgListId = '#msg-list';
    var _msgTemplateId = '#msgTemplate';
    var _template = $(_msgTemplateId).html();
    Mustache.parse(_template); // optional, speeds up future uses
    var HUB_METHOD = {
        SEND: 'send',
        REGISTER: 'register',
        REGISTER_SUCCESS: 'registerSuccess'
    };
    /**
     * HUB Handler
     */
    connection.on(HUB_METHOD.REGISTER_SUCCESS, function (data) {
        console.log('Registered: success');
        console.log(data);
        _registerationInfo = data;
        $(_txtUserNameId).prop('disabled', true);
        $(_chatWrapperId).css('display', 'block');
        $(_btnUserNameOkId).css('display', 'none');
        $(_txtMsgId).focus();
    });
    connection.on(HUB_METHOD.REGISTER, function (data) {
        console.log('Join chat: data.name');
        if (_registerationInfo && data.id !== _registerationInfo.id) {
            pushMessage({
                'message': data.name + " have joined our chat!"
            }, true);
        }
    });
    connection.on(HUB_METHOD.SEND, function (data) {
        console.log('Seceived: send');
        var msgInfo = {
            'message': data.message,
            'name': data.name,
            'userId': data.userId
        };
        console.log(msgInfo);
        pushMessage(msgInfo);
    });
    connection.start().then(function () {
        console.log('Started!');
        $(_sendButtonId).prop('disabled', false);
    }).catch(function () {
        alert('Error while establishing connection');
    });
    function registerChat(userName) {
        return connection.invoke(HUB_METHOD.REGISTER, { 'name': userName });
    }
    /**
     *  EVENT Hanler
     */
    $(_sendButtonId).on('click', function (e) {
        var msg = $(_txtMsgId).val();
        if (msg && msg.length > 0) {
            sendMessage(msg);
        }
    });
    $(_btnUserNameOkId).on('click', function (e) {
        var userName = getUserName();
        if (userName && userName.length > 0) {
            registerChat(userName);
        }
    });
    $(_txtMsgId).keyup(function (event) {
        if (event.keyCode === 13) {
            $(_sendButtonId).trigger('click');
        }
    });
    $(_txtUserNameId).keyup(function (event) {
        if (event.keyCode === 13) {
            $(_btnUserNameOkId).trigger('click');
        }
    });
    function renderMessages() {
        var rendered = Mustache.render(_template, _messages);
        $(_msgListId).html(rendered);
    }
    function sendMessage(msg) {
        connection.invoke(HUB_METHOD.SEND, {
            'message': msg,
            'name': _registerationInfo.name,
            'userId': _registerationInfo.id,
        }).then(function () {
            clearMessageInput();
            console.log('Send: successed!');
        });
    }
    function clearMessageInput() {
        $(_txtMsgId).val('');
    }
    function getUserName() {
        return $(_txtUserNameId).val();
    }
    function pushMessage(msgObject, isSystem) {
        if (isSystem === void 0) { isSystem = false; }
        msgObject.isSystem = isSystem;
        if (msgObject.userId) {
            msgObject.isMine = msgObject.userId === _registerationInfo.id;
            msgObject.isYour = !msgObject.isMine;
        }
        console.log('pushNewMsg:');
        console.log(msgObject);
        _messages.push(msgObject);
        renderMessages();
    }
});
//# sourceMappingURL=chat.js.map