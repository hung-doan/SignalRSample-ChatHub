declare var signalR: any;
declare var $: any;
declare var Mustache: any;

$(document).ready(function () {
    let connection = new signalR.HubConnection('/hub/chat');
    let _messages = [];
    let _registerationInfo;

    let _chatWrapperId = '#chat-wrapper';
    let _txtUserNameId = '#txtUserName';
    let _btnUserNameOkId = '#btnUserNameOk';
    let _txtMsgId = '#txtMsg';
    let _sendButtonId = '#btnSend';
    let _msgListId = '#msg-list';
    let _msgTemplateId = '#msgTemplate';

    let _template = $(_msgTemplateId).html();
    Mustache.parse(_template);   // optional, speeds up future uses

    const HUB_METHOD = {
        SEND: 'send',
        REGISTER: 'register',
        REGISTER_SUCCESS: 'registerSuccess'
    };

    /**
     * HUB Handler
     */
    connection.on(HUB_METHOD.REGISTER_SUCCESS, (data) => {
        console.log('Registered: success');
        console.log(data);
        _registerationInfo = data;

        $(_txtUserNameId).prop('disabled', true);
        $(_chatWrapperId).css('display', 'block');
        $(_btnUserNameOkId).css('display', 'none');

        $(_txtMsgId).focus();


    });
    connection.on(HUB_METHOD.REGISTER, (data) => {
        console.log('Join chat: data.name');
        if (_registerationInfo && data.id !== _registerationInfo.id) {
            pushMessage({
                'message': `${data.name} have joined our chat!`
            }, true)
        }
    });

    connection.on(HUB_METHOD.SEND, data => {
        console.log('Seceived: send');

        let msgInfo = {
            'message': data.message,
            'name': data.name,
            'userId': data.userId
        };
        console.log(msgInfo);
        pushMessage(msgInfo);

    });

    connection.start().then(() => {
        console.log('Started!');
        $(_sendButtonId).prop('disabled', false);

    }).catch(() => {

        alert('Error while establishing connection');

    });

    function registerChat(userName: String) {
        return connection.invoke(HUB_METHOD.REGISTER, { 'name': userName });
    }


    /**
     *  EVENT Hanler
     */


    $(_sendButtonId).on('click', (e) => {
        let msg = $(_txtMsgId).val();
        if (msg && msg.length > 0) {
            sendMessage(msg);
        }
    });

    $(_btnUserNameOkId).on('click', (e) => {
        let userName = getUserName();

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
        let rendered = Mustache.render(_template, _messages);

        $(_msgListId).html(rendered);
    }

    function sendMessage(msg: String) {
        connection.invoke(HUB_METHOD.SEND, {
            'message': msg,
            'name': _registerationInfo.name,
            'userId': _registerationInfo.id,
        }).then(() => {

            clearMessageInput();
            console.log('Send: successed!');
        });
    }

    function clearMessageInput() {
        $(_txtMsgId).val('');
    }

    function getUserName(): String {
        return $(_txtUserNameId).val();
    }

    function pushMessage(msgObject, isSystem: boolean = false) {
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

