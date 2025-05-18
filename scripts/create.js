function init() {

    $('#progress').hide();

    fillValidations('visibilitytype', "connections", function() {
        fillValidations('activitytype', "ride", function() {
            $('#activitytype').change(function() {
                if (gear == null) {
                    $.ajax({
                        url: baseurl + 'read/gear',
                        headers: {"Authorization": authToken}, 
                        success: function(json) {
                            gear = json;
                            fillGear($('#activitytype').val(), null, null, true);
                        }
                    });
                }
                else {
                    fillGear($('#activitytype').val(), null, null, true);
                }
            });
            $('#activitytype').change();
        });
    });

    $('input[name="gps"]').change(function() {
        console.log(this.value);
        if (this.value == '0') {
            $('#show-gps-0').show();
            $('#show-gps-1').hide();
        } else {
            $('#show-gps-0').hide();
            $('#show-gps-1').show();
        }
    });

    $("#starttime").flatpickr({enableTime: true});

    $('#upload-button').on('click', function() {

        $('#upload-button').hide();
        $('#progress').show();

        var formData = new FormData();
        var gps = $('input[name="gps"]:checked').val();
        var removeNames = [];
        var postUrl = baseurl + 'upload/activity';
        var postBody = {};
        var processData = null;
        var contentType = null;
        var data = null;
        if (gps == '1') {
            removeNames = ['distance', 'ascent', 'time', 'starttime', 'gps', 'undefined'];
            formData.append('upload', document.getElementById('upload').files[0]);
            processData = false;
            contentType = false;
        }
        else {
            removeNames = ['gps','undefined'];
            postUrl = baseurl + 'create/activity';
            contentType = 'application/json';
        }
        $('#upload-form input, select, textarea').each(function(){
            let n = $(this).attr('name');
            let v = $(this).val();
            if (n != 'upload' && (v ?? 0) != 0){
                if (n == 'starttime') {
                    v = flatpickr2UTC('starttime');
                }
                formData.append(n, v);
                postBody[n] = v;
            }
        });

        for (rn in removeNames) {
            formData.delete(removeNames[rn]);
            delete postBody[removeNames[rn]];
        }

        if (gps == '1') {
            data = formData;
        }
        else {
            postBody['time'] = postBody['time'] * 60;
            data = JSON.stringify(postBody);
        }

        $.ajax({
            url: postUrl,
            type: 'POST',
            headers: {"Authorization": authToken}, 
            data: data,
            processData: false,
            contentType: false,
            success: function(response) {
                activityid = response.activityid;
                if (document.getElementById('upload-media').files.length > 0) {
                    uploadMedia();
                }
                else {
                    uploadComplete();
                }
            },
            error: function(response) {
                try {
                    window.alert(`Error: ${response.responseJSON.message}`);
                }
                catch (e) {
                    window.alert(`Error`);
                }
                $('#upload-button').show();
                $('#progress').hide();
            }
        });

    });
    
}

function flatpickr2UTC(id) {
    return luxon.DateTime.fromISO($('#' + id).val().replace(' ','T')).toUTC().toString();
}

function uploadComplete() {
    alert("Activity created successfully");
    location.href = `activity.html?userid=${whoami}&activityid=${activityid}`;
}

function uploadMedia() {
    var uploadcnt = document.getElementById('upload-media').files.length;
    var progresscnt = 0;
    for (var i = 0; i < uploadcnt ; i++) {
        var formData = new FormData();
        formData.append('upload', document.getElementById('upload-media').files[i]);
        $.ajax({
            url: baseurl + 'upload/media/' + activityid,
            type: 'POST',
            headers: {"Authorization": authToken}, 
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                progresscnt++;
                if (progresscnt == uploadcnt) {
                    uploadComplete();
                }
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
}