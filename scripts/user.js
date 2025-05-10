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
            $('#userid').html('<a href="user.html?userid=' + response.userid + '">@' + response.userid + '</a>');
            $('#name').html(response.firstname + ' ' + response.lastname);
            $('#createtime').html('Member since ' + luxon.DateTime.fromISO(response.createtime).toLocaleString(luxon.DateTime.DATE_FULL));
        }
     });

}