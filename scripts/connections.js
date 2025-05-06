function init() {

    $.ajax({
        url: baseurl + 'read/connections',
        headers: {'Authorization': authToken},
        success: function(response) {
            var actionhtml = '';
            for (cn in response.connections) {
                currcn = response.connections[cn];
                actionhtml += '<a href="javascript:apiDelete(\'connection\', \'' + currcn.userid + '\',\'DELETE\')">Remove</a>';
                if (currcn.connectiontype == 'pending') {
                    actionhtml += ' | <a href="javascript:apiAction(baseurl + \'create/connection\',\'POST\',{\'userid\':\'' + currcn.userid + '\',\'connectiontype\':\'confirmed\'})">Confirm</a>';
                }

                var description = '';
                switch (currcn.connectiontype) {
                    case 'connected':
                        description = 'Connected!';
                        break;
                    case 'pending':
                        description = 'Someone wants to connect with you!';
                        break;
                    case 'confirmed':
                        description = 'Request sent and waiting for response';
                        break;
                    default:
                        description = 'Unknown';
                        break;
                }

                $('#connections-body').append('<tr><td><a href="javascript:void(0)">@' + currcn.userid + '</a></td><td>' + description + '</td><td>' + actionhtml + '</td></tr>')

            }
            let table = new DataTable('#connections-table');
        }
    })

}

function createConnection() {
    apiAction(baseurl + 'create/connection', 'POST', {'userid': $('#userid').val(), 'connectiontype': 'confirmed'});
}

function createInvitation() {
    $.ajax({
        url: baseurl + 'create/invitation',
        method: 'POST',
        headers: {Authorization: authToken},
        data: JSON.stringify(),
        success: function(response) {
            const url = `${weburl}newuser.html?inviteuserid=${whoami}&invitationid=${response.invitationid}`;
            navigator.clipboard.writeText(url);
            window.alert(`Success, the invitationid link has been copied to your clipboard: ${url}`);
        },
        error: function(response) {
            window.alert(`Error: ${response.responseText}`)
        }
    });
}