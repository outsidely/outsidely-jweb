var baseurl = 'https://outsidely.azurewebsites.net/';
var authToken = '';
var nexturl = baseurl + 'activities';
var userid = '';
var activityid = '';
var whoami = '';
var menu = [{url: "index.html", label: "Activity Feed"},{url: "upload.html", label: "Create Activity"},{url: "profile.html", label: "Your Profile"},{url: baseurl + "login?redirecturl=" + encodeURIComponent(location.protocol + '://' + location.host), label: "Backend Login"},{url: "login.html", label: "Frontend Login"}];

window.onload = function() {

    authToken = Cookies.get('outsidely');

    qs = new URLSearchParams(location.search);
    userid = qs.get('userid');
    activityid = qs.get('activityid');
    
    for (i in menu) {
        m = menu[i];
        $('#menu').append('<li><a href="' + m.url + '">' + m.label + '</a></li>');
    }

    $.ajax({
        url: baseurl + 'whoami',
        headers: {"Authorization": authToken},
        success: function(json) {
            whoami = json.userid;
        },
        error: function(xhr, status, error) {
            alert("Error getting user information");
        },
        complete: function() {
            init();
        }
    });

}

function loadActivities(url, buttonid, progressid, includepreview, callback) {

    if (typeof callback === "undefined") {
        callback = function() {};
    }
    

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

                properties = ['userid', 'name', 'description', 'activitytype', 'starttime', 'distance', 'time', 'ascent', 'speed', 'props', 'comments'];
                for (i in properties) {
                    try {
                        isarray = Array.isArray(a[properties[i]]);
                        if (a[properties[i]].length > 0 || isarray) {
                            var v;
                            if (isarray) {
                                v = a[properties[i]].length;
                            }
                            else {
                                v = a[properties[i]];
                            }
                            $(div).append('<br/><b>' + properties[i] + ':</b> ' + v.toString());
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

            callback(json);

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
                o.setAttribute('value', v[validationtype]);
                o.innerText = v.label;
                document.getElementById(validationtype).appendChild(o);
            }
        }
      });
}

function apiDelete(type, id, id2) {
    $.ajax({
        type: "DELETE",
        url: baseurl + "delete/" + type + "/" + id + "/" + id2, 
        headers: {"Authorization": authToken}, 
        dataType: "json", 
        success: function(response){
            window.alert("delete successful");
            location.reload();
        }
    });
}