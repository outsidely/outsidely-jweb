var activitydata = null;

function init() {

    $.ajax({
        type: 'GET',
        url: baseurl + 'activities/' + userid + '/' + activityid, 
        headers: {"Authorization": authToken},
        dataType: "json",
        contentType: "application/json",
        success: function(response){

            activitydata = response.activities[0]

            fillValidations('activitytype', activitydata.activitytype, function() {
                fillValidations('visibilitytype', activitydata.visibilitytype, function() {
                    fillGear(activitydata.activitytype, activitydata["gear"].gearid, function() {
                        $('#name').val(activitydata.name);
                        $('#description').val(activitydata.description);
                    });
                });
            });

        }
    });

    $('#activitytype').change(function() {
        fillGear($('#activitytype').val(), activitydata["gear"].gearid, function() {
            $('#name').val(activitydata.name);
            $('#description').val(activitydata.description);
        });
    });

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