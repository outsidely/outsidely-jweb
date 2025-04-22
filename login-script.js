function init() {

    $('#login-button').click(function() {
        Cookies.set('outsidely','Basic ' + btoa($('#userid').val() + ':' + $('#password').val()), { expires: 30 });
        window.location.href = 'index.html';
    });

    $('#logout-button').click(function() {
        Cookies.remove('outsidely');
        window.location.href = 'index.html';
    });

}