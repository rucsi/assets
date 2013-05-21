/* =============================================================
 * LBshopbag api
 * ============================================================== */
!
function($) {
    "use strict";
    // jshint ;_;
    /* LBshopbag CLASS DEFINITION
     * ========================== */

    function LBshopbag(options) {
        if(this[options]) {
            this[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if(typeof options === 'object' || !options) {
            this.initialize.apply(this, arguments);
        } else {
            $.error('Method ' + options + ' does not exist on LBshopbag');
        }
        return this
    }
    LBshopbag.prototype = {
        constructor: LBshopbag,
        initialize: function() {
            var self = this
            this.$shopbag = $('[data-spy="shopbag"]')
            this.$sbag = $('#shopbag')
            this.$bag = $('a[href="/shopbag"]')
            this.$badge = this.$bag.find('.badge')
            this.$sbudmsg = $('#sbudmsg')
            this.$chekout = $('a[href="/checkout"], a[href="/order"]')
            this.$totals = this.$shopbag.find('tfoot td.s')
            this.$qty = this.$shopbag.find('tfoot td.c')
            this.$shopbag.on('click', function(e) {
                e.stopPropagation()
                e.preventDefault()
            })

            this.$shopbag.find('tbody tr').each(function() {
                var row = $(this)
                self.bindRow(row)
            })
            this.$shopbag.on('shopbagChange', function() {
                console.log('shopbagChange');
            })
        },
        bindRow: function(row) {
            var self = this
            row.find('a').on('click', function() {
                var element = row.find('input[name="qty"]').val(0)
                self.updateRow(row, element.get(0))
            }).end().find('input').on('change', function() {
                self.updateRow(row, this)
            })
        },
        addItem: function(id) {
            var row = this.$shopbag.find('tr[data-id="' + id + '"]')
            if(row.length) {
                var element = row.find('input[name="qty"]')
                element.val(Number(element.val()) + 1)
                this.updateRow(row, element.get(0))
            } else {
                this.getItem(id)
            }
        },
        getItem: function(id) {
            var self = this

            $.ajax({
                url: '/shopbag/' + id,
                type: 'post',
                data: {
                    order: order
                },
                success: function(data) {
                    self.setRow(data)
                },
                error: function(err) {
                    return false
                }
            })
        },
        updateRow: function(row, element) {
            if(element.defaultValue != element.value) {
                var itemId = row.data('item-id')
                // get rows need to be updated
                var rws = this.$shopbag.find('tr[data-item-id="' + itemId + '"]')
                // add effect
                var effect = element.value == 0 ? 'error' : 'success'
                rws.addClass(effect)
                this.$badge.addClass(effect)
                //$chekout.addClass('disabled')
                this.$chekout.button('loading')

                var prc = Number(row.find('td.p').text().replace(/[^0-9\.]+/g, ""))
                // get updated item
                var self = this
                // update item on server
                $.ajax({
                    url: '/cart/' + itemId,
                    type: 'post',
                    data: {
                        qty: Number(element.value)
                    },
                    success: function(data) {
                        self.update(element, rws, prc, effect)
                    },
                    error: function(err) {
                        var errors = JSON.parse(err.responseText)
                        return false;
                    }
                })
            }
        },
        update: function(element, rws, prc, effect) {
            var self = this
            // items sum = price * qty
            var sum = (prc * element.value)
            var dif = element.value - element.defaultValue;
            self.setTotals(dif, prc)
            //set current value as old
            element.defaultValue = element.value

            setTimeout(function() {
                // updated rows
                if(element.value == 0) {
                    rws.remove()
                } else {
                    rws.find('td input[name="qty"]').val(element.value)
                    rws.find('td.s').text('£' + sum)
                }
                rws.removeClass(effect)
                self.$badge.removeClass(effect)
            }, 300)
        },
        setTotals: function(dif, prc) { /* totals */
            var qty = Math.floor(this.$qty.first().text()) + dif
            this.$qty.text(qty)
            this.$totals.text('£' + (parseFloat(this.$totals.first().text().replace('£', '')) + (dif * prc)))
            // shopbag items
            this.$badge.text(qty)
            this.$chekout.button('reset')
            if(qty === 0) {
                this.$sbag.removeClass('open')
                this.$sbag.addClass('hide')
                this.$chekout.addClass('disabled')
            } else {
                this.$sbag.removeClass('hide')
                this.$chekout.removeClass('disabled')
            }
        },
        updatemsg: function() {
            var self = this
            this.$sbudmsg.removeClass('hide').addClass('in')
            setTimeout(function() {
                self.$sbudmsg.removeClass('in').addClass('hide')
            }, 750)
        },
        setRow: function(row /*, id, qty*/ ) {
            /*var curr = this.$shopbag.find('tr[data-id="' + id + '"]')
            if (curr.length) {
                var element = curr.find('input[name="qty"]')
                element.val(Number(element.val()) + qty)
                var prc = Number(curr.find('td.p').text().replace(/[^0-9\.]+/g, ""))
                this.update(element.get(0), curr, prc, 'success')
                this.updatemsg()
            } else {*/
            var $row = $(row)
            this.bindRow($row)
            var curr = this.$shopbag.find('tbody tr[data-id="' + $row.data("id") + '"]')
            if(curr.length) curr.html($row.html)
            else this.$shopbag.find('tbody').append($row)
            var prc = Number($row.find('td.p').text().replace(/[^0-9\.]+/g, ""))
            this.setTotals(1, prc)
            this.updatemsg()
            //}
        }

    }
    /* LBshopbag PLUGIN DEFINITION
     * =========================== */
    $.lbshopbag = new LBshopbag()
    /*function (option) {
        //return this.each(function () {
        //    var $this = $(this)
        //    , data = $this.data('lbshopbag')
        //    , options = typeof option == 'object' && option
        //    if (!data) $this.data('lbshopbag', (data = new LBshopbag($this, options)))
        //    if (typeof option == 'string') data[option]()
        //})
        //if (!this.data) this.data = new LBshopbag(options)
        //if (typeof option == 'string') this.data[option]()
    };
    $.lbshopbag.Constructor = LBshopbag;
    $.lbshopbag.defaults = {
    };*/
    /* LBshopbag DATA-API
     * ================== */
    //$(window).on('load', function () {
    //    $.lbshopbag()
    //})
}(window.jQuery);