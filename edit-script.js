var firstload = true;

function init() {

    fillValidations('activitytype');
    fillValidations('visibilitytype');

    $('#activitytype').change(function() {
        $.ajax({
            url: baseurl + 'read/gear',
            headers: {"Authorization": authToken}, 
            success: function(json) {
                fillGear(json);
                if (firstload) {
                    firstload = false;
                    $.ajax({
                        type: 'GET',
                        url: baseurl + 'activities/' + userid + '/' + activityid, 
                        headers: {"Authorization": authToken},
                        dataType: "json",
                        contentType: "application/json",
                        success: function(response){
                            var a = response.activities[0]
                            var namevalues = [];
                            namevalues.push({name: 'activitytype', value: a.activitytype});
                            namevalues.push({name: 'visibilitytype', value: a.visibilitytype});
                            namevalues.push({name: 'name', value: a.name});
                            namevalues.push({name: 'description', value: a.description});
                            namevalues.push({name: 'gearid', value: a["gear"].gearid});
                            preFill('form-edit', namevalues);
                            $('#activitytype').change();
                        }
                    });
                }
            }
        });
    });
    $('#activitytype').change();

    $('#edit-button').click(function() {

        var body = {};
        $('#form-edit input, #form-edit select, #form-edit textarea').each(function(){
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
            url: baseurl + 'update/activity/' + activityid,
            type: 'PATCH',
            headers: {"Authorization": authToken}, 
            data: JSON.stringify(body),
            success: function(json) {
                alert("Update successful");
                location.reload();
            },
            error: function(xhr, status, error) {
                alert("Error updating " + xhr.responseText);
            }
        });
    });

    $('#media-button').click(function() {
        $('#upload-button').hide();
        $('#progress').show();
        var uploadcnt = document.getElementById('upload').files.length;
        var progresscnt = 0;
        for (var i = 0; i < uploadcnt ; i++) {
            var formData = new FormData();
            formData.append('upload', document.getElementById('upload').files[i]);
            $.ajax({
                url: baseurl + 'upload/media/' + activityid,
                type: 'POST',
                headers: {"Authorization": authToken}, 
                data: formData,
                processData: false,
                contentType: false,
                error: function() {
                    alert("upload error");
                },
                complete: function() {
                    progresscnt++;
                    if (progresscnt == uploadcnt) {
                        alert("upload complete");
                        location.reload();
                    }
                }
            });
        }
    });

    $('#delete-button').click(function() {
        apiDelete('activity', activityid);
    });

}

function preFill(formid, namevalues) {
    $('#' + formid + ' input ,#' + formid + ' select,#' + formid + ' textarea').each(function(){
        if ($(this).attr('type') != 'button') {
            n = $(this).attr('name');
            for (var i = 0; i < namevalues.length; i++) {
                if (n == namevalues[i]['name']) {
                    $(this).val(namevalues[i]['value']);
                    console.log(namevalues[i]['name'] + ' ' + namevalues[i]['value']);
                }
            }
        }
    });
}