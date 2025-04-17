function init() {

    $('#login-button').click(function() {
        Cookies.set('outsidely','Basic ' + btoa($('#userid').val() + ':' + $('#password').val()));
        window.location.href = 'index.html';
    });

    $('#logout-button').click(function() {
        Cookies.set('outsidely','');
        window.location.href = 'index.html';
    });

}