baseurl = 'https://outsidely-geo-app.azurewebsites.net/api/';
nexturl = baseurl + 'activities';
authToken = "Basic amFtdW5kOnBlbmd1aW5zcGVuZ3VpbnM=";

window.onload = function() {
    $('#login').attr('href', baseurl + 'login?redirecturl=http%3A%2F%2Flocalhost%3A8080%2Findex.html');
    init();
}