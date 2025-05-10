function init() {

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

            $('#usercard').append('<div>You are viewing a user feed.</div>');

        }
     });

}