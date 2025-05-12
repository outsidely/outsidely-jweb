function init() {
    
    $.ajax({
        url: baseurl + 'read/notifications',
        headers: {"Authorization": authToken}, 
        success: function(json) {
            html = '';
            for (i in json.notifications) {
                n = json.notifications[i];
                optionshtml = '';
                if (n.options) {
                    for (j in n.options) {
                        o = n.options[j];
                        let b = o.body;
                        if (!o.body) {
                            b = '';
                        }
                        optionshtml += '<input type="button" onclick="apiAction(\'' + baseurl + o.url + '\',\'' + o.method + '\',\'' + b.replaceAll('"','__doublequote__') + '\',true)" value="' + o.text + '"/>';
                    }
                }

                let hasuserid = false;
                let hasactivityid = false;
                if (Object.keys(n).indexOf('properties') >= 0) {
                    if (Object.keys(n.properties).indexOf('userid') >= 0) {
                        hasuserid = true;
                    }
                    if (Object.keys(n.properties).indexOf('activityid') >= 0) {
                        hasactivityid = true;
                    }
                }

                let links = [];
                if (hasuserid && hasactivityid) {
                    links.push('<a href="activity.html?userid=' + n.properties.userid + '&activityid=' + n.properties.activityid + '">Activity</a>');
                }
                if (hasuserid && !hasactivityid) {
                    links.push('<a href="user.html?userid=' + n.properties.userid + '">User Page</a>');
                }
                let linkhtml = '';
                if (links.length > 0) {
                    linkhtml = ' - ' + links.join(', ');
                }

                html += '<li>' + n.message + linkhtml + ' - ' + n.createtime + ' - ' + optionshtml + '</li>';
                $('#notifications').html(html);
            }
            if (json.notifications.length == 0) {
                $('#notifications').html('<li>You have no notifications</li>');
            }
        }
    });

}