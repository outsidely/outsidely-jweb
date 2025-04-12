function init() {
    $('#loadmore-button').on('click', function() {
        loadActivities(nexturl);
    });
    loadActivities(nexturl);
}

function loadActivities(url) {
    $('#loadmore-button').hide();
    $('#progress').show();
    $.ajax({
        url: url, 
        headers: {"Authorization": authToken}, 
        success: function(json) {
            for (i in json.activities) {

                a = json.activities[i]

                div = document.createElement('div');

                div.appendChild(document.createElement('hr'));

                img = document.createElement('img');
                if (a.media.length > 0) {
                    img.setAttribute('src', baseurl + a.media[0].mediapreviewurl);
                }
                else {
                    img.setAttribute('src', baseurl + a.previewurl);
                }
                img.setAttribute('class', 'fitpreview');
                div.appendChild(img);

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
            $('#loadmore-button').show();
            $('#progress').hide();
        }
      });
}