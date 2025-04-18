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
                        optionshtml += '<input type="button" onclick="apiAction(\'' + baseurl + o.url + '\',\'' + o.method + '\',\'' + o.body + '\')" value="' + o.text + '"/>';
                    }
                }
                html += '<li>' + n.message + ' - ' + n.createtime + optionshtml + '</li>';
                $('#notifications').html(html);
            }
        }
    });

}