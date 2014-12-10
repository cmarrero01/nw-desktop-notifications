(function(){

    /**
     * With for notifications window
     * @private
     * @type {number}
     */
    var WINDOW_WIDTH = 290;

    /**
     * nw gui instance
     * @private
     * @type {exports}
     */
    var gui = require('nw.gui');

    /**
     * Amount of notifications showin
     * @private
     * @type {number}
     */
    var counter = 0;

    if(!window.LOCAL_NW){
        window.LOCAL_NW = {};
    }

    /**
     * Call a popup, create a new notification windows.
     * @method makeNewNotifyWindow
     */
    function makeNewNotifyWindow(){
        var win = gui.Window.open(
            'app://your_app/notifications.html', {
                frame: false,
                toolbar: false,
                width: WINDOW_WIDTH,
                height: 0,
                'always-on-top': true,
                show: false,
                resizable: false,
                icon:'desktop-notify.png',
                title:"Notification"
            });

        window.LOCAL_NW.DesktopNotificationsWindow = win;
        window.LOCAL_NW.DesktopNotificationsWindowIsLoaded = false;

        win.on('loaded', function(){
            window.LOCAL_NW.DesktopNotificationsWindowIsLoaded = true;
            $(win.window.document.body).find('#closer').click(function(){
                slideOutNotificationWindow();
            });
        });
    }

    /**
     * Close an notification that has been opened
     * @method closeAnyOpenNotificationWindows
     * @returns {boolean}
     */
    function closeAnyOpenNotificationWindows(){
        if(!gui){
            return false;
        }
        if(window.LOCAL_NW.DesktopNotificationsWindow){
            window.LOCAL_NW.DesktopNotificationsWindow.close(true);
            window.LOCAL_NW.DesktopNotificationsWindow = null;
        }
    }

    /**
     * Handler for notifications
     * @method notify
     * @param icon
     * @param title
     * @param content
     * @param onClick
     * @returns {boolean}
     */
    function notify(icon, title, content, onClick){

        if(!gui){
            return false;
        }

        if(!window.LOCAL_NW.DesktopNotificationsWindow){
            makeNewNotifyWindow();
        }

        var continuation = function(){
            appendNotificationToWindow(icon, title, content, onClick);
            slideInNotificationWindow();
            $(window.LOCAL_NW.DesktopNotificationsWindow.window.document.body).find('#shouldstart').text('true');
        };

        if(window.LOCAL_NW.DesktopNotificationsWindowIsLoaded){
            continuation();
        }else{
            window.LOCAL_NW.DesktopNotificationsWindow.on('loaded',continuation);
        }

        return true;
    }

    /**
     * Partial for append to the html of notifications
     * @method makeNotificationMarkup
     * @param iconUrl
     * @param title
     * @param content
     * @param id
     * @returns {string}
     */
    function makeNotificationMarkup(iconUrl, title, content, id){
        return "<li id='"+id+"'>"+
        "<div class='icon'>" +
        "<img src='"+iconUrl+"' />" +
        "</div>" +
        "<div class='title'>"+truncate(title, 35)+"</a></div>" +
        "<div class='description'>"+truncate(content, 37)+"</div>" +
        "</li>";
    }

    /**
     * Append the notification partial to the popup of notification.
     * @method appendNotificationToWindow
     * @param iconUrl
     * @param title
     * @param content
     * @param onClick
     */
    function appendNotificationToWindow(iconUrl, title, content, onClick){
        var elemId = getUniqueId();
        var markup = makeNotificationMarkup(iconUrl, title, content, elemId);
        var jqBody = $(window.LOCAL_NW.DesktopNotificationsWindow.window.document.body);
        jqBody.find('#notifications').append(markup);
        jqBody.find('#'+elemId).click(onClick);
    }

    /**
     * Animation for slide In the window of notification.
     * @method slideInNotificationWindow
     */
    function slideInNotificationWindow(){
        var win = window.LOCAL_NW.DesktopNotificationsWindow;
        if(win.NOTIFICATION_IS_SHOWING){
            return;
        }
        var y = screen.availTop;
        var x = WINDOW_WIDTH;
        win.moveTo(getXPositionOfNotificationWindow(win),y);
        win.show();
        win.NOTIFICATION_IS_SHOWING = true;
        if(document.hasFocus()){
            //win.blur();
        }
        function animate(){
            setTimeout(function(){
                if(y<60){
                    win.resizeTo(x,y);
                    y+=10;
                    animate();
                }
            },5);
        }
        animate();
    }

    /**
     * Animation of slideOut the window of notification.
     * @method slideOutNotificationWindow
     * @param callback
     */
    function slideOutNotificationWindow(callback){
        var win = window.LOCAL_NW.DesktopNotificationsWindow;
        var y = win.height;
        var x = WINDOW_WIDTH;
        function animate(){
            setTimeout(function(){
                if(y>-10){
                    win.resizeTo(x,y);
                    y-=10;
                    animate();
                }
                else{
                    win.hide();
                    if(typeof callback === 'function'){
                        callback();
                    }
                }
            },5);
        }
        animate();
        win.NOTIFICATION_IS_SHOWING = false;
    }

    /**
     * Get the x position of window notification
     * @method getXPositionOfNotificationWindow
     * @param win
     * @returns {number}
     */
    function getXPositionOfNotificationWindow(win){
        return screen.availLeft + screen.availWidth - (WINDOW_WIDTH+10);
    }

    /**
     * Get the unique Id of the notification
     * @method getUniqueId
     * @returns {string}
     */
    function getUniqueId(){
        return (+(new Date())) + '-' + (counter ++);
    }

    /**
     * Handler for longs strings, truncate if is larger of the windows.
     * @method truncate
     * @param str
     * @param size
     * @returns {*}
     */
    function truncate(str, size){
        str = $.trim(str);
        if(str.length > size){
            return $.trim(str.substr(0,size))+'...';
        }
        else{
            return str;
        }
    }

    /**
     * Public endpoints.
     * @type {{notify: notify, closeAnyOpenNotificationWindows: closeAnyOpenNotificationWindows}}
     */
    window.LOCAL_NW.desktopNotifications = {
        notify: notify,
        closeAnyOpenNotificationWindows: closeAnyOpenNotificationWindows
    };

})();