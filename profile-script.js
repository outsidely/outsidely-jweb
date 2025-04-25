function init() {

    $.ajax({
        type: 'GET',
        url: baseurl + 'read/user', 
        headers: {"Authorization": authToken},
        dataType: "json",
        contentType: "application/json",
        success: function(response){
            fillValidations('unitsystem', response.unitsystem, function() {
                $('#firstname').val(response.firstname);
                $('#lastname').val(response.lastname);
                $('#email').val(response.email);
                $('#unitsystem').val(response.unitsystem);
            });
        }
    });

    $.ajax({
        type: 'GET',
        url: baseurl + 'read/gear', 
        headers: {"Authorization": authToken},
        dataType: "json",
        contentType: "application/json",
        success: function(response){
            gear = response.gear;
            html = '';
            for (i in gear) {
                g = gear[i]
                html += '<li>' + g.name + ' - ' + g.distance + '</li>'
            }
            $('#gearlist').html(html);
        }
    });

    $('#profile-button').click(function() {

        if ($('#password').val() != $('#ignore-password').val()) {
            alert("Passwords do not match");
            return;
        }

        var body = {};
        $('#form-user input, #form-user select, #form-user textarea').each(function(){
            if (!$(this).attr('name').includes('ignore-')) {
                n = $(this).attr('name');
                v = $(this).val();
                if (n != 'upload' && (v ?? 0) != 0)
                {
                    body[n] = v;
                }
            }
        });

        $.ajax({
            url: baseurl + 'update/user/' + whoami,
            type: 'PATCH',
            headers: {"Authorization": authToken}, 
            data: JSON.stringify(body),
            success: function(json) {
                alert("Profile updated successfully");
                location.reload();
            },
            error: function(xhr, status, error) {
                alert("Error updating profile" + xhr.responseText);
            }
        });
    });
    
}