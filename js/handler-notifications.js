/**
 * Limit for truncate messages
 * @type {number}
 */
var LIMIT_FOR_TRUNKATING_MESSAGES = 5;

/**
 * Handler the notification incoming
 * @method processNotifications
 */
function processNotifications(){

    var nlist = $('#notifications');
    var n = $('#notifications > li');

    var continuation = function(){

        n = $('#notifications > li');

        if(n.length === 0){

            //lets close the window
            $('#closer').click();
            $('#shouldstart').text('false');
            waitForKickoff();
            return;

        }else if(n.length > LIMIT_FOR_TRUNKATING_MESSAGES){
            var toinsert = "<li>"+
                "<div class='icon'>" +
                "<img src='./img/tray.png' />" +
                "</div>" +
                "<div class='title'>Family Safety</div>" +
                "<div class='description'>"+n.length+" Notifications.</div>" +
                "</li>";
            nlist.html(toinsert);
        }

        n = $('#notifications > li');
        n.first().fadeIn('fast');
        setTimeout(processNotifications, 4000);
    };

    if(n.first().is(':visible')){

        n.first().fadeOut('fast', function(){
            n.first().remove();
            continuation();
        });

    }else{
        continuation();
    }
}

/**
 * Time Out to close this notification.
 * @method waitForKickoff
 */
function waitForKickoff(){
    if($('#shouldstart').text() === 'true'){
        processNotifications();
    }
    else{
        setTimeout(waitForKickoff,40);
    }
}

waitForKickoff();