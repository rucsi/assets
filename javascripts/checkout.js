var OrderModel = Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
        total: '0.00',
        insufficient: false
    }
});
var CheckoutCollection = Backbone.Collection.extend({
    model: OrderModel,
    url: '/checkout'
});
var OrderView = Backbone.View.extend({
    events: {
        'change select[name$="[delivery]"]': 'deliveryChange',
        'change select[name$="[payment]"]': 'paymentChange',
        'changeDate .datepicker': 'dateChange',
        'changeDate .timepicker': 'dateChange',
        'change .datepicker': 'setDateTime',
        'change .timepicker': 'setDateTime'
    },
    initialize: function (options) {
        if (options && options.corporate)
            this.corporate = options.corporate
        if (options && options.event)
            this.event = options.event
        this.template = new Hogan.Template(lb.templates.orders)
        this.partials = {
            checkoutCart: new Hogan.Template(lb.templates.checkoutCart)
        }
        if (!this.model.get('date')) {
            var now = this.setNextQuarter(new Date())
            this.model.set({ 'date': now })
        }
        this.$el.attr({ 'data-id': this.model.get('_restaurant')[0]._id })
        this.model.on('change:delivery change:payment', this.renderCart, this)
        this.model.on('change:total', this.setTotal, this)
        this.model.on('change:date', this.setDate, this)
        this.cart = new CartCollection(this.model.get('cart'))
    },
    deliveryChange: function (e) {
        var value = e.currentTarget.value
        this.model.set({ 'delivery': value })
    },
    paymentChange: function (e) {
        var value = e.currentTarget.value
        this.model.set({ 'payment': value })
    },
    dateChange: function (e) {
        var date = this.setNextQuarter(e.date)
        this.model.set({ 'date': date })
        if (e.currentTarget == this.$datepicker.get(0)) {
            this.$timepicker.datetimepicker('update', date)
        }
        else {
            this.$datepicker.datetimepicker('update', date)
        }
        //this.$el.find('.orderdate').val(date)
    },
    setDateTime: function () {
        var daystr = this.getDateString()
        this.$datepicker.find('input[readonly]').prop('value', daystr.day)
        this.$timepicker.find('input[readonly]').prop('value', daystr.time)
        this.model.set({ 'asap': daystr.time == 'ASAP' })
    },
    setTotal: function () {
        this.$el.find('.ototal').val(this.model.get('total').toFixed(2))
    },
    setDate: function () {
        this.$('.orderdate').val(this.model.get('date'))
    },
    setPreferences: function () {
        if (this.model.get('delivery') == 'eatin') {
            this.$('.peopleno').show()
            this.$('[data-rel="eatin"]').show()
            this.$('[data-opp="eatin"]').hide()
            if (this.$('.sel_pm').val() == 'cash')
                this.$('.sel_pm').val('')
        }
        else {
            this.$('.peopleno').hide().val('')
            this.$('[data-rel="eatin"]').hide()
            this.$('[data-opp="eatin"]').show()
            if (this.$('.sel_pm').val() == 'inhouse')
                this.$('.sel_pm').val('')
        }
    },
    render: function () {
        this.$el.html(this.template.render(this.createViewModel()))
        this.renderCart()
        var now = new Date()
        this.setNextQuarter(now)
        var $orderdate = this.$el.find('.orderdate')

        this.$datepicker = this.$el.find('.datepicker').datetimepicker({
            thicon: 'calendar',
            format: "dd/mm/yyyy",
            startDate: now,
            todayBtn: 'linked',
            maxView: 2,
            forceParse: false,
            minView: 2,
            autoclose: true,
            linkField: $orderdate
        })
        this.$timepicker = this.$el.find('.timepicker').datetimepicker({
            thicon: 'time',
            format: "hh:ii",
            startDate: now,
            minView: 0,
            maxView: 1,
            startView: 'minute',
            minuteStep: 15,
            forceParse: false,
            asapBtn: 'linked',
            autoclose: true,
            linkField: $orderdate
        })
        var date = this.model.get('date')
        this.$datepicker.datetimepicker('update', date)
        this.$timepicker.datetimepicker('update', date)
        this.setDateTime()
        return this
    },
    renderCart: function () {
        this.$el.find('.chcart').html(this.partials.checkoutCart.render(this.getCart()))
        this.setPreferences()
    },
    createViewModel: function () {
        var idx = this.model.collection.models.indexOf(this.model)
        var srv = this.model.get('_restaurant')[0]._services[0]
        var restvm = _.extend(this.model.get('_restaurant')[0], {
            services: _.extend(srv, {
                cost: ((srv.cost && srv.cost > 0) ? srv.cost : false),
                chargecard: ((srv.chargecard && srv.chargecard > 0) ? srv.chargecard : false),
                noCash: (srv.cardonly || (srv.advancepay && !this.model.get('delivery') === 'pickup')),
                servicecharge: ((srv.servicecharge && srv.servicecharge > 0) ? srv.servicecharge : false)
            })
        })
        var today = this.getDateString()
        var vm = _.extend(this.model.toJSON(), {
            idx: idx,
            isLast: (idx == this.model.collection.models.length - 1),
            day: today.day,
            time: today.time,
            restaurant: restvm,
            address: this.model.get('_address')[0],
            corporate: this.corporate || null,
            event: this.event || null
        })

        return vm
    },
    getDateString: function () {

        var d = this.model.get('date')
        var curr_minute = d.getMinutes()
        if (curr_minute < 10) curr_minute = '0' + curr_minute
        var curr_hour = d.getHours()
        if (curr_hour < 10) curr_hour = '0' + curr_hour
        var curr_date = d.getDate()
        if (curr_date < 10) curr_date = '0' + curr_date
        var curr_month = d.getMonth() + 1
        if (curr_month < 10) curr_month = '0' + curr_month
        var curr_year = d.getFullYear()

        var asap = new Date(d)
        asap.setTime(this.setNextQuarter(d).getTime() + 900000)
        var asap_minute = asap.getMinutes()
        if (asap_minute < 10) asap_minute = '0' + asap_minute
        var asap_hour = asap.getHours()
        if (asap_hour < 10) asap_hour = '0' + asap_hour
        var asap_date = asap.getDate()
        if (asap_date < 10) asap_date = '0' + asap_date
        var asap_month = asap.getMonth() + 1
        if (asap_month < 10) asap_month = '0' + asap_month
        var asap_year = asap.getFullYear()

        var tooearly = new Date()
        tooearly.setHours(tooearly.getHours() + 1)

        var curr_time = curr_hour + ":" + curr_minute + " - " + asap_hour + ":" + asap_minute
        if (asap < tooearly)
            curr_time = 'ASAP'
        var curr_day = curr_date + "/" + curr_month + "/" + curr_year
        if (curr_year == tooearly.getFullYear() && curr_month == tooearly.getMonth() + 1) {
            var day = tooearly.getDate()
            if (curr_date == day)
                curr_day = 'Today'
            else if (curr_date == day + 1)
                curr_day = 'Tomorrow'
        }
        return {
            day: curr_day,
            time: curr_time
        }
    },
    setNextQuarter: function (time) {
        time.setSeconds(0)
        time.setMilliseconds(0)
        var diff = (time.getMinutes() % 15)
        var mins = diff ? 15 - diff : 0
        time.setTime(time.getTime() + mins * 1000 * 60)
        return time
    },
    getCart: function () {
        var cart = this.extendCart()
        var surcharges = this.getSurcharges()
        var deals = this.getDeals()
        var savings = Math.abs(this.savings(deals)).toFixed(2)
        var total = this.getTotal(cart, surcharges, deals)
        this.model.set('total', total)
        var srv = this.model.get('_restaurant')[0]._services[0]
        var min = this.model.get('delivery') === 'delivery' ? srv.minimum : srv.minamount
        var missing = (Number(min) || 0) - total
        if (!this.event)
            this.model.set('insufficient', (missing > 0))
        return {
            cart: cart,
            deals: deals,
            surcharges: surcharges,
            total: total.toFixed(2),
            insufficient: missing > 0,
            missing: missing.toFixed(2),
            savings: savings
        }
    },
    extendCart: function () {
        return _.extend(_.map(this.cart.models, function (item) {
            var preferences = _.map(item.get('preferences'), function (pref) {
                return _.extend(pref, {
                    surchargefix: pref.surcharge > 0 ? '( +£' + Number(pref.surcharge).toFixed(2) + ' )' : ''
                })
            })
            return _.extend(item.toJSON(), {
                preferences: preferences,
                pricefix: Number(item.get('price')).toFixed(2),
                sum: (Number(item.fullprice()) * Number(item.get('qty'))).toFixed(2)
            })
        }), {
            count: this.cart.getCount(),
            total: this.cart.getTotal().toFixed(2)
        })
    },
    getDeals: function (dealsTotal) {
        var deals = [], appliedMultis = [], appliedMeals = []
        var multiValue = 0, mealValue = 0
        var dealGroups = _.sortBy(_.groupBy(_.filter(this.model.get('_restaurant')[0].deals,
            function (o) { return this.isDealValid(o); }, this),
            function (o) { return o.type; }),
            "type").reverse()
        //function (o) { return (255 - o[0].type.charCodeAt(0)); });
        var orderidx = this.model.collection.models.indexOf(this.model)
        _.each(dealGroups, function (group) {
            _.each(group, function (deal) {
                if (deal.type == 'multibuy') {
                    if (deal.items.length) {
                        _.each(this.cart.models, function (ci) {
                            if (ci.get('qty') >= Math.floor(deal.offValue)) {
                                if (_.any(deal.items, function (oi) {
                                    return ((ci.get('itemId') == oi.item) &&
                                        (!_.difference(oi.preferences, _.pluck(ci.get('preferences'), '_id')).length))
                                })) {
                                    if (deal.isValue) {
                                        var multi = Math.floor(ci.get('qty') / Math.floor(deal.offValue))
                                        var value = multi * (Number(deal.overValue) - ci.fullprice() * Number(deal.offValue))
                                        if (value != 0) {
                                            multiValue += value
                                            deals.push({ oid: deal._id, name: deal.name, value: value.toFixed(2), orderidx: orderidx, absValue: Math.abs(value).toFixed(2) })
                                            appliedMultis.push({ deal: deal._id, item: ci, value: value })
                                        }
                                    } else {
                                        var multi = Math.floor(ci.get('qty') / Math.floor(deal.offValue))
                                        var value = -multi * (Number(deal.offValue) - Number(deal.overValue)) * ci.fullprice()
                                        if (value != 0) {
                                            multiValue += value
                                            deals.push({ oid: deal._id, name: deal.name, value: value.toFixed(2), orderidx: orderidx, absValue: Math.abs(value).toFixed(2) })
                                            appliedMultis.push({ deal: deal._id, item: ci, value: value })
                                        }
                                    }
                                }
                            }
                        }, this)
                    }
                }
                else if (deal.type == 'meal') {
                    if (deal.items.length) {
                        var remaining = _.without(this.cart.models, appliedMeals)
                        var mealItems = []
                        var isMealDeal = _.every(deal.items, function (di) {
                            return _.any(remaining, function (ci) {
                                if ((ci.get('itemId') == di.item) &&
                                        (!_.difference(di.preferences, _.pluck(ci.get('preferences'), '_id')).length)) {
                                    mealItems.push(ci)
                                    return true
                                }
                                return false
                            })
                        })
                        if (isMealDeal && mealItems.length) {
                            appliedMeals = _.union(appliedMeals, mealItems)
                            var mealSum = _.reduce(mealItems, function (sum, mi) { return sum + mi.fullprice(); }, 0)
                            var mealMultis = _.filter(appliedMultis, function (ai) {
                                return mealItems.indexOf(ai.item) != -1
                            })
                            var multiSum = _.reduce(mealMultis, function (sum, mi) { return sum + mi.value; }, 0)
                            if (deal.isValue) {
                                var value = (Number(deal.offValue) - mealSum)
                                if (value != 0) {
                                    var newDeal = { oid: deal._id, name: deal.name, value: value.toFixed(2), orderidx: orderidx, absValue: Math.abs(value).toFixed(2) }
                                    if (mealMultis.length) {
                                        if (value < multiSum) {
                                            multiValue -= multiSum
                                            deals = _.reject(deals, function (d) {
                                                return _.any(mealMultis, function (mi) { return mi.deal == d.oid })
                                            })
                                            mealValue += value
                                            deals.push(newDeal)
                                        }
                                    } else {
                                        mealValue += value
                                        deals.push(newDeal)
                                    }
                                }
                            } else {
                                var value = -(Number(deal.offValue) / 100 * mealSum)
                                if (value != 0) {
                                    var newDeal = { oid: deal._id, name: deal.name, value: value.toFixed(2), orderidx: orderidx, absValue: Math.abs(value).toFixed(2) }
                                    if (mealMultis.length) {
                                        if (value < multiSum) {
                                            multiValue -= multiSum
                                            deals = _.reject(deals, function (d) {
                                                return _.any(mealMultis, function (mi) { return mi.deal == d.oid })
                                            })
                                            mealValue += value
                                            deals.push(newDeal)
                                        }
                                    } else {
                                        mealValue += value
                                        deals.push(newDeal)
                                    }
                                }
                            }
                        }
                    }
                }
                else if (deal.type == 'gift') {
                    if (deal.items.length) {
                        if (deal.isValue) {

                        } else {

                        }
                    }
                }
                else if (deal.type == 'deal') {
                    var total = this.cart.getTotal() + multiValue + mealValue
                    if (total >= Number(deal.overValue)) {
                        var dealValue
                        if (deal.isValue)
                            dealValue = -Number(deal.offValue)
                        else
                            dealValue = -(Number(deal.offValue) / 100) * Number(total)
                        if (dealValue != 0) {
                            var existDeal = _.find(deals, function (o) { return o.type == 'deal' })
                            var newDeal = { oid: deal._id, name: deal.name, value: dealValue.toFixed(2), type: 'deal', orderidx: orderidx, absValue: Math.abs(dealValue).toFixed(2) }
                            if (!existDeal)
                                deals.push(newDeal)
                            else if (Number(existDeal.value) > dealValue)
                                deals.splice(deals.indexOf(existDeal), 1, newDeal)
                        }
                    }
                }
            }, this)
        }, this)
        return deals
    },
    getSurcharges: function () {
        var surcharges = []
        var orderidx = this.model.collection.models.indexOf(this.model)
        var src = this.model.get('_restaurant')[0]._services[0]
        if (this.model.get('delivery') === 'delivery') {
            if (src.cost > 0)
                surcharges.push({ id: 'delivery', name: 'Delivery cost', value: src.cost, orderidx: orderidx })
        }
        else if (this.model.get('delivery') === 'eatin') {
            if (src.servicecharge > 0)
                surcharges.push({ id: 'servicecharge', name: 'Service charge', value: (this.cart.getTotal() * (Number(src.servicecharge) / 100)), orderidx: orderidx })
        }
        if (this.model.get('payment') === 'card')
            if (src.chargecard > 0)
                surcharges.push({ id: 'chargecard', name: 'Surcharge for card payments', value: src.chargecard, orderidx: orderidx })
        return surcharges
    },
    getTotal: function (cart, surcharges, deals) {
        return Number(cart.total) + this.serviceCost(surcharges) + this.savings(deals)
    },
    serviceCost: function (surcharges) {
        return _.reduce(_.pluck(surcharges, 'value'), function (sum, sc) { return sum + Number(sc); }, 0)
    },
    savings: function (deals) {
        return _.reduce(_.pluck(deals, 'value'), function (sum, off) { return sum + Number(off); }, 0)
    },
    isDealValid: function (deal) {
        if (deal.everyday) return true
        var ot = this.model.get('time')
        var date;
        if (ot)
            date = new Date(ot)
        else {
            date = new Date()
            date.setHours(date.getHours() + 1)
        }
        var day = date.getDay() - 1
        if (day < 0) day = 6
        if (deal.valid[day].isOpen) {
            if (deal.valid[day].open == -1 && deal.valid[day].close == -1) return true
            else {
                var zulu = date.getHours() * 100 + date.getMinutes()
                return deal.valid[day].open <= zulu && deal.valid[day].close > zulu
            }
        }
        return false
    }
})

var CheckoutView = Backbone.View.extend({
    el: $('.ordersSection'),
    events: {
        'change select[name$="[delivery]"]': 'deliveryChange',
        'change select[name$="[payment]"]': 'paymentChange',
        //'submit': 'submitOrder',
        'click .btn-paypal': 'paypal',
        //'lbvalidate': 'addValidation'
    },
    initialize: function (options) {
        if (options && options.corporate)
            this.corporate = options.corporate
        if (options && options.event)
            this.event = options.event
        this.collection = new CheckoutCollection()
        this.collection.bind("reset", this.render, this);
        this.collection.on('change:total', this.setOrderFields, this)
        if (!this.event)
            this.collection.on('change:insufficient', this.allowCheckout, this)
        this.collection.reset(options.checkout)
    },
    addValidation: function () {
        // at this pont lbvalidation is already initialized hence the script is among the commons
        if (this.event) {
            $('#checkoutForm input[name$="[userName]"]').each(function () {
                $(this).rules("add", {
                    required: true,
                    messages: {
                        required: "Please enter your full name"
                    }
                })
            })
        }
        else {
            $('#checkoutForm select[name$="[delivery]"]').each(function () {
                $(this).rules("add", {
                    required: true,
                    messages: {
                        required: "Please select pickup or delivery"
                    }
                })
            })
            $('#checkoutForm select[name$="[payment]"]').each(function () {
                $(this).rules("add", {
                    required: true,
                    messages: {
                        required: "Please select a payment method"
                    }
                })
            })
            $('#checkoutForm input[name$="[peopleno]"]').each(function () {
                var name = $(this).attr('name').replace('peopleno', 'delivery')
                var iseatin = 'select[name="' + name + '"] option[value="eatin"]:selected'
                $(this).rules("add", {
                    required: iseatin,
                    number: true,
                    messages: {
                        required: "Please set the number of people"
                    }
                })
            })
        }
    },
    render: function () {
        this.$el.empty()
        this.collection.each(function (order) {
            this.renderOrder(order)
        }, this)
        this.addValidation()
    },
    renderOrder: function (o) {
        var orderView = new OrderView({
            model: o,
            corporate: this.corporate,
            event: this.event
        })
        this.$el.append(orderView.render().el)
    },
    setOrderFields: function () {
        var total = _.reduce(this.collection.models, function (sum, o) { return sum + Number(o.get('total')); }, 0)
        var card = _.reduce(_.filter(this.collection.models,
            function (o) { return o.get('payment') == 'card' }),
            function (sum, o) { return sum + Number(o.get('total')); }, 0)
        var pmtFlds = $('#pmtFlds')
        pmtFlds.find('input[name="payment[amount]"]').val(total.toFixed(2))
        pmtFlds.find('input[name="paypoint[fltAmount]"]').val(card.toFixed(2))
        var description = _.reduce(this.collection.models, function (desc, o) {
            return desc + _.reduce(o.get('cart'), function (cdesc, ci) {
                return cdesc + (ci.qty + ' ' + ci.name + ' ' + _.reduce(ci.preferences, function (pdesc, pref) {
                    return pdesc + pref.name + ' '
                }, '')) + ','
            }, '') + '|'
        }, '')
        pmtFlds.find('input[name="paypoint[strDesc]"]').val(description.slice(0, description.length - 2))
    },
    allowCheckout: function () {
        if (_.any(this.collection.pluck('insufficient')))
            $('.chkoutbtns .btn').attr({ 'disabled': 'disabled' })
        else
            $('.chkoutbtns .btn').removeAttr('disabled')

    },
    deliveryChange: function (e) {
        var target = $(e.currentTarget)
        //var deliveryTypes = this.$el.find('input[name$="[delivery]"]')
        var deliveryTypes = this.$el.find('select[name$="[delivery]"]')
        var value = target.find('option:selected').val()
        if (!this.delivery_set) {
            //var value = target.val()
            //deliveryTypes.filter('[value="' + value + '"]').not(target).attr({ 'checked': 'checked' })
            deliveryTypes.find('option[value="' + value + '"]').not(target).attr({ 'selected': 'selected' })
            var chForm = $('#checkoutForm')
            if (chForm.length)
                chForm.data('lbvalidate').elemvalidate(deliveryTypes)
        }
        this.delivery_set = true
        //var hasDelivery = deliveryTypes.filter('[value="delivery"]:checked').length
        var hasDelivery = deliveryTypes.find('option[value="delivery"]:selected').length
        if (!hasDelivery) {
            $('#addrFlds').addClass('hide')
            $('#addrFlds input').val('')
        }
        else
            $('#addrFlds').removeClass('hide')
    },
    paymentChange: function (e) {
        var target = $(e.currentTarget)
        var paymentMethods = this.$el.find('select[name$="[payment]"]')

        // only one type of payment available
        //if (!this.payment_set) {
        var value = target.find('option:selected').val()
        paymentMethods.find('option[value="' + value + '"]').not(target).attr({ 'selected': 'selected' })
        var chForm = $('#checkoutForm')
        if (chForm.length)
            chForm.data('lbvalidate').elemvalidate(paymentMethods)
        //}
        //this.payment_set = true

        var paySelected = paymentMethods.find('option:selected')
        var payValue = paySelected.val()
        var hasCash = payValue.indexOf("cash") > -1
        var hasCard = payValue.indexOf("card") > -1 || paySelected.hasClass('card')
        var hasPaypal = payValue.indexOf("paypal") > -1

        if (!hasCard) {
            $('#pmtFlds').addClass('hide')
            $('#pmtFlds input').val('')
            $('#pmtFlds option:selected').removeAttr('selected')
        }
        else
            $('#pmtFlds').removeClass('hide')
        if (hasPaypal) {
            $('.chkoutbtns button').addClass('hide')
            $('.chkoutbtns .paypal').removeClass('hide')
        }
        else {
            $('.chkoutbtns button').removeClass('hide')
            $('.chkoutbtns .paypal').addClass('hide')
        }
    },
    paypal: function () {
        console.log('checkout with paypal')
    }
});

$(function () {
    $(window).on('load', function () {
        $('[data-checkout]').each(function () {
            var $spy = $(this)
            lb.checkout = new CheckoutView($spy.data())
        })
    })
});