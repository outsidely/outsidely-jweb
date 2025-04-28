function init() {
    $('#loadmore-button').on('click', function() {
        loadActivities(nexturl, true);
    });
    loadActivities(nexturl, true);

    $(window).scroll(function() {
        if($(window).scrollTop() + window.innerHeight > $(window).height() - 10) {
            loadActivities(nexturl, true);
        }
     });

}