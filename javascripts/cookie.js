/* =============================================================
* LBcookie api
* ============================================================== */
!function ($) {
    "use strict";
    // jshint ;_;
    /* LBcookie CLASS DEFINITION
    * ========================== */
    function LBcookie(options) {
        this.options = $.extend({
            errorPage: '/errors/nocookie'
        });
        this.check();
    }
    LBcookie.prototype = {
        constructor: LBcookie,
        create: function (name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }
            else expires = "";
            document.cookie = name + "=" + value + expires + "; path=/";
        },
        read: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },
        erase: function (name) {
            this.create(name, "", -1);
        },
        cookiesDisabled: function () {
            this.create("LunchbunnyCheckCookie", "LB", 1);
            if (this.read("LunchbunnyCheckCookie") != null) {
                this.erase("LunchbunnyCheckCookie");
                return false;
            }
            return true;
        },
        check: function () {
            if (this.cookiesDisabled()) window.location = this.options.errorPage;
        }
    }
    /* LBcookie PLUGIN DEFINITION
    * =========================== */
    /*$.lbcookie = new LBcookie (option) {
        var options = typeof option == 'object' && option
        //if (!data) $.lbcookie.data('lbcookie', (data = new LBcookie(options)))
        if (typeof option == 'string') $.lbcookie[option]()
    };*/
    $.lbcookie = new LBcookie();
    //$.lbcookie.Constructor = LBcookie;
    /* LBcookie DATA-API
    * ================== */
    $(window).on('load', function () {
        $('[data-spy="cookie"]').each(function () {
            var $spy = $(this)
            $spy.on('click', function () {
                var $data = $spy.data('lbcookie');
                if ($data) {
                    $.lbcookie[$data]($spy.data('name'), $($spy.data('value')).val(), $spy.data('days'))
                }
            })
        })
    })
    /*$(window).on('load', function () {
        data-lbcookie
        if (!window.lbcookie) {
            window.lbcookie = new LBcookie();
        }
    })*/
}(window.jQuery);
