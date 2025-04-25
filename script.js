var baseurl = 'https://outsidely.azurewebsites.net/';
var baseurl = 'http://localhost:7071/';
var authToken = '';
var nexturl = baseurl + 'activities';
var userid = '';
var activityid = '';
var whoami = '';
var menu = [{url: "index.html", label: "Activity Feed"},{url: "upload.html", label: "Create Activity"},{url: "profile.html", label: "Your Profile"},{url: "notifications.html", label: 'Notifications <span id="notificationcount"></span>'},{url: "javascript:authLogout()", label: "Logout"}];
var gear = null;

window.onload = function() {

    qs = new URLSearchParams(location.search);
    userid = qs.get('userid');
    activityid = qs.get('activityid');
    token = qs.get('token');
    
    if (token) {
        Cookies.set('outsidely', token, { expires: 30 });
        window.location.href = 'index.html';
    }
    
    for (i in menu) {
        m = menu[i];
        $('#menu').append('<li><a href="' + m.url + '">' + m.label + '</a></li>');
    }

    authToken = 'Basic ' + Cookies.get('outsidely');

    $.ajax({
        url: baseurl + 'whoami',
        headers: {"Authorization": authToken},
        success: function(json) {
            whoami = json.userid;
            $.ajax({
                url: baseurl + 'read/notifications',
                headers: {"Authorization": authToken},
                success: function(json) {
                    count = json.notifications.length;
                    if (count > 0) {
                        $('#notificationcount').html('('+json.notifications.length+')');
                    }
                    init();
                }
            });
        },
        error: function(xhr, status, error) {
            alert("Error getting user information");
            location.replace(baseurl + "login?redirecturl=" + encodeURIComponent(location.href));
        }
    });

}

function authLogout() {
    Cookies.remove('outsidely');
    window.location.href = 'index.html';
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

                properties = ['visibilitytype','userid', 'name', 'description', 'gear.name', 'gear.distance', 'activitytype', 'starttime', 'distance', 'time', 'ascent', 'speed', 'props', 'comments'];
                for (i in properties) {
                    try {
                        if (properties[i].includes('.')) {
                            var parts = properties[i].split('.');
                            v = a[parts[0]][parts[1]];
                        }
                        else {
                            isarray = Array.isArray(a[properties[i]]);
                            if (a[properties[i]].length > 0 || isarray) {
                                var v;
                                if (isarray) {
                                    v = a[properties[i]].length;
                                }
                                else {
                                    v = a[properties[i]];
                                }
                            }
                        }
                        $(div).append('<br/><b>' + properties[i] + ':</b> ' + v.toString());
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

function fillValidations(validationtype, defaultvalue, callback) {
    if (typeof callback === "undefined") {
        callback = function() {};
    }
    $('#' + validationtype).empty();
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
            $('#' + validationtype).val(defaultvalue);
            callback();
        }
      });
}

function fillGear(activitytype, defaultvalue, callback) {

    if (typeof callback === "undefined") {
        callback = function() {};
    }

    $('#gearid').empty();

    $.ajax({
        type: 'GET',
        url: baseurl + 'read/gear', 
        headers: {"Authorization": authToken},
        dataType: "json",
        contentType: "application/json",
        success: function(response) {
            gear = response.gear;
            o = document.createElement('option');
            o.setAttribute('value', "");
            o.innerText = "None";
            document.getElementById('gearid').appendChild(o);
            for (i in gear) {
                if (gear[i].activitytype != activitytype) {
                    continue;
                }
                g = gear[i]
                o = document.createElement('option');
                o.setAttribute('value', g.gearid);
                o.innerText = g.name;
                document.getElementById('gearid').appendChild(o);
            }
            if (defaultvalue) {
                $('#gearid').val(defaultvalue);
            }
            callback();
        }
    });

}

function apiDelete(type, id, id2) {
    if (confirm("Are you sure you want to delete this " + type + "?")) {
        var url = baseurl + "delete/" + type + "/" + id;
    if (id2 != undefined) {
        url += "/" + id2;
    }
    $.ajax({
        type: "DELETE",
        url: url, 
        headers: {"Authorization": authToken}, 
        dataType: "json", 
        success: function(response){
            window.alert("delete successful");
            location.reload();
        }
    });
    }
    
}

function apiAction(url, method, body) {
    $.ajax({
        type: method,
        url: url, 
        headers: {"Authorization": authToken},
        dataType: "json",
        contentType: "application/json",
        data: function() { 
            try {
                return JSON.stringify(body);
            }
            catch (e) {
                return JSON.stringify({});
            }
        } ,
        success: function(response){
            window.alert("API action successful");
            location.reload();
        }
    });
}

