var baseurl = 'https://api.outsidely.net/';
var weburl = 'https://app.outsidely.net/';
var authToken = '';
var nexturl = baseurl + 'activities';
var userid = '';
var activityid = '';
var whoami = '';
var menu = [{url: "/", label: "Feed"},{url: "create.html", label: "Create"},{url: "connections.html", label: "Friends"},{url: "notifications.html", label: 'Msgs <span id="notificationcount"></span>'}];
var gear = null;
var loadingactivities = false;
var qs = new URLSearchParams(location.search);

window.onload = function() {

    if (!location.href.includes('outsidely.net')){
        baseurl = 'http://localhost:7071/';
        weburl = 'http://localhost:8080/';
        nexturl = baseurl + 'activities';
    }

    applyContent();

    userid = qs.get('userid');
    activityid = qs.get('activityid');
    authToken = 'Bearer ' + Cookies.get('outsidely');

    okpages = ['newuser','recover','login','about'];
    for (okp in okpages) {
        if (location.href.includes(okpages[okp] + '.html')) {
            init();
            return;
        }
    }
    
    $.ajax({
        url: baseurl + 'whoami',
        headers: {"Authorization": authToken},
        success: function(response) {
            whoami = response.userid;
            $('#whoami').html(whoami);
            $('#whoamilink').attr('href', 'user.html?userid=' + whoami);
            $.ajax({
                url: baseurl + 'read/notifications',
                headers: {"Authorization": authToken},
                success: function(response) {
                    let count = response.notifications.length;
                    let countstr = count.toString();
                    if (count > 0) {
                        if (count > 9) {
                            countstr = '9+';
                        }
                        $('#notificationcount').html('(' + countstr + ')');
                    }
                    init();
                }
            });
        },
        error: function(response) {
            location.href = 'login.html';
        }
    });

}

function applyContent() {
    
    for (c in contents) {
        $('#' + c).html(contents[c]);
    }

    var submenu= '';
    submenu += '<div class="dropdown-content">';
    submenu += '<a href="about.html">About</a>';
    submenu += '<a href="profile.html">Profile</a>';
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
    location.href = "login.html";
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
                
                var activityUrl = 'activity.html?userid=' + a.userid + '&activityid=' + a.activityid;

                div = document.createElement('div');
                div.setAttribute('class', 'activity-item');

                private_html = '';
                if (a["visibilitytype"] == 'private') {
                    private_html = '<img class="icon-small" title="This activity is private only to you" src="assets/lock.png"/>';
                }

                propclass = '';
                for (p in a.props) {
                    if (a.props[p].userid == whoami) {
                        propclass = 'interaction-active';
                        break;
                    }
                }

                barhtml = `
                    <div class="activity-bar">
                        <div class="activity-bar-left">${private_html}<a href="user.html?userid=${a.userid}">@${a.userid}</a><span class="activity-date">${a.starttime}</span></div>
                        <div class="activity-bar-right">
                            <a href="javascript:apiAction('${baseurl}create/prop/${a.userid}/${a.activityid}', 'POST', JSON.stringify({}))"><span class="activity-bar-interaction ${propclass}">${a.props.length}<img class="activity-bar-icon" src="assets/props.png"/></span></a><a href="activity.html?userid=${a.userid}&activityid=${a.activityid}#comments"><span class="activity-bar-interaction">${a.comments.length}<img class="activity-bar-icon" src="assets/comments.png"/></span>
                        </div>
                    </div>
                `;

                $(div).append(barhtml);

                if (includepreview && (haspreview || hasmedia)) {

                    link = document.createElement('a');
                    link.setAttribute('href', activityUrl);
    
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

                properties = {'description': 'Description', 'gear.name': 'Gear', 'distance': 'Distance', 'time': 'Time', 'ascent': 'Elevation', 'speed': 'Speed'};
                for (i in properties) {
                    try {
                        if (i.includes('.')) {
                            var parts = i.split('.');
                            v = a[parts[0]][parts[1]];
                        }
                        else {
                            isarray = Array.isArray(a[i]);
                            if (a[i].length > 0 || isarray) {
                                var v;
                                if (isarray) {
                                    v = a[i].length;
                                }
                                else {
                                    v = a[i];
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

function apiDelete(type, id, id2, redirecturl) {
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
            if (redirecturl) {
                location.href = redirecturl;
            }
            else {
                location.reload();
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

function apiAction(url, method, body, stringtype = false, redirecturl = null) {
    if (stringtype == true) {
        payload = body.replaceAll('__doublequote__', '"');
    }
    else {
        try {
            payload = JSON.stringify(body);
        }
        catch (e) {
            payload = JSON.stringify({});
        }
    }
    $.ajax({
        type: method,
        url: url, 
        headers: {"Authorization": authToken},
        contentType: "application/json",
        data: payload,
        success: function(response){
            window.alert("API action successful");
            if (redirecturl) {
                location.href = redirecturl;
            }
            else {
                location.reload();
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

