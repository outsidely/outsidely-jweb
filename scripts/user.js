function init() {

    // test if user is connection, if not then prompt to create connection
    $.ajax({
        url: baseurl + 'read/connections',
        headers: {Authorization: authToken},
        success: function(response) {
            if (whoami == userid) {
                userConnected();
            }
            else {
                let userconnected = false;
                for (r in response.connections) {
                    if (response.connections[r].userid == userid && response.connections[r].connectiontype == 'connected') {
                        userconnected = true;
                        break;
                    }
                }
                if (userconnected) {
                    userConnected();
                }
                else {
                    let html = `
                        <p>
                            Not connected to ${userid}.
                        </p>
                        <p>
                            If you would like to send a connection request, <a href="javascript:requestConnection()">click here</a>.
                        <p>
                    `;
                    $('#usercard').html(html);
                    $('#progress').hide();
                }
            }
        }
    });

}

function requestConnection() {
    apiAction(baseurl + 'create/connection', 'POST', {userid: userid, connectiontype: 'confirmed'}, false, 'connections.html');
}

function userConnected() {

    loadActivities(nexturl + '/' + userid, true);

    $(window).scroll(function() {
        if($(window).scrollTop() + window.innerHeight > $(window).height() - 10) {
            loadActivities(nexturl, true);
        }
     });

     $.ajax({
        url: baseurl + 'read/user/' + userid,
        headers: {"Authorization": authToken},
        success: function(response) {

            barhtml = `
            <div class="activity-bar">
                <div class="activity-bar-left">${response.firstname} ${response.lastname} (<a href="user.html?userid=${response.userid}">@${response.userid}</a>)<span class="activity-date">Member since ${luxon.DateTime.fromISO(response.createtime).toLocaleString(luxon.DateTime.DATE_FULL)}</span></div>
                <div class="activity-bar-right">
                    <!-- icon could go here? -->
                </div>
            </div>
            `;
            $('#usercard').append(barhtml);

            $.ajax({
                url: baseurl + 'statistics/' + userid,
                headers: {"Authorization": authToken},
                success: function(response) {
                    statshtml = `
                        <div class="activity-property-row">
                            <span class="activity-prop">Activities</span><span class="activity-value">${response.count}</span>
                            <br/>
                            <span class="activity-prop">Distance</span><span class="activity-value">${response.distance}</span>
                            <br/>
                            <span class="activity-prop">Time</span><span class="activity-value">${response.time}</span>
                            <br/>
                            <span class="activity-prop">Elevation</span><span class="activity-value">${response.ascent}</span>
                        </div>
                    `;
                    $('#usercard').append(statshtml);
                }
            });

        }
     });

}