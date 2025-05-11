function init() {}

function login() {
    
    $.ajax({
        url: baseurl + 'token',
        method: 'POST',
        headers: {Authorization: authToken},
        data: JSON.stringify({userid: $('#userid').val(),password:$('#password').val()}),
        success: function(response) {
            console.log(response);
            Cookies.set('outsidely', response.access_token, { expires: 30 });
            location.replace('index.html');
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
