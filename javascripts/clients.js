var OutstandingOrderModel = Backbone.Model.extend({
});
var OutstandingOrderView = Backbone.View.extend({
    el: $('#outstg'),
    template: Hogan.compile('<span>{{outstg}}</span>'),
    partials: {
        title: Hogan.compile("{{outstg}} outstanding order")
    },
    initialize: function () {
        this.model.on('change:outstg', this.render, this)
    },
    render: function () {
        this.$el.html(this.template.render(this.model.toJSON()))
        this.$el.attr({ 'data-original-title': this.partials.title.render(this.model.toJSON()) + (this.model.get('outstg') > 1 ? 's' : '') })
        return this
    },
    change: function (outstg) {
        this.model.set({ 'outstg': outstg })
    },
    add: function () {
        this.change(this.model.get('outstg') + 1)
    }
});
$().ready(function () {

    // https://github.com/twitter/bootstrap/issues/3217
    $('.modal').detach().appendTo($('body'))

    // test: orderNotification({ id: 123 });
    if (lb.authenticated) {
        var orderNotification = function (order) {
            alertify.success('<h4>Order</h4>Incoming order, <a href="/orders/' + order.data._id + '">see details</a>.');
            if (lb.dashboard)
                lb.dashboard.addOrder(order.data)
            lb.outstg.add()
        }

        lb.socket.on('order', orderNotification);
        alertify.set({ delay: 10000 });
    }

    //themes, change CSS with JS
    //default theme(CSS) is default
    var current_theme = $.lbcookie.read('current_theme') || 'default'
    $('#themes a[data-value="' + current_theme + '"]').find('i').addClass('icon-ok')

    $('#themes a').click(function (e) {
        e.preventDefault()
        var new_theme = $(this).attr('data-value')
        if (new_theme == 'default') {
            $.lbcookie.erase('current_theme')
        } else {
            $.lbcookie.create('current_theme', new_theme, { expires: 365 })
        }
        //switch_theme(new_theme)
        $('#bs-css').attr('href', $('#bs-css').attr('href').replace(current_theme, new_theme))
        current_theme = new_theme
        $('#themes i').removeClass('icon-ok')
        $(this).find('i').addClass('icon-ok')
    });

    //function switch_theme(theme_name) {
    //    if (current_theme)
    //        $('#bs-css').attr('href', $('#bs-css').attr('href').replace(current_theme, theme_name))
    //    else
    //        $('#bs-css').attr('href', '/assets/themes/bootstrap-' + theme_name + '.css')
    //}

    $('[data-spy="cancel"]').on('click', function () {
        window.history.back();
    })
    $('[data-outstg]').each(function () {
        var $spy = $(this)
        var outstg = $spy.data('outstg')
        lb.outstg = new OutstandingOrderView({ model: new OutstandingOrderModel({ outstg: outstg }) }).render()
    })
    var $restaurantForm = $("#restaurantForm")
    var setRel = function (rel, disable) {
        if (disable) {
            rel.each(function () {
                var $this = $(this)
                if ($this.is(':radio') || $this.is(':checkbox')) {
                    if ($this.is(':checked')) {
                        $this.removeAttr('checked')
                        $this.trigger('change')
                    }
                }
                else if ($this.is('select'))
                    $this.find('option[selected]').removeAttr('selected')
                else this.value = ''
            })
            var validate = $restaurantForm.data('lbvalidate')
            if (validate) {
                validate.elemvalidate(rel)
                rel.closest('.control-group').removeClass('success error')
            }
        }
        rel.attr({ 'disabled': disable })
    }
    $restaurantForm.find('input[type="checkbox"][value="true"]').on('change', function () {
        var name = $(this).attr('name')
        var rel = $('input[rel*="' + name + '"]')
        if (rel.length > 0) {
            setRel(rel, !this.checked)
        }
        var opp = $('input[opp*="' + name + '"]')
        if (opp.length > 0) {
            setRel(opp, this.checked)
        }
    })
    $restaurantForm.find('.notify button').on('hidden', function (e) {
        e.preventDefault()
        return false
    }).on('click', function () {
        var $btn = $(this)
        var name = $btn.attr('name')
        var active = $btn.hasClass('active')
        var relBtn = $('button[data-rel="' + name + '"]')
        if (!active)
            relBtn.trigger('click')
        var check = $('input[type="checkbox"][data-rel="' + name + '"]')
        if (!active)
            check.attr({ 'checked': 'checked' })
        else
            check.removeAttr('checked')
        var rel = $('input[type="text"][data-rel="' + name + '"]')
        if (rel.length > 0) {
            setRel(rel, active)
        }
    })//.on('mouseenter', function (e) {
    //    e.preventDefault()
    //    $(this).find('.tt').tooltip('show')
    //}).on('mouseleave', function (e) {
    //    e.preventDefault()
    //    $(this).find('.tt').tooltip('hide')
    //})
    //dealForm
    $('#eydy').on('change', function () {
        if (this.checked) {
            var days = $('#dly input')
            days.attr({
                'disabled': 'disabled'
            })
            var daysch = days.filter(':checked')
            daysch.removeAttr('checked')
            daysch.trigger('change')
        } else $('#dly input').removeAttr('disabled')
    })
    if ($('#eydy').is(':checked')) $('#dly input').attr({
        'disabled': 'disabled'
    })
    var setDealInput = function (isValue) {
        var inp = $('#ofoff')
        var val = inp.val()
        var p = inp.parent()
        if (isValue) {
            inp.addClass('fix2')
            p.addClass('input-prepend').removeClass('input-append')
            p.find('span.add-on').each(function () {
                var $this = $(this)
                if ($this.hasClass('pre')) $this.show()
                else $this.hide()
            })
            if (val && !isNaN(val)) inp.val((Number(val)).toFixed(2))
        } else {
            inp.removeClass('fix2')
            p.removeClass('input-prepend').addClass('input-append')
            p.find('span.add-on').each(function () {
                var $this = $(this)
                if ($this.hasClass('pre')) $this.hide()
                else $this.show()
            })
            if (val && !isNaN(val)) inp.val(Math.floor(val))
        }
    }
    var setOverInput = function (isValue) {
        var inp = $('#ofover')
        var val = inp.val()
        var p = inp.parent()
        if (isValue) {
            inp.addClass('fix2')
            p.addClass('input-prepend').removeClass('input-append')
            p.find('span.add-on').each(function () {
                var $this = $(this)
                if ($this.hasClass('pre')) $this.show()
                else $this.hide()
            })
            if (val && !isNaN(val)) inp.val((Number(val)).toFixed(2))
        } else {
            inp.removeClass('fix2')
            p.removeClass('input-prepend').addClass('input-append')
            p.find('span.add-on').each(function () {
                var $this = $(this)
                if ($this.hasClass('pre')) $this.hide()
                else $this.show()
            })
            if (val && !isNaN(val)) inp.val(Math.floor(val))
        }
    }
    $('#ofisVal').on('change', function () {
        var dealtype = $('#dealForm input[name="deal[type]"]:checked').val()
        if (dealtype == 'deal' || dealtype == 'meal') setDealInput(this.checked)
        else setOverInput(this.checked)
    })
    var $dealForm = $('#dealForm')
    $dealForm.find('.tt').on('hidden', function (e) {
        e.preventDefault()
        return false
    })
    $dealForm.find('.dtl').on('mouseenter', function (e) {
        e.preventDefault()
        $(this).find('.tt').tooltip('show')
    }).on('mouseleave', function (e) {
        e.preventDefault()
        $(this).find('.tt').tooltip('hide')
    })
    $dealForm.find('input[name="deal[type]"]').on('change', function () {
        var value = this.value
        var show = $('[data-show*="' + value + '"]')
        show.css({ 'display': (!this.checked ? 'none' : '') })

        var hide = $('[data-hide*="' + value + '"]')
        hide.css({ 'display': (this.checked ? 'none' : '') })
        var ofoff = $('#ofoff')
        var plh = ofoff.closest('.control-group').find('label:visible').text()
        ofoff.attr({ 'placeholder': plh })
        var ofover = $('#ofover')
        var plh = ofover.closest('.control-group').find('label:visible').text()
        ofover.attr({ 'placeholder': plh })
        $('#ofisVal').trigger('change')
        //$('#dealForm label[data-ot="' + this.value + '"], #dealForm label[data-ot^="!"]:not("[data-ot="!' + this.value + '"]")').each(function () {
        //    var $this = $(this)
        //    var text = $this.text()
        //    $this.nextAll('.controls:first').find('input[type="text"]').attr({
        //        'placeholder': text
        //    })
        //})

        //$('#dealForm [data-ot]').not('input').addClass('hide')
        //$('#dealForm [data-ot="' + this.value + '"]').removeClass('hide')
        //if (this.value !== 'deal') {
        //    $('#dealForm [data-ot="!deal"]').removeClass('hide')
        //    setDealInput()
        //} else {
        //    setOverInput(true)
        //}
        //if (this.value !== 'multibuy') {
        //    $('#dealForm [data-ot="!multibuy"]').removeClass('hide')
        //}
        //if (this.value !== 'gift')
        //    $('#dealForm [data-ot="!gift"]').removeClass('hide')
        //if (this.value !== 'meal')
        //    $('#dealForm [data-ot*="!meal"]').removeClass('hide')

    })
    $('.opening input[type="checkbox"]').on('change', function () {
        var cg = $(this).closest('.control-group')
        cg.find('label:not(".checkbox")').toggleClass('hide', !this.checked)
        if (!this.checked) {
            var sel = cg.find('select')
            if (sel.length) {
                sel.val('')
                sel.closest('form').data('lbvalidate').elemvalidate(sel)
            }
            cg.find('.control-group').removeClass('success error')
        }
    })
    $('.hctd').find('td[rel="popover"]').each(function () {
        var td = $(this)
        td.popover({
            content: function () {
                return td.find('.content').html()
            }
        })
    })

    $('#uploader').h5uploader();
    $('.img-edit-btn').on('click', function (e) {
        var $this = $(this)
        var data = $this.data()
        launchEditor(data.id, data.url)
        //$.imageEditor.launch(data.id, data.url, {
        //    onLoad: function () {
        //        $('.img-edit-btn').toggle();
        //    },
        //    onSave: function (imageId, newUrl) {
        //        $.post('/images/' + imageId + '/save', { newUrl: newUrl }, function (res) {
        //            $('#' + imageId).attr('src', res.url);
        //            $('#updated-' + imageId).val(res.updated);
        //        });
        //    }
        //})
    })
    $('.img-select').on('modalReady', function (e, modal) {
        var self = $(this)
        var $modal = $(modal)
        var container = self.closest('.controls')
        var control = self.data('control')
        if (control)
            control = self.closest(control)
        else
            control = container
        var srcInput = control.find('.imgSrc')
        var thumb = control.find('.thumb')
        var src = srcInput.val()
        var imgremove = control.find('.img-remove')
        if (src) $modal.find("input[name='image'][value='" + src + "']").attr({
            'checked': 'checked'
        })
        $modal.find('.pagination').lbpaginate({
            items_per_page: 5,
            content: $modal.find('.modal-body .control-group')
        })
        $modal.find('.save').on('click', function () {
            container.trigger('save', [self])
            var inp = $modal.find("input[name='image']:checked")
            if (inp.length > 0) {
                var img = inp.nextAll('img')
                srcInput.val(inp.val())
                thumb.attr({
                    src: img.attr('src')
                })
                imgremove.removeClass('hide')
            }
        })
        $modal.find('.cancel').on('click', function () {
            var inputs = $modal.find("input[name='image']")
            inputs.each(function (e) {
                e.currentTarget.value = e.currentTarget.defaultValue
            })
            var rem = !inputs.filter(':checked').length
            container.trigger('cancel', [self, rem])
        })
        //$modal.find('.save').on('click', function () {
        //    var $inp = $modal.find("input[name='image']:checked")
        //    if ($inp.length > 0) {
        //        var data = $inp.data()
        //        $.imageEditor.launch(data.id, data.url, {
        //            onSaveButtonClicked: function (imageID) {

        //            },
        //            onSave: function (imageId, newUrl) {
        //                $.post('/images/' + imageId + '/save', { newUrl: newUrl }, function (res) {
        //                    srcInput.value = res.updated
        //                    thumb.attr({ src: res.url })
        //                    //var img = $inp.nextAll('img')
        //                    //srcInput.val($inp.val())
        //                    //thumb.attr({ src: img.attr('src') })
        //                    imgremove.removeClass('hide')
        //                });
        //            }
        //        })
        //    }
        //})
        $modal.find('.img-uploader-button').h5uploader().on('uploadComplete', function (e, response) {
            if (response) {
                srcInput.val(response.path)
                thumb.attr({
                    src: response.url
                })
                $modal.modal('hide')
                imgremove.removeClass('hide')
            }
        })
    })


    $('.img-remove').on('click', function () {
        var container = $(this).closest('.controls')
        var srcInput = container.find('.imgSrc')
        var thumb = container.find('.thumb')
        srcInput.val('')
        thumb.attr({
            src: 'http://placehold.it/100&text=n+/+a'
        })
        $(this).addClass('hide')
    })

    //function showPreview(coords) {
    //    // var imageW = ???
    //    // var imageH = ???
    //    // var previewW = ???
    //    // var previewH = ???
    //    var rx = previewW / coords.w;
    //    var ry = previewH / coords.h;
    //    $('#preview').css({
    //        width: Math.round(rx * imageW) + 'px',
    //        height: Math.round(ry * imageH) + 'px',
    //        marginLeft: '-' + Math.round(rx * coords.x) + 'px',
    //        marginTop: '-' + Math.round(ry * coords.y) + 'px'
    //    });
    //}
    //$('#jcrop_target').Jcrop({
    //    onChange: showPreview,
    //    onSelect: showPreview,
    //    aspectRatio: 1
    //});

    var addrem_add = function (element) {
        var container = element.closest('.add-rem')
        var lasttr = container.find('tbody>tr:last')
        lasttr.clone(true).insertAfter(lasttr).find('input').each(function () {
            $(this).val('')
        })
        lasttr.find('.remove').removeClass('hide')
        lasttr.find('.add, .img-select').remove()
        container.trigger('add')
    }
    var addrem_rem = function (element) {
        var container = element.closest('.add-rem')
        var row = element.closest('tr')
        if (!row.is(':last-child')) {
            row.remove()
            container.trigger('remove')
        }
    }
    var addrem_submit = function (element, name, id) {
        var rc = 0
        element.find('.add-rem table tbody>tr').each(function () {
            var $row = $(this)
            var idval = $row.find(id).val()
            //if name is empty remove row
            if (idval) {
                $row.find('input, textarea').each(function () {
                    var incname = $(this).attr('name').replace(name + '[]', name + '[' + rc + ']')
                    $(this).attr({
                        'name': incname
                    })
                })
                rc++
            } else $row.remove()
        })

    }
    $('.add-rem').on('add remove', function (e) {
        e.preventDefault()
    })
    $('#images .add-rem').on('save', function (e, element) {
        addrem_add(element)
    }).on('cancel', function (e, element, remove) {
        if (remove)
            addrem_rem(element)
    })
    $('.add-rem .add').on('click', function () {
        addrem_add($(this))
        return false
    })
    $('#preferencesForm').on('add', function (e) {
        e.preventDefault()
        var lastop = $('#preferencesForm select>option:last')
        var lastopval = Number(lastop.val())
        lastop.clone(true).insertAfter(lastop).removeAttr('selected').val(lastopval + 1).text(lastopval + 1)
    })
    $('.add-rem .remove').on('click', function () {
        addrem_rem($(this))
        return false
    })
    $('#preferencesForm').on('remove', function (e) {
        e.preventDefault()
        var lastop = $('#preferencesForm select>option:last')
        if (lastop.is(':selected')) lastop.prev().attr({
            selected: 'selected'
        })
        lastop.remove()
    })

    $('#preferencesForm input[name="preference[multi]"]').on('change', function () {
        if (this.checked) $('#preferencesForm select').removeAttr('disabled')
        else $('#preferencesForm select').attr({
            disabled: 'disabled'
        }).find(':selected').removeAttr('selected').end().find('option:first').attr({
            selected: 'selected'
        })
    })

    $('#preferencesForm').on('submit', function () {
        addrem_submit($(this), '[option]', 'input[name="preference[option][][name]"]')
    })
    $('#restaurantForm').on('submit', function () {
        addrem_submit($(this), 'pictures', 'input[name="pictures[][image]"]')
    })
    $('#orderStatus a').on('click', function (e) {
        e.preventDefault();
        var filter = $(this).data('filter')
        var tbodyRows = $('#ordersTable tbody tr')
        tbodyRows.show()
        if (filter)
            tbodyRows.not(filter).hide()
        $('#status').text($(this).text() + ' ')
    })
    $('img.pop').popover({
        trigger: 'hover',
        html: true,
        content: function () {
            return $(this).clone().css({ 'max-width': '100%', 'max-height': '100%' })
        }
    })

    $('#import').each(function () {
        var $element = $(this)
        var $input = $element.find('input')
        $element.find('button').click(function () {
            $input.click()
            return false
        })
        $input.on('change', function () {
            var file = this.files[0]
            if (!file || !(file.type.match(/application\/vnd.ms-excel|text\/plain/) && file.name.match(/\.csv$|\.txt$/))) {
                $element.find('.alert').removeClass('hide').find('.fn').text(file.name)
                $input.val('')
            }
            else
                $element.submit()
        })
    })
});