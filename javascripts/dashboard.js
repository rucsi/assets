var OrderModel = Backbone.Model.extend({
    idAttribute: "_id"
});
var OrderCollection = Backbone.Collection.extend({
    model: OrderModel,
    url: '/orsers'
});
var SummaryModel = Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
        name: '',
        type: '',
        dlvryCnt: [],
        dlvryTtl: []
    },
    sumCount: function (array) {
        return _.reduce(array, function (memo, obj) {
            return memo + Number(obj.count)
        }, 0)
    },
    sortType: function (array) {
        return _.sortBy(array, function (d) {
            switch (d.status) {
                case 'outstanding':
                    return 1
                case 'confirmed':
                    return 2
                case 'completed':
                    return 3
                case 'declined':
                    return 4
                default:
                    return 0
            }
        })
    }
});
var SummaryCollection = Backbone.Collection.extend({
    model: SummaryModel,
    url: '/summary'
});
var DashboardOrdersView = Backbone.View.extend({
    el: $('#dblo'),
    initialize: function () {
        this.template = new Hogan.Template(lb.templates.latestOrders)
        this.collection.on('add', this.append, this)
    },
    render: function () {
        this.$el.empty()
        this.collection.each(function (o) {
            this.$el.append(this.template.render(this.extendModel(o)))
        }, this)
    },
    append: function (order) {
        var dom = $(this.template.render(this.extendModel(order))).css({ 'display': 'none' })
        this.$el.append(dom)
        dom.animate({ //.delay(5000)
            height: 'toggle'
        }, 1500)
    },
    extendModel: function (model) {
        var name = model.get('status')
        var date = new Date(model.get('date'))
        var datetime = model.get('asap') ? 'ASAP' : date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
        return _.extend(model.toJSON(), {
            name: name.substr(0, 1).toUpperCase() + name.substr(1),
            //total: cart.total,
            datetime: datetime
        })
    },
    add: function (order) {
        this.collection.add(order)
    }
});
var SummaryTypeView = Backbone.View.extend({
    initialize: function () {
        this.template = new Hogan.Template(lb.templates.dashboardSummary)
        this.$el.addClass(this.model.get('type'))
        this.model.on('change', this.update, this)
    },
    partials: {
        title: Hogan.compile("{{count}} {{type}} {{status}}"),
        dlvryCnt: Hogan.compile('<div class="bar {{bar}}" data-title="" data-status="{{status}}" style="width: 0%;" ></div>'),
        dlvryTtl: Hogan.compile('<div class="bar {{bar}}" data-title="£" data-placement="bottom" data-status="{{status}}" style="width: 0%;" ></div>')
    },
    render: function () {
        console.log('SummaryTypeView ' + this.model.get('type') + ' render')
        this.$el.html(this.template.render(this.model.toJSON()))
        this.update()
        return this
    },
    renderBar: function (parent, bar, status) {
        var $bar = $(bar)
        switch (status) {
            case 'outstanding':
                parent.prepend($bar)
                break
            case 'confirmed':
                var first = parent.find('.bar[data-status="outstanding"]')
                if (first.length)
                    first.after($bar)
                else
                    parent.prepend($bar)
                break
            case 'completed':
                var last = parent.find('.bar[data-status="declined"]')
                if (last.length)
                    last.before($bar)
                else
                    parent.append($bar)
                break
            case 'declined':
                parent.append($bar)
                break
        }
        return $bar
    },
    update: function () {
        var pw = this.$el.width()
        _.each(this.model.get('dlvryCnt'), function (d) {
            var bar = this.$el.find('.cnt .bar[data-status="' + d.status + '"]')
            if (!bar.length) bar = this.renderBar(this.$el.find('.cnt'), this.partials.dlvryCnt.render(d), d.status)
            bar.attr({ 'data-title': this.partials.title.render(d) })
            bar.animate({
                width: Math.floor(pw * d.percent / 100)
            }, 1500, function () {
                bar.css('width', d.percent + '%')
            })
        }, this)
        _.each(this.model.get('dlvryTtl'), function (d) {
            var bar = this.$el.find('.ttl .bar[data-status="' + d.status + '"]')
            if (!bar.length) bar = this.renderBar(this.$el.find('.ttl'), this.partials.dlvryTtl.render(d), d.status)
            bar.attr({ 'data-title': '£' + this.partials.title.render(_.extend(d, { count: Number(d.count).toFixed(2) })) })
            bar.animate({
                width: Math.floor(pw * d.percent / 100)
            }, 1500, function () {
                bar.css('width', d.percent + '%')
            })
        }, this)
        this.$el.find('.bar').tooltip()
    }
});
var DashboardSummaryView = Backbone.View.extend({
    el: $('#dbo'),
    render: function () {
        this.$el.empty();
        this.collection.each(this.renderType, this)
    },
    renderType: function (smryType) {
        var stv = new SummaryTypeView({
            model: smryType
        }).render().$el
        var dom = this.$el.find('.' + smryType.get('type'))
        if (!dom.length)
            this.$el.append(stv)
        else
            dom.replaceWith(stv)
    },
    createModel: function () {
        var groupDelivery = this.collection.groupBy('delivery')
        var types = _.map(groupDelivery, function (delivery, key) {
            var allOrder = delivery.length
            var groupStatus = _.groupBy(delivery, function (s) { return s.get('status') })
            var name = key.substr(0, 1).toUpperCase() + key.substr(1)
            var deliveryStatus = this.mapDelivery(groupStatus, delivery.length, key)
            return {
                name: name,
                status: key,
                striped: key == 'pickup',
                deliveryStatus: deliveryStatus
            }
        }, this)
        return { deliveryTypes: types }
    },
    mapDeliveryType: function (deliveryTypes, sum) {
        var rdif = 0
        _.each(deliveryTypes, function (ds) {
            ds.percent = this.edgeRound((ds.count / sum) * 1000, rdif) / 10
            switch (ds.status) {
                case 'completed':
                    ds.bar = 'bar-success'
                    break;
                case 'confirmed':
                    ds.bar = 'bar-warning'
                    break;
                case 'declined':
                    ds.bar = 'bar-danger'
                    break;
                case 'outstanding':
                    break
            }
        }, this)
    },
    edgeRound: function (number, rdif) {
        var prc = Math.round(number) - number
        if (rdif > prc) {
            rdif -= Math.abs(prc)
            return Math.floor(number)
        }
        else {
            rdif += Math.abs(prc)
            return Math.ceil(number)
        }
    },
    add: function (order) {
        var summary = this.collection.find(function (dt) { return dt.get('type') == order.delivery; })
        if (!summary) {
            var name = order.delivery.substr(0, 1).toUpperCase() + order.delivery.substr(1)
            summary = new SummaryModel({
                name: name,
                type: order.delivery
            })
            this.model.add(summary)
        }

        var dlvryCnt = summary.get("dlvryCnt")
        var sCnt = _.find(dlvryCnt, function (ds) { return ds.status == order.status; })
        if (!sCnt) {
            sCnt = {
                type: order.delivery,
                status: order.status,
                count: 0
            }
            dlvryCnt.push(sCnt)
        }
        sCnt.count = Number(sCnt.count) + 1
        var sum = summary.sumCount(dlvryCnt)
        this.mapDeliveryType(dlvryCnt, sum)
        summary.set("dlvryCnt", summary.sortType(dlvryCnt), { silent: true })

        var dlvryTtl = summary.get("dlvryTtl")
        var sTtl = _.find(dlvryTtl, function (ds) { return ds.status == order.status; })
        if (!sTtl) {
            sTtl = {
                type: order.delivery,
                status: order.status,
                count: 0
            }
            dlvryTtl.push(sTtl)
        }
        sTtl.count = Number(sTtl.count) + Number(order.total)
        var total = summary.sumCount(dlvryTtl)
        this.mapDeliveryType(dlvryTtl, total)
        summary.set("dlvryTtl", summary.sortType(dlvryTtl), { silent: true })

        summary.trigger('change')
    }
});
var DashboardView = Backbone.View.extend({
    el: $('.dashboard'),
    initialize: function (options) {
        this.dashboardSummary = new DashboardSummaryView({
            collection: new SummaryCollection(options.summary)
        })
        this.dashboardOrders = new DashboardOrdersView({
            collection: new OrderCollection(options.orders)
        })
        //this.dashboardMessages = new DashboarOrdersView({
        //    collection: new OrderCollection(options.orders)
        //})
        return this
    },
    render: function () {
        this.dashboardSummary.render()
        this.dashboardOrders.render()
        return this
    },
    addOrder: function (order) {
        this.dashboardSummary.add(order)
        this.dashboardOrders.add(order)
    }
});
$(function () {
    $(window).on('load', function () {
        $('[data-dashboard]').each(function () {
            var $spy = $(this)
            var dbop = $spy.data('dashboard')
            lb.dashboard = new DashboardView(dbop).render()
        })
    })
});