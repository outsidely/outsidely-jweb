var baseurl = 'https://api.outsidely.net/';
//var baseurl = 'http://localhost:7071/';
var weburl = 'https://app.outsidely.net/';
//var weburl = 'http://localhost:8080/';
var authToken = '';
var nexturl = baseurl + 'activities';
var userid = '';
var activityid = '';
var whoami = '';
var menu = [{url: "/", label: "Feed"},{url: "create.html", label: "Upload"},{url: "connections.html", label: "Friends"},{url: "notifications.html", label: 'Msgs <span id="notificationcount"></span>'}];
var gear = null;
var loadingactivities = false;
var qs = new URLSearchParams(location.search);

window.onload = function() {

    applyContent();

    userid = qs.get('userid');
    activityid = qs.get('activityid');
    token = qs.get('token');
    
    if (token) {
        Cookies.set('outsidely', token, { expires: 30 });
        location.href = 'index.html';
    }

    authToken = 'Basic ' + Cookies.get('outsidely');

    if (location.href.includes('newuser') || location.href.includes('recover')) {
        init();
        return;
    }

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
            //alert("Error getting user information");
            location.replace(baseurl + "login?redirecturl=" + encodeURIComponent(location.href));
        }
    });

}

function applyContent() {
    
    for (c in contents) {
        $('#' + c).html(contents[c]);
    }

    var submenu= '';
    submenu += '<div class="dropdown-content">';
    submenu += '<a href="profile.html">Profile</a>';
    submenu += '<a href="javascript:void(0)">Invites</a>';
    submenu += '<a href="javascript:authLogout()">Logout</a>'
    submenu += '</div>';

    for (i in menu) {
        m = menu[i];
        $('#menu').append('<li><a href="' + m.url + '">' + m.label + '</a></li>');
    }
    $('#menu').append('<li class="dropdown"><a href="javascript:void(0)" class="dropbtn">More ...</a>' + submenu + '</li>');

}

function authLogout() {
    Cookies.remove('outsidely');
    location.reload();
}

function loadActivities(url, includepreview, callback) {

    if (loadingactivities) {
        return;
    }
    loadingactivities = true;

    if (typeof callback === "undefined") {
        callback = function() {};
    }

    $('#progress').show();

    $.ajax({
        url: url, 
        headers: {"Authorization": authToken}, 
        success: function(json) {
            for (i in json.activities) {

                a = json.activities[i]

                let haspreview = true;
                if (!a.previewurl) {
                    haspreview = false;
                }

                let hasmedia = false;
                try {
                    if (a.media.length > 0)
                    {
                        hasmedia = true;
                    }
                }
                catch (e) {}

                div = document.createElement('div');
                div.setAttribute('class', 'activity-item');

                private_html = '';
                if (a["visibilitytype"] == 'private') {
                    private_html = '<img class="icon-small" title="This activity is private only to you" src="assets/lock.png"/>';
                }
                $(div).append('<div class="activity-userid">' + private_html + '<a href="javascript:void(0)">@' + a.userid + '</a> on ' + a.starttime + '</div>');

                if (includepreview && (haspreview || hasmedia)) {

                    link = document.createElement('a');
                    link.setAttribute('href', 'activity.html?userid=' + a.userid + '&activityid=' + a.activityid);
    
                    img = document.createElement('img');
                    img.setAttribute('src', baseurl + a.previewurl);
                    try {
                        img.setAttribute('src', baseurl + a.media[0].mediapreviewurl);
                    }
                    catch (e) {}
                    img.setAttribute('class', 'fitpreview');
                    link.appendChild(img);
    
                    div.appendChild(link);
                    
                }

                // icons from: https://fonts.google.com/icons size 50 color #000000
                $(div).append('<div class="activity-title"><a href="'+'activity.html?userid=' + a.userid + '&activityid=' + a.activityid+'"><img class="activity-icon" src="assets/' + a.activitytype + '.png"/><span class="activity-text">'+a["name"]+'</a></span></div>');

                properties = ['description', 'gear.name', 'activitytype', 'distance', 'time', 'ascent', 'speed', 'props', 'comments'];
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
                        $(div).append('<div class="activity-property-row"><span class="activity-prop">' + properties[i] + '</span><span class="activity-value">' + v.toString()+ '</span></div>');
                    }
                    catch (e) {}
                }

                document.getElementById('activities').appendChild(div);

            }

            $('#activities').append(div);
            nexturl = baseurl + json.nexturl;

            $('#progress').hide();

            loadingactivities = false;

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

function fillGear(activitytype, defaultvalue, callback, activeonly = false) {

    if (!callback) {
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
            o.setAttribute('value', "none");
            o.innerText = "None";
            document.getElementById('gearid').appendChild(o);
            for (i in gear) {
                if (gear[i].geartype != 'active' && activeonly) {
                    continue;
                }
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
            if (!$('#gearid').val()) {
                $('#gearid').val('none');
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
    payload = '';
    try {
        payload = JSON.stringify(body);
    }
    catch (e) {
        payload = JSON.stringify({});
    }
    $.ajax({
        type: method,
        url: url, 
        headers: {"Authorization": authToken},
        contentType: "application/json",
        data: payload,
        success: function(response){
            window.alert("API action successful");
            location.reload();
        },
        error: function(response) {
            window.alert(`Error: ${response.responseText}`);
        }
    });
}

