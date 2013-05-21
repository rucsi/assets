$().ready(function () {

    //scrollspy body 100% quickfix
    if ($(".categories").length)
        if (window.innerHeight < $('footer').offset().top) { //'document.body.clientHeight) {
            $('body').css({ 'height': 'auto' })
        }

    //if (window.innerHeight > document.body.clientHeight) {
    //    $('footer').css({
    //        position: "fixed",
    //        visibility: ''
    //    })
    //} else {
    //    $('footer').css({
    //        visibility: ''
    //    })
    //}
    /*var ev = new $.Event('remove'),
        orig = $.fn.remove
    $.fn.remove = function () {
        $(this).trigger(ev)
        return orig.apply(this, arguments)
    }*/
    /*var dtbtns = $('#deliveryType')
    var dtm = Math.floor((dtbtns.parent().width() - dtbtns.width()) / 2)
    dtbtns.css({
        'margin-left': dtm + 'px',
        'margin-right': dtm + 'px',
        'visibility': 'visible'
    })*/

    var postcode = $('#postcode')
    if (postcode.length) {
        if (postcode.val()) {
            var map = $('#map')
            if (map.length)
                if (map.lbmap('defaultHome'))
                    $.get("/geolocate", { postcode: postcode.val().replace(/\s/g, "") })
                   .done(function (data) {
                       map.lbmap('setHome', data[0], data[1])
                   })
        }
        else {
            var lbpc = $.lbcookie.read('lbpostcode')
            if (lbpc) {
                var pc = unescape(lbpc)
                postcode.val(pc)
                var map = $('#map')
                if (map.length)
                    $.get("/geolocate", { postcode: pc.replace(/\s/g, "") })
                    .done(function (data) {
                        map.lbmap('setHome', data[0], data[1])
                    })
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var map = $('#map')
                    if (map.length)
                        map.lbmap('setHome', position.coords.latitude, position.coords.longitude)
                    $.get("/geolocate", { lat: position.coords.latitude, lon: position.coords.longitude })
                    .done(function (data) {
                        postcode.val(data)
                        $.lbcookie.create('lbpostcode', data, 7)
                    })
                    // $.lbcookie.create('LBhomeloc', position.coords.longitude + "," + position.coords.latitude)
                }, function () {
                    //self.handleNoGeolocation()
                });
            } // Browser doesn't support Geolocation
            else {
                //this.handleNoGeolocation()
            }
        }
    }

    $("#searchForm").on('submit', function (e) {
        e.preventDefault()
        if (!$(this).valid()) return
        ///
        // set action rewrite url -> restaurants/:postcode/:service?(&q=bla+bla)(&rating=1)(&cuisines=1+2+3)
        var postcode = $('#postcode').attr('name', '').val().replace(/\s/g, "").toUpperCase()
        if ($('#keyword').val() == '') $('#keyword').attr('name', '')
        //var d = $('[name="m"]').attr('name', '').val()
        //delivery type
        //var dt = $('[name="dt"]:checked').attr('name', '').val()
        var dta = []
        $('button.dt.active').each(function () {
            dta.push($(this).data('value'))
        })
        dt = dta.length == 3 ? '' : dta.join('&')
        //distance (default 1)
        if ($('[name="m"]').val() == 1 || dt == 'delivery') $('[name="m"]').attr('name', '')
        //rating
        if ($('[name="r"]:checked').val() == 0) $('[name="r"]:checked').attr('name', '')
        //limit
        if ($('[name="l"]').val() == 20) $('[name="l"]').attr('name', '')
        //sortyby
        if ($('[name="s"]').val() == 'distance') $('[name="s"]').attr('name', '')
        var query = $(this).find(':not([type="checkbox"])').serialize()
        //cousines
        var cousines = $(this).find('[name="c"]:checked').map(function () {
            return this.value
        }).get().join("+")
        query += (cousines.length > 0 ? ((query.length > 0 ? '&' : '') + 'c=' + cousines) : '')
        var location = this.action + '/' + postcode + (dt ? ('/' + dt) : '') + (query.length > 0 ? ('?' + query) : '')
        window.location = location
    })
    if (!$("#cuisines li.hide").lenght) {
        $("#searchForm .more").addClass('hide')
    }
    $("#searchForm .more").on('click', function (e) {
        e.preventDefault()
        $('#cuisines li.hidden, #cuisines li.shown').toggleClass('hidden').toggleClass('shown')
        $(this).toggleClass('less')
        return false
    })
    var $searchboxes = $('#opre, #cude, #arma')
    $searchboxes.on('show', function () {
        var head = $(this).siblings('h3')
        head.addClass('in').find('.icon-large').removeClass('icon-caret-right').addClass('icon-caret-down')
        //$searchboxes.not(this).collapse('hide')
        var self = this;
        $searchboxes.not(this).each(function () {
            if ($(this).hasClass('in')) {
                $(this).collapse('hide')
                var offset = $('body').data('offset') || 0;
                if ($('html').scrollTop() > 0) $('html').scrollTop($(head).offset().top) // - container.offset().top + container.scrollTop())
                // Or you can animate the scrolling:
                /*container.animate({
                    scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
                });​*/
            }
        })
    }).on('hide', function () {
        $(this).siblings('h3').find('.icon-large').removeClass('icon-caret-down').addClass('icon-caret-right')
    }).on('hidden', function () {
        $(this).siblings('h3').removeClass('in')
    })
    $('.dt').on('click', function () {
        var dt = $(this).data('value')
        $('#seldist').toggleClass('hide', (dt == 'delivery'))
    })

    $('.vendorInfo.popover .close').on('click', function (e) {
        var pop = $(this).closest('.vendorInfo')
        var p = $('li[data-id="' + pop.data('popout') + '"]')
        pop.removeClass('in').removeAttr('style').detach().appendTo(p)
    })
    $('.vendor_links .i').on('click', function (e) {
        e.preventDefault()
        var $this = $(this)
        var li = $this.closest('li')
        var pop = $('[data-popout="' + li.data('id') + '"]')
        if (pop.hasClass('in')) {
            pop.removeClass('in').removeAttr('style').detach().appendTo(li)
        } else {
            $('.in[data-popout]').each(function () {
                var p = $('li[data-id="' + $(this).data('popout') + '"]')
                $(this).removeClass('in').removeAttr('style').detach().appendTo(p)
            })
            var elem = this
            pop.detach().appendTo('body').addClass('in')
            var offsetWidth = Math.floor(elem.offsetWidth / 2)
            var placement = li.is(':nth-child(3n)') ? Math.floor(pop[0].offsetWidth) - Math.floor(elem.offsetWidth * 1.5) : offsetWidth
            pop.find('.arrow').css({
                left: placement + offsetWidth
            })
            pop.css({
                top: Math.floor(elem.documentOffsetTop) + Math.floor(elem.offsetHeight),
                left: Math.floor(elem.documentOffsetLeft) - placement
            })
        }
    })
    $('.tabbed').each(function () {
        var tab = $(this).find('.tab');
        tab.find('label').each(function () {
            $(this).width($(this).width() + 20)
        })
        tab.find('input[type="radio"]').on('change', function () {
            var content = $(this).siblings('div');
            var contentHeight = 0;
            content.children().each(function () {
                contentHeight += $(this).outerHeight(true);
            });
            //var offset = content.offset().top - $this.parent().offset().top,
            //    maxHeight = content.outerHeight() + offset;
            contentHeight += (content.outerHeight() - content.height() + content.offset().top - tab.offset().top);
            if (tab.height() < contentHeight) {
                tab.css('height', contentHeight);
            } else {
                tab.css('height', '');
            }
        });
    })
    $('.social_icons .close').on('click', function () {
        $(this).parents('.dropdown').removeClass('open')
    })
    $('.social_icons form').on('click', function (e) {
        e.stopPropagation()
    })
    // only show map when collapse opened
    //$('#arma').on('show', function () {
    //    var map = $(this).find('[data-spy="map"]')
    //    map.lbmap(map.data())
    //})
    $('.rho').on('click', function (e) {
        e.preventDefault()
        var target = $(e.currentTarget).data('target')
        $('#cude').collapse('show')
        setTimeout(function () {
            $('html,body').animate({
                'scrollTop': document.getElementById(target).documentOffsetTop - 110
            }, 200)
        }, 350)
    })
    /*$('#register .button').on('click', function () {
        // var inputs = $("#register input:visible").validator();
        // perform validation programmatically
        // inputs.data("validator").checkValidity();
        var href = $(this).attr('href');
        var tab = $('#register .nav-tabs a[href="' + href + '"]');
        if (tab.closest('.disabled').length === 0)
            tab.tab('show');
        return false;
    });*/
    // window.setTimeout(function () { $('#menu #deals').collapse(); }, 3000);
    /*$('#categories a[data-target]').on('click', function (e) {
        //e.preventDefault()
        //return false
    })*/

    $('#rest-rewiews').each(function () {
        var $this = $(this)
        var slug = $this.data('slug')
        $this.load('/restaurants/' + slug + '/reviews', function () {
            $('a[href="#' + $this.closest('.tab-pane').attr('id') + '"] i').removeClass('icon-refresh icon-spin').addClass('icon-comments')
        })
    })
    $('img.cvv').popover({
        trigger: 'hover',
        html: true,
        content: function () {
            return $(this).clone().css({ margin: '0px', height: 'auto' })
        }
    })
    //$('.user-info .edit').on('click', function () {
    //    $('.user-info .tgle').css({ 'display': 'block' })
    //})
});