function init() {
    $('#loadmore-button').on('click', function() {
        loadActivities(nexturl, 'loadmore-button', 'progress', true);
    });
    loadActivities(nexturl, 'loadmore-button', 'progress', true);
}