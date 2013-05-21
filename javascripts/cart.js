var cartrowTemplate = "<td>{{name}}</td><td class='p'>&pound;{{pricefix}}</td><td class='right'><input class='input-mini' type='number' placeholder='Qty' value='{{qty}}' name='qty' data-val='{{qty}}' /></td><td class='s'>&pound;{{sum}}</td><td class='func'><a href='/cart/edit' data-target='#'><i class='icon-pencil'></i></a></td><td class='func'><a href='/cart/delete' data-target='#'><i class='icon-trash'></i></a></td>"

var ItemModel = Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
        restaurantId: '',
        itemId: '',
        qty: 0,
        name: '',
        price: '',
        comment: '',
        preferences: [/*{
            _id: '',
            name: '',
            surcharge: 0.00
        }*/]
    },
    surcharge: function () {
        return _.reduce(_.pluck(this.get('preferences'), 'surcharge'), function (sum, sc) { return sum + Number(sc); }, 0)
    },
    fullprice: function () {
        return Number(this.get('price')) + this.surcharge()
    },
    total: function () {
        return Number(this.get('qty')) * this.fullprice()
    }
});

var CartCollection = Backbone.Collection.extend({
    model: ItemModel,
    url: '/cart',
    getCount: function () {
        return _.reduce(this.models, function (sum, model) { return sum + Number(model.get('qty')); }, 0)
    },
    getTotal: function () {
        return _.reduce(this.models, function (sum, model) {
            return sum + (model.get('qty') * model.fullprice());
        }, 0)
    },
});

var ItemView = Backbone.View.extend({
    tagName: "tr",
    //className: "item-wrap",
    template: Hogan.compile(cartrowTemplate),
    initialize: function () {
        this.model.on('change', this.update, this)
        //this.model.on('add change remove', this.updateRel, this)
    },
    events: {
        //'click a[href="/cart/edit"]': 'edit',
        //'blur .editInput': 'edited'
        'click a[href="/cart/edit"]': 'edit',
        'click a[href="/cart/delete"]': 'remove',
        'blur input[name="qty"]': 'setqty'
    },
    render: function () {
        //this.$el.attr({'data-id': cartItem.id, data-item-id=cartItem.itemId)
        var vm = _.extend(this.model.toJSON(), {
            pricefix: Number(this.model.get('price')).toFixed(2),
            sum: (Number(this.model.fullprice()) * Number(this.model.get('qty'))).toFixed(2)
        })
        //this.$el.attr({ title: this.model.get('comment') || this.model.get('title') })
        this.setPreferences()
        this.$el.html(this.template.render(vm))
        //this.updateRel(vm.itemId, vm.qty)
        return this;
    },
    setPreferences: function () {
        /*var opts = $('#opts' + this.model.get('itemId'))
        var pref = this.model.get('preferences')
        var prefhtml = this.model.get('comment') || ''
        if (prefhtml) prefhtml += '<br>'
        opts.find('input[name="preferences"]').each(function () {
            var val = this.value
            if (_.any(pref, function (p) {
                return p == val
            })) {
                prefhtml += $(this).parent('label').text() + '<br>'
            }
        })*/
        var item = this.model
        var pref = this.model.get('preferences')
        var prefhtml = this.model.get('comment') || ''
        if (prefhtml) prefhtml += '<br>'
        pref.forEach(function (p) {
            var surcharge = Number(p.surcharge)
            prefhtml += p.name + (surcharge > 0 ? '( +£' + surcharge.toFixed(2) + ' )' : '') + '<br>'
        })
        var pop = this.$el.data('popover')
        if (pop)
            pop.options.content = prefhtml
        else
            this.$el.popover({
                offset: 10,
                trigger: 'hover',
                html: true,
                placement: 'left',
                title: item.get('name') + ' prefences',
                content: prefhtml
            })
    },
    setqty: function (e) {
        var target = e.currentTarget
        if (target.value != target.defaultValue) {
            if (target.value == 0) this.remove(e)
            else {
                this.model.set({ qty: Number(target.value), total: Number(target.value) * this.model.fullprice() })
            }
        }
    },
    update: function () {
        this.model.save()
        this.render()
    },
    edit: function (e) {
        e.stopPropagation()
        e.preventDefault()
        var itemId = this.model.get('itemId')
        var pref = $('#opts' + itemId)
        if (pref.length) {
            this.setOptions(pref)
            pref.modal('show')
        }
        else {
            var self = this
            var target = $(e.currentTarget)
            target.on('modalReady', function () {
                pref = $('#opts' + itemId)
                self.setOptions(pref)
                pref.on('submit', function (e) {
                    e.preventDefault()
                    self.model.collection.trigger('updated', pref)
                })
            })
            target.loadModal('/cart/' + itemId + '/edit', true)
        }
    },
    remove: function (e) {
        var self = this
        var itemId = this.model.get('itemId')
        this.model.destroy({
            success: function () {
                self.$el.popover('destroy')
                self.$el.remove()
            }
        })
        e.preventDefault()
    },
    setOptions: function (form) {
        form.find('[name="cartId"]').val(this.model.get('_id'))
        form.find('[name="qty"]').val(this.model.get('qty'))
        form.find('[name="comment"]').val(this.model.get('comment'))
        var opts = this.model.get('preferences')
        var cart = this
        form.find('input[name^="preferences"]').each(function () {
            var val = this.value
            if (!val)
                this.checked = (opts.legth == 0)
            else
                this.checked = _.any(opts, function (pref) {
                    return pref._id == val
                })
        })

        /*form.find('select[name^="preferences"], .btn-group[name^="preferences"]').each(function () {
            var $this = $(this)
            $this.children().each(function () {
                var $child = $(this)
                var val = $child.is('option') ? $child.attr('value') : $child.data('value')
                if (val) {
                    var selected = _.find(opts, function (pref) { return pref._id == val })
                    if (selected) {
                        if ($this.is('select')) {
                            $this.val(selected._id)
                            return false;
                        }
                        else {
                            $child.addClass('active')
                        }
                    }
                }
        
            })
        })*/
    }
});

