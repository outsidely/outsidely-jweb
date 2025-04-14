baseurl = 'https://outsidely-geo-app.azurewebsites.net/api/';
authToken = "Basic amFtdW5kOnBlbmd1aW5zcGVuZ3VpbnM=";
nexturl = baseurl + 'activities';

window.onload = function() {
    $('#login').attr('href', baseurl + 'login?redirecturl=http%3A%2F%2Flocalhost%3A8080%2Findex.html');
    init();
}

function loadActivities(url, buttonid, progressid, includepreview) {

    $('#' + buttonid).hide();
    $('#' + progressid).show();

    $.ajax({
        url: url, 
        headers: {"Authorization": authToken}, 
        success: function(json) {
            for (i in json.activities) {

                a = json.activities[i]

                div = document.createElement('div');

                div.appendChild(document.createElement('hr'));

                if (includepreview) {

                    link = document.createElement('a');
                    link.setAttribute('href', 'activity.html?userid=' + a.userid + '&activityid=' + a.activityid);
    
                    img = document.createElement('img');
                    if (a.media.length > 0) {
                        img.setAttribute('src', baseurl + a.media[0].mediapreviewurl);
                    }
                    else {
                        img.setAttribute('src', baseurl + a.previewurl);
                    }
                    img.setAttribute('class', 'fitpreview');
                    link.appendChild(img);
    
                    div.appendChild(link);
                    
                }

                properties = ['userid', 'name', 'description', 'activitytype', 'starttime', 'distance', 'time', 'ascent', 'speed'];
                for (i in properties) {
                    try {
                        if (a[properties[i]].length > 0) {
                            $(div).append('<br/><b>' + properties[i] + '</b>: ' + a[properties[i]]);
                        }
                    }
                    catch (e) {}
                }

                document.getElementById('activities').appendChild(div);

            }

            $('#activities').append(div);
            nexturl = baseurl + json.nexturl;

            $('#' + buttonid).show();
            $('#' + progressid).hide();
        }
      });
}

function fillValidations(validationtype) {
    $.ajax({
        url: baseurl + 'validate/' + validationtype,
        headers: {"Authorization": authToken}, 
        success: function(json) {
            for (i in json.validations) {
                v = json.validations[i]
                o = document.createElement('option');
                o.setAttribute('value', v.activitytype);
                o.innerText = v.label;
                document.getElementById(validationtype).appendChild(o);
            }
        }
      });
}