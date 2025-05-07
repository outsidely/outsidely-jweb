function init() {

    $('#userid').val(qs.get('userid'));
    $('#recoveryid').val(qs.get('recoveryid'));

}

function recover() {
    
    if ($('#password').val() != $('#confirmpassword').val()) {
        window.alert('Error: passwords do not match');
        return;
    }

    payload = {};
    values = ['password']
    for (v in values) {
        payload[values[v]] = $('#' + values[v]).val();
    }

    $.ajax({
        url: baseurl + 'recover/' + $('#userid').val() + '/' + $('#recoveryid').val(),
        method: 'POST',
        headers: {'Authorization': authToken},
        data: JSON.stringify(payload),
        success: function(response) {
            window.alert(`Success! Please save your recoveryid in case you ever lose or forget your password: ${response.recoveryid}`);
            Cookies.set('outsidely', btoa(`${payload['userid']}:${payload['password']}`), { expires: 30 });
            location.href = '/';
        },
        error: function(response) {
            window.alert(`Error: ${response.responseText}`)
        }
    });

}
