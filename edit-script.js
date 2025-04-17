gear = null;

function init() {

//    fillValidations('unitsystem');

    $('#progress').hide();

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

}



// function fillGear(json) {
//     $('#gearid').empty();
//     for (i in json.gear) {
//         if (json.gear[i].activitytype.toLowerCase() != $('#activitytype').val()) {
//             continue;
//         }
//         g = json.gear[i]
//         o = document.createElement('option');
//         o.setAttribute('value', g.gearid);
//         o.innerText = g.name;
//         document.getElementById('gearid').appendChild(o);
//     }
// }