var CartView = Backbone.View.extend({
    el: $('#shopbag tbody'),
    events: {},
    initialize: function () {
        _.bindAll(this, 'fetchSuccess');
        this.collection = new CartCollection()
        this.count = 0
        this.total = 0
        this.shopbag = {
            el: $('#shopbag'),
            count: $('#shopbag .badge, #shopbag tfoot td.c'),
            total: $('#shopbag tfoot td.s'),
            rel: $('[rel="cart"]')
        }
        this.collection.on('add', this.renderItem, this)
        this.collection.on('add change remove', this.updateCart, this)
        this.collection.on('updated', this.submited, this)
        this.setBindings()
        this.collection.fetch({
            success: this.fetchSuccess
        })
    },
    setBindings: function () {
        this.shopbag.el.find('table').on('click', function (e) {
            e.stopPropagation()
            //e.preventDefault()
        })
        var cart = this
        $('form[data-cart]').on('submit', function (e) {
            e.preventDefault();
            cart.submited($(this))
        })
    },
    submited: function (form) {
        var data = form.serializeObject()
        this.setItem(data, form)
        form.find('[name="cartId"]').val('submited')
        form.find('[name="qty"]').val('1')
        if (form.hasClass('modal')) form.modal('hide')
        form.find('.modal').modal('hide')
        this.showMessage()
    },
    /*formatPreferences: function (data) {
        var pref = []
        Object.keys(data).forEach(function (key) {
            if (key.indexOf('preferences') !== -1) {
                if (typeof data[key] !== 'object')
                    data[key] = [data[key]]
                pref.push(data[key])
                delete data[key]
            }
        })
        data['preferences'] = pref
        //data['preferences[]'].forEach(function (pref, i) {
        //    data.preferences[i] = JSON.parse(pref)
        //})
    },*/
    fetchSuccess: function (collection, response) {
        this.render()
        this.updateCart()
        //this.trigger('cartReady', this)
    },
    render: function () {
        this.collection.each(function (item) {
            this.renderItem(item)
        }, this)
    },
    renderItem: function (item) {
        var itemView = new ItemView({
            model: item
        })
        this.$el.append(itemView.render().el)

    },
    formatItem: function (item, form) {
        this.getPreferences(item, form) //this.getPrefPrice(item.itemId)
        var im = new ItemModel(item)
        //item.price = Number(item.price)
        item.qty = Math.floor(item.qty)
        item.surcharge = im.surcharge()
        item.fullprice = im.fullprice()
        item.total = im.total()
        delete item['cartId']
        return item
    },
    getPreferences: function (data, form) {
        var prefs = []
        /*var prefgroups = form.find('select[name^="preferences"], .btn-group[name^="preferences"]')
        _.each(prefgroups, function (group) {
            var pg = $(group)
            var key = pg.attr('name')
            var sortedprefs = _.sortBy(_.filter(pg.children(), function (child) {
                var $child = $(child)
                return $child.is('option') ? $child.is(':selected') : $child.hasClass('active')
            }), function (child) {
                var $child = $(child)
                var attrib = $child.is('option') ? $child.attr('value') : $child.data('value')
                return Number(data['preferences[' + attrib + '][surcharge]'])
            })
            var payafterval = $('[rel="' + key + '"]').val()
            var payafter = isNaN(payafterval) ? 0 : Number(payafterval)
            _.each(pg.children(), function (child) {
                var $child = $(child)
                var val = $child.is('option') ? $child.attr('value') : $child.data('value')
                if (val) {
                    if ($child.is('option') ? $child.is(':selected') : $child.hasClass('active')) {
                        var sortpos = sortedprefs.indexOf(child)
                        var p = {
                            _id: val,
                            name: data['preferences[' + val + '][name]'],
                            surcharge: (sortpos < payafter ? 0 : Number(data['preferences[' + val + '][surcharge]'])) + ''
                        }
                        prefs.push(p)
                    }
                    delete data['preferences[' + val + '][name]']
                    delete data['preferences[' + val + '][surcharge]']
                }
            })
            delete data[key]
        })*/
        var prefgroups = _.groupBy(form.find('input[name^="preferences"]').filter(':checkbox, :radio'), 'name')
        _.each(prefgroups, function (group, key) {
            var sortedprefs = _.sortBy(_.filter(group, function (inp) { return inp.checked }), function (inp) { return Number(data['preferences[' + inp.value + '][surcharge]']) })

            var payafterval = $('[rel="' + key + '"]').val()
            var payafter = isNaN(payafterval) ? 0 : Number(payafterval)
            _.each(group, function (input) {
                var val = input.value
                if (val) {
                    if (input.checked) {
                        var sortpos = sortedprefs.indexOf(input)
                        var p = {
                            _id: val,
                            name: data['preferences[' + val + '][name]'],
                            surcharge: (sortpos < payafter ? 0 : Number(data['preferences[' + val + '][surcharge]'])) + ''
                        }
                        prefs.push(p)
                    }
                    delete data['preferences[' + val + '][name]']
                    delete data['preferences[' + val + '][surcharge]']
                }
            })
            delete data[key]
        })
        data.preferences = prefs
    },
    /*getPreferences: function (item) {
        var prefs = []
        if (item.preferences) {
            if (!item.preferences.push)
                item.preferences = [item.preferences]
            item.preferences.forEach(function (pref) {
                if (pref) {
                    var p = {
                        _id: pref,
                        name: item['preferences[' + pref + '][name]'],
                        surcharge: Number(item['preferences[' + pref + '][surcharge]']),
                    }
                    prefs.push(p)
                }
            })
        }
        item.preferences = prefs
    },*/
    /*getPrefPrice: function (itemId) {
        var opts = $('#opts' + itemId)
        var prefPrice = 0
        opts.find('input[name="preferences"]:checked').each(function () {
            prefPrice += Number($(this).parent('label').find('.sch').text() || 0)
        })
        return prefPrice
    },*/
    setItem: function (item, form) {
        var cartId = item.cartId
        this.formatItem(item, form)
        if (cartId) { //update
            var itemModel = this.collection.get(cartId)
            if (itemModel) {
                /*if (cartdata == 'add')
                    item.qty = Number(itemModel.get('qty')) + item.qty*/
                itemModel.set(item)
            }
        } else { // 
            var cartItem = this.compareToCart(item)
            if (cartItem) { //amend
                item.qty = Number(cartItem.get('qty')) + item.qty
                if (cartItem.get('comment') !== item.comment) item.comment += cartItem.get('comment')
                cartItem.set(item)
            }
            else //new
                this.collection.create(item, { wait: true })
        }
    },
    compareToCart: function (item) {
        return this.collection.find(function (model) {
            var modelPref = _.pluck(model.get('preferences'), '_id')
            var itemPref = _.pluck(item.preferences, '_id')
            if (model.get('itemId') !== item.itemId ||
            (!modelPref && itemPref || modelPref && !itemPref || modelPref.length !== itemPref.length
            || _.difference(modelPref, itemPref).length))
                return false
            return true
        })
    },
    updateCart: function () {
        var empty = this.collection.length == 0
        this.shopbag.el.toggleClass('hide', empty)
        this.shopbag.rel.toggleClass('disabled', empty)
        // set count and total
        this.count = this.getCount()
        this.total = this.getTotal()
    },
    showMessage: function () {
        var msg = this.shopbag.el.find('#sb-msg')
        msg.css({ 'display': 'block' }).addClass('in')
        _.delay(function () {
            msg.removeClass('in')
            _.delay(function () { msg.css({ 'display': '' }) }, 200)
        }, 2000)
    },
    getCount: function () {
        var count = this.collection.getCount()
        this.shopbag.count.text(Math.floor(count))
        return count
    },
    getTotal: function () {
        var total = this.collection.getTotal()
        this.shopbag.total.text('£' + total.toFixed(2))
        return total
    },
    getSurcharge: function (item) {

    }
});

$(function () {
    lb.cart = new CartView()
});