(function (window, undefined) {
    if (!window['lb']) {
        window.lb = {
            templates: {}
        }
    }
})(window);
// Avoid `console` errors in browsers that lack a console.
(function () {
    var method;
    var noop = function () { };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());
$(document).ready(function () {

    // https://github.com/twitter/bootstrap/issues/3217
    // $('.modal').detach().appendTo($('body'))

    if (lb.authenticated) lb.socket = io.connect();

    ///function getOffset(el) {
    //    if (el.getBoundingClientRect)
    //        return el.getBoundingClientRect()
    //    else {
    //        var x = 0, y = 0;
    //        do {
    //            x += el.offsetLeft - el.scrollLeft
    //            y += el.offsetTop - el.scrollTop
    //        }
    //        while (el = el.offsetParent)
    //        return { "left": x, "top": y }
    //    }
    //}

    window.Object.defineProperty(Element.prototype, 'documentOffsetTop', {
        get: function () {
            return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop : 0);
        }
    })
    window.Object.defineProperty(Element.prototype, 'documentOffsetLeft', {
        get: function () {
            return this.offsetLeft + (this.offsetParent ? this.offsetParent.documentOffsetLeft : 0);
        }
    })
    jQuery.event.special.destroyed = {
        remove: function (o) {
            if (o.handler) {
                o.handler()
            }
        }
    }
    // prepends an event handler to the callback queue
    $.fn.onPre = function (type, fn) {
        type = type.split(/\s+/)
        this.each(function () {
            var len = type.length
            while (len--) {
                $(this).on(type[len], fn)
                var evt = $._data(this, 'events')[type[len].replace(/\..+$/, '')]
                evt.splice(0, 0, evt.pop())
            }
        })
    }
    $.fn.modalContent = function (html, novalidate) {
        var self = $(this)
        //var container = $('<div class="modal hide in"/>')
        var modal = $('<div/>').html(html).find('[data-async]').addClass('modal fade')
        //if (form.data('spy') == 'validate') {
        if (modal.is('form') && !novalidate)
            modal.lbvalidate({
                submitHandler: asyncformSubmit
            })
        //}
        //form.on('submit', asyncformSubmit)
        var allModal = $('modal, modal-backdrop')
        $('body').append(modal)
        self.trigger('modalReady', modal)
        modal.modal()
            .on('show', function () {
                allModal.removeClass('in')
                self.trigger('modalShow', this)
            })
            .on('shown', function () {
                self.trigger('modalShown', this)
            })
            .on('hide', function () {
                self.trigger('modalHide', this)
            })
            .on('hidden', function () {
                allModal.last('modal-backdrop').removeClass('in')
                allModal.last('modal').removeClass('in')
                $(this).remove()
            })
        return modal
    }
    $.fn.loadModal = function (url, novalidate) {
        var self = $(this)
        $.get(url, function (data) {
            self.modalContent(data, novalidate)
        }).success(function () {
            $('input:text:visible:first').focus()
        })
    }
    $(document).ajaxError(function (e, xhr, settings, exception) {
        if (xhr.status == 500) {
            /*var container = $('<div class="modal hide in"/>')
            container.append('<button class="close" aria-hidden="true" data-dismiss="modal" type="button">')
            var content = $('<div class="alert alert-error">')
            content.text(xhr.responseText)
            container.append(content)
            container.modal()*/
            console.log(xhr)
        }
        return false;
    })
    $.fn.resetForm = function (empty) {
        $(this).find('input, select, textarea').each(function () {
            if ($(this).is(':radio') || $(this).is(':checkbox'))
                this.checked = this.defaultChecked
            else if ($(this).is(empty))
                this.value = ''
            else
                this.value = this.defaultValue
        })
    }
    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    }
    var asyncformSubmit = function (form, e) {
        var $form = $(form);
        e.preventDefault();
        $.ajax({
            url: form.action,
            type: form.method,
            data: $form.serialize(),
            success: function (data) {
                if ($form.hasClass('modal')) $form.modal('hide')
                var loc = $form.data('async-location')
                if (loc) {
                    if (loc === 'back') window.history.back()
                    else if (loc === 'reload') location.reload()
                    else if (loc === 'modal') $form.modalContent(data)
                    else window.location = loc
                }
                var cb = $form.data('async-callback')
                if (cb) $form.trigger(cb, data)
            },
            error: function (err) {
                $form.find('.info').addClass('alert alert-error').text(err.responseText)
                return false
            }
        })
    }
    $('[rel ="popover"]').popover()
    $('[rel ="tooltip"]').tooltip()
    /*$('form [type="reset"]').on('click', function () {
        
    })*/
    $('form[data-async]').on('submit', function (e) {
        var form = $(this)
        if (form.valid())
            asyncformSubmit(this, e)
    })
    //$('form[data-async]').lbvalidate({ submitHandler: asyncformSubmit })
    // https://gist.github.com/1688900
    // Support for AJAX loaded modal window.
    // Focuses on first input textbox after it loads the window.
    $('[data-toggle="modal"]').on('click', function (e) {
        var self = $(this)
        var url = self.attr('href')
        if (url.indexOf('#') == 0) {
            $(url).modal('show');
        } else {
            self.loadModal(url)
        }
        e.preventDefault()
        e.stopPropagation()
    })
    $('input.uc').on('keyup', function (e) {
        var code = (e.keyCode ? e.keyCode : e.which)
        if (code >= 65 && code <= 90)
            this.value = this.value.toUpperCase()

    })
    $('input.lc').on('keyup', function (e) {
        var code = (e.keyCode ? e.keyCode : e.which)
        if (code >= 97 && code <= 122)
            this.value = this.value.toLowerCase()
    })
    $('input.num').on('keyup', function () {
        if (this.value && isNaN(this.value))
            this.value = this.value.slice(0, -1)
    })
    $('input.fix2').on('blur', function () {
        var val = parseFloat(this.value)
        if (val) {
            this.value = val.toFixed(2)
        }
    })
    $('[data-spy="cancel"]').on('click', function (e) {
        e.preventDefault()
        window.history.back()
    })
    $('.tabbable[rel="fsvalidate"]').on('submit', function (e) {
        var tabbable = $(this)
        var form = tabbable.children('form:first')
        tabbable.find('li:not(.active) a[data-toggle="tab"]').each(function () {
            var $this = $(this)
            var tab = $($this.attr('href'))
            var lbvalidate = form.data('lbvalidate')
            if (!lbvalidate.tabvalidate(tab)) {
                e.preventDefault()
                e.stopPropagation()
                $this.tab('show')
                lbvalidate.fsvalidate(tab)
                return false
            }
        })
    })
    $('.tabbable[rel="fsvalidate"] a[data-toggle="tab"]').on('show', function (e) {
        //e.target // activated tab
        //e.relatedTarget // previous tab
        var fieldset = $($(e.relatedTarget).attr('href') + ' fieldset')
        var form = fieldset.closest('form')
        if (!form.data('lbvalidate').fsvalidate(fieldset)) {
            e.target = e.relatedTarget
            e.preventDefault()
        }
    })
    $('.tab-pane .next').on('click', function (e) {
        e.preventDefault()
        $(this).closest('.tabbable').find('.nav-tabs li.active').next().find('a[data-toggle="tab"]').click();
    })
    $('.tab-pane .prev').on('click', function (e) {
        e.preventDefault()
        $(this).closest('.tabbable').find('.nav-tabs li.active').prev().find('a[data-toggle="tab"]').click();
    })
    $('[data-spy="wait"]').on('click', function (e) {
        var form = $(this).closest('form')
        if (form && form.valid()) {
            $(this).button('loading')
            $('#pleasewait').modal({ keyboard: false, backdrop: 'static' }).on('click.modal', function (e) {
                var $element = $(this)
                $element.removeClass('animated')
                    .removeClass('shake');

                setTimeout(function () {
                    $element
                        .addClass('animated')
                        .addClass('shake');
                }, 0);

                this.focus();
            })
           return true
        }
        else {
            e.preventDefault()
        }
    })
});