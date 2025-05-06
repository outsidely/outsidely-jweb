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

    $.ajax({
        url: baseurl + 'newuser/' + $('#inviteuserid').val() + '/' + $('#invitationid').val(),
        method: 'POST',
        headers: {'Authorization': authToken},
        data: JSON.stringify(payload),
        success: function(response) {
            window.alert(`Success! Please save your recoveryid in case you ever lose or forget your password: ${response.recoveryid}`);
            // set cookie automatically?
            location.href = '/';
        },
        error: function(response) {
            window.alert(`Error: ${response.responseText}`)
        }
    });

}
