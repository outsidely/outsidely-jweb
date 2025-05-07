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
                var activeselected = '';
                var retiredselected = '';
                if (g.geartype == 'active') {
                    activeselected = 'selected="selected"';
                }
                else {
                    retiredselected = 'selected="selected"';
                }
                htmlcontrols = '<span class="gear-controls"><select gearid="' + g.gearid + '">'
                + '<option value="active" ' + activeselected + '>Active</option>'
                + '<option value="retired" ' + retiredselected + '>Retired</option>'
                + '</select>'
                + '<input type="button" gearid="' + g.gearid + '" value="Update" onclick="updateGear(\'' + g.gearid + '\')" class="gear-update"></input></span>';
                html += '<li><span class="gear-activity">' + g.activitytype + '</span> ' + '<span class="gear-distance">(' + g.distance + ')</span><br>' +'<input gearid="' + g.gearid + '" type="text" name="name" class="gear-name" value="' + g.name + '"></input>'  + htmlcontrols + '<br><br></li>'            }
            $('#gearlist').html(html);
        }
    });

    fillValidations('activitytype', null, function() {
        $('#activitytype')[0].selectedIndex = 0;
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

    $('#gear-add-button').click(function() {
        
        var body = {};
        $('#form-add-gear input, #form-add-gear select, #form-add-gear textarea').each(function(){
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
            url: baseurl + 'create/gear',
            type: 'POST',
            headers: {"Authorization": authToken}, 
            data: JSON.stringify(body),
            success: function(json) {
                alert("Create successful");
                location.reload();
            },
            error: function(xhr, status, error) {
                alert("Error creating " + xhr.responseText);
            }
        });
    });
    
}

function updateGear(gearid) {
    var body = {name:$('input[name="name"][gearid="' + gearid + '"]').val(),geartype:$('select[gearid="' + gearid + '"]').val()};
    apiAction(baseurl + 'update/gear/' + gearid, 'PATCH', body);
}

function createRecoveryCode() {
    $.ajax({
        url: baseurl + 'create/recoveryid',
        method: 'POST',
        headers: {Authorization: authToken},
        success: function(response) {
            navigator.clipboard.writeText(response.recoveryid);
            window.alert(`Your recovery code has been copied to the clipboard: ${response.recoveryid}`);
        },
        error: function(response) {
            window.alert(`Error: ${response.responseText}`);
        }
    });
}

function deleteAccount() {
    if ($('#deleteid').val() != '') {
        $.ajax({
            url: baseurl + 'delete/user/' + whoami + '/' + $('#deleteid').val(),
            method: 'DELETE',
            headers: {Authorization: authToken},
            success: function(response) {
                window.alert(`Your account has been deleted.`);
                location.reload();
            },
            error: function(response) {
                window.alert(`Error: ${response.responseText}`);
            }
        });
    }
    else {
        $.ajax({
            url: baseurl + 'delete/user/' + whoami,
            method: 'DELETE',
            headers: {Authorization: authToken},
            success: function(response) {
                navigator.clipboard.writeText(response.deleteid);
                window.alert(`Your confirmation code has been copied to the clipboard: ${response.deleteid}`);
            },
            error: function(response) {
                window.alert(`Error: ${response.responseText}`);
            }
        });
    }
}