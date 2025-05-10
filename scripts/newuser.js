function init() {

    $('#inviteuserid').val(qs.get('inviteuserid'));
    $('#invitationid').val(qs.get('invitationid'));

}

function createUser() {
    
    if ($('#password').val() != $('#confirmpassword').val()) {
        window.alert('Error: passwords do not match');
        return;
    }

    payload = {};
    values = ['userid','email','firstname','lastname','password']
    for (v in values) {
        payload[values[v]] = $('#' + values[v]).val();
    }

    $.ajax({
        url: baseurl + 'newuser/' + $('#inviteuserid').val() + '/' + $('#invitationid').val(),
        method: 'POST',
        headers: {'Authorization': authToken},
        data: JSON.stringify(payload),
        success: function(response) {
            window.alert(`Success! Please save your recoveryid in case you ever lose or forget your password: ${response.recoveryid}`);
            Cookies.set('outsidely', btoa(`${payload['userid']}:${payload['password']}`), { expires: 30 });
            location.href = '/';
        },
        error: function(response) {
            try {
                window.alert(`Error: ${response.responseJSON.message}`);
            }
            catch (e) {
                window.alert(`Error`);
            }
        }
    });

}
