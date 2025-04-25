gear = null;

function init() {

    fillValidations('unitsystem');

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