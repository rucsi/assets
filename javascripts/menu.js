$().ready(function () {

    $('#categories').affix({
        offset: {
            bottom: 285
        }
    })
    var offset = $('body').data('offset') || 0
    $('#categories li a').click(function (e) {
        e.preventDefault();
        $($(this).attr('href'))[0].scrollIntoView();
        scrollBy(0, -offset);
    });

    var $menu_deals = $('#menu #deals')
    $menu_deals.addClass('hidden in')
    var menu_deals_height = $menu_deals.height()
    $menu_deals.removeClass('hidden in')
    $menu_deals.on('show', function () {
        $(this).closest('.container').css({
            'margin-bottom': '+=' + menu_deals_height
        })
    }).on('hide', function () {
        $(this).closest('.container').css({
            'margin-bottom': '-=' + menu_deals_height
        })
    });
    $menu_deals.add('#minf, #mcat').on('show', function () {
        $(this).parent().find('h3.toggle .icon-large').removeClass('icon-caret-down').addClass('icon-caret-up')
    }).on('hide', function () {
        $(this).parent().find('h3.toggle .icon-large').removeClass('icon-caret-up').addClass('icon-caret-down')
    });
    $('#price-list .dish_info').popover({
        offset: 10,
        trigger: 'hover',
        html: true,
        container: '#price-list',
        placement: function (tip, element) {
            return $(element).closest('li').is(':nth-child(3n)') ? 'left' : 'right'
        },
        title: function () {
            return $(this).find('.menu_detail .title').html()
        },
        content: function () {
            return $(this).find('.menu_detail .content').html()
        }
    })/*.on('mouseenter', function () {
        //$(this).find('.dish_detail').addClass('in')
        $(this).popover('show')
        //e.preventDefault();
    }).on('mouseleave', function () {
        //$(this).find('.dish_detail').removeClass('in')
        $(this).popover('hide')
    })*/
    /*$('input#qty').on('change', function () {
        $(this).closest('form.order_form').find('a.qty span')
    })*/

    $('#menu form.order_form .modal').on('hide', function () {
        if (!$(this).find('[name="cartId"]').val()) {
            var p = $(this).parent()
            p.find('a.qty span').text($(this).find('input[name="qty"]').val())
            var prefhtml = ''
            $(this).find('input[name="preferences"]:checked').each(function () {
                prefhtml += $(this).parent('label').text() + '<br>'
            })
            p.find('.pref_detail .content').html(prefhtml)
        }
        else
            $(this).resetForm('[name="cartId"]')
    })
    $('#menu a.qty').popover({
        offset: 10,
        trigger: 'hover',
        html: true,
        placement: 'top',
        title: function () {
            return $(this).parent().find('.pref_detail .title').html()
        },
        content: function () {
            return $(this).parent().find('.pref_detail .content').html()
        }
    })/*.on('mouseenter', function () {
        //$(this).find('.dish_detail').addClass('in')
        $(this).popover('show')
        //e.preventDefault();
    }).on('mouseleave', function () {
        //$(this).find('.dish_detail').removeClass('in')
        $(this).popover('hide')
    })*/
    /*$('#menu button.add').on('click', function () {
        $.lbshopbag.addItem($(this).data('id'))
    })*/

    var imagedisp = function (container, element, display) {
        container.find('li.active').removeClass('active')
        element.parent().addClass('active')
        var thumb = display.find('.thumbnail')
        thumb.children().addClass('flipOutX')
        var desc = display.find('.displ-desc')
        desc.find('p').addClass('fadeOutDown')
        if (desc)
            setTimeout(function () {
                thumb.html(element.children().clone().addClass('animated flipInX'))
                var title = element.attr('title')
                if (title)
                    desc.find('p').remove()
                desc.find('i').addClass('icon-double-angle-down').removeClass('icon-double-angle-up')
                desc.append($('<p/>').text(title).addClass('animated fadeInDown'))
            }, 750)
    }

    $(".imagedisp").each(function () {
        var $imgdisp = $(this)
        var $disp = $imgdisp.find('.displ')
        $imgdisp.find("li > a").on('click', function (e) {
            e.preventDefault()
            var $this = $(this)
            imagedisp($imgdisp, $this, $disp)
        })
        $imgdisp.find('.displ-sh').on('click', function () {
            $disp.find('.displ-desc p').toggle()
            $(this).find('i').toggleClass('icon-double-angle-down icon-double-angle-up')
        })
        // imagedisp($imgdisp, $imgdisp.find('.active > a'), $disp)
    })

    $('.customize').each(function () {
        var $customize = $(this)
        var $price = $customize.find('.prc')
        var $qty = $customize.find('input[name="qty"]')
        var qty_prev = Number($qty.val() || 1)
        var orig_val = Number($price.text())
        $qty.on('change', function () {
            var $input = $(this)
            var prc = Number($price.text()) || orig_val
            var val = Number($input.val()) || 1
            if (isNaN(val) || !val) {
                val = 1
                $input.val(1)
            }
            var curr_prc = (prc / (qty_prev || 1)) * val
            qty_prev = val
            $price.text(curr_prc.toFixed(2))
        })
        $customize.find('.prefgrp').each(function () {
            var $this = $(this)
            var sc_prev_val = $(this).find('input[type="radio"]:checked').val();
            var sc_prev = 0
            if (this.sc_prev_val)
                sc_prev = Number($customize.find('input[name="preferences[' + this.sc_prev_val.value + '][surcharge]"]').val() || 0)
            $this.find('input[type="radio"]').on('change', function () {
                var $input = $(this)
                if (this.value) {
                    var sc = Number($customize.find('input[name="preferences[' + this.value + '][surcharge]"]').val() || 0)
                    var val = Number($price.text())
                    var qty = Number($qty.val()) || 0
                    val = val + sc * qty - sc_prev * qty
                    sc_prev = sc
                    $price.text(val.toFixed(2))
                }
            })
            var checked = []
            var payable = Number($this.find('.preflabel input[type="hidden"]').val() || 0)
            $this.find('input[type="checkbox"]').on('change', function () {
                var $input = $(this)
                if (this.value) {
                    var sc = Number($customize.find('input[name="preferences[' + this.value + '][surcharge]"]').val() || 0)
                    var val = Number($price.text())
                    if ($input.is(':checked')) {
                        checked.push(sc)
                    }
                    else {
                        checked = _.without(checked, sc)
                    }
                    var sorted = checked.sort()
                    var qty = Number($qty.val()) || 0
                    val = orig_val * qty
                    for (var i = 0; i < sorted.length; i++) {
                        if (i >= payable)
                            val += (sorted[i] * qty)
                    }
                    $price.text(val.toFixed(2))
                }
            })
        })
    })
});