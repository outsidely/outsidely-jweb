gear = null;

function init() {

    fillValidations('visibilitytype', 'visibilitytype');
    fillValidations('activitytype', 'activitytype');

    $('#activitytype').change(function() {
        if (gear == null) {
            $.ajax({
                url: baseurl + 'read/gear',
                headers: {"Authorization": authToken}, 
                success: function(json) {
                    gear = json;
                    fillGear(gear);
                }
            });
        }
        else {
            fillGear(gear);
        }
    });
    $('#activitytype').change();

    $('#upload-button').on('click', function() {
        var formData = new FormData();
        formData.append('upload', document.getElementById('upload').files[0]);
        $('#upload-form input, select, textarea').each(function(){
            n = $(this).attr('name');
            v = $(this).val();
            if (n != 'upload' && (v ?? 0) != 0)
            {
                formData.append(n,v);
            }
        });
        $.ajax({
            url: baseurl + 'upload/activity',
            type: 'POST',
            headers: {"Authorization": authToken}, 
            data: formData,
            processData: false,
            contentType: false,
            success: function(json) {
                alert("Activity uploaded successfully");
            },
            error: function(xhr, status, error) {
                alert("Error uploading activity");
            }
        });
    });
    
}

function fillValidations(validationtype, selectid) {
    $.ajax({
        url: baseurl + 'validate/' + validationtype,
        headers: {"Authorization": authToken}, 
        success: function(json) {
            for (i in json.validations) {
                v = json.validations[i]
                o = document.createElement('option');
                o.setAttribute('value', v.activitytype);
                o.innerText = v.label;
                document.getElementById(selectid).appendChild(o);
            }
        }
      });
}

function fillGear(json) {
    $('#gearid').empty();
    for (i in json.gear) {
        if (json.gear[i].activitytype.toLowerCase() != $('#activitytype').val()) {
            continue;
        }
        g = json.gear[i]
        o = document.createElement('option');
        o.setAttribute('value', g.gearid);
        o.innerText = g.name;
        document.getElementById('gearid').appendChild(o);
    }
}