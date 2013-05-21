var ContainerItemModel = {
    preferences: Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            name: '',
            desc: '',
            multi: false,
            mandatory: false,
            type: 0,
            option: []
        }
    }),
    items: Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            name: '',
            desc: '',
            price: 0.00,
            preferences: []
        }
    }),
    categories: Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            name: '',
            desc: '',
            items: []
        }
    }),
    deals: Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            name: '',
            desc: '',
            type: '',
            items: []
        }
    }),
    deal_items: Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            item: {
                _id: '',
                name: '',
                desc: '',
                price: 0.00
            },
            preferences: []
        }
    }),
    deal_gift: Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            item: {
                _id: '',
                name: '',
                desc: '',
                price: 0.00
            },
            preferences: []
        }
    }),
    deal_gift_items: Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            item: {
                _id: '',
                name: '',
                desc: '',
                price: 0.00
            },
            preferences: []
        }
    }),
    menus: Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            name: '',
            desc: '',
            categories: []
        }
    })
}

var ContainerItemCollection = Backbone.Collection.extend({
});

var orderFuncTemplate = '<td class="func"><a href="up" title="move up"{{#first}} class="hidden"{{/first}}><i class="icon-arrow-up"></i></a><a href="down" title="move down"{{#last}} class="hidden"{{/last}}><i class="icon-arrow-down"></i></a></td>'
var removeFuncTemplate = '<td class="func"><a href="remove"><i class="icon-trash"></i></a></td>'
var itemsFuncTemplate = '<td class="func"><a href="select"><i class="icon-list"></i></a><div class="hide itemsfunc"></div></td>'

var PreferencesSelectView = Backbone.View.extend({
    className: "checkbox",
    template: Hogan.compile('<input type="checkbox" value="{{_id}}"{{#checked}} checked="checked"{{/checked}} />{{name}}'),
    render: function () {
        var vm = _.extend(this.model.toJSON(), {
            checked: this.options.checked
        })
        var title = this.model.get('desc') || this.model.get('name')
        this.$el.html(this.template.render(vm)).attr({ 'title': title })
        return this
    }
});

var ContainerItemView = Backbone.View.extend({
    tagName: "tr",
    partials: {
        deals: Hogan.compile(orderFuncTemplate + '<td>{{name}}<input type="hidden" name="deals[]" value="{{_id}}" checked="checked" /></td><td>{{type}}</td><td>{{desc}}</td><td>{{items.length}} item{{#itemlength}}s{{/itemlength}}</td><td>{{gift.length}} gift{{#giftlength}}s{{/giftlength}}</td>' + removeFuncTemplate),
        categories: Hogan.compile(orderFuncTemplate + '<td>{{name}}<input type="hidden" name="menu[categories][]" value="{{_id}}" checked="checked" /></td><td>{{desc}}</td><td>{{items.length}} item{{#itemlength}}s{{/itemlength}}</td>' + removeFuncTemplate),
        items: Hogan.compile(orderFuncTemplate + '<td>{{name}}<input type="hidden" name="category[items][]" value="{{_id}}" checked="checked" /></td><td>{{desc}}</td><td>{{item.price}}</td><td>{{preferences.length}} preference{{#itemlength}}s{{/itemlength}}</td>' + removeFuncTemplate),
        preferences: Hogan.compile(orderFuncTemplate + '<td>{{name}}<input type="hidden" name="item[preferences][]" value="{{_id}}" checked="checked" /></td><td>{{payableAfter}}</td><td>{{desc}}</td><td>{{#multiple}}Multiple{{#mandatory}} & {{/mandatory}}{{/multiple}}{{#mandatory}}Mandatory{{/mandatory}}</td><td>{{option.length}} option{{#itemlength}}s{{/itemlength}}</td>' + removeFuncTemplate),
        deal_items: Hogan.compile('<td>{{item.name}}<input type="hidden" name="deal[items][item]" value="{{item._id}}" checked="checked" /></td><td>{{item.desc}}</td><td>{{item.price}}</td><td>{{preferences.length}} preference{{#itemlength}}s{{/itemlength}}<div class="hide">{{#preferences}}<input type="checkbox" name="deal[items][preferences][{{itemid}}]" value="{{_id}}" checked="checked" />{{/preferences}}</div></td>' + itemsFuncTemplate + removeFuncTemplate),
        deal_gift: Hogan.compile('<td>{{item.name}}<input type="hidden" name="deal[gift][item]" value="{{item._id}}" checked="checked" /></td><td>{{item.desc}}</td><td>{{item.price}}</td><td>{{preferences.length}} preference{{#itemlength}}s{{/itemlength}}</td>' + removeFuncTemplate),
        menus: Hogan.compile(orderFuncTemplate + '<td>{{name}}<input type="hidden" name="menus[]" value="{{_id}}" checked="checked" /></td><td>{{desc}}</td><td>{{categories.length}} categor{{^itemslength}}y{{/itemslength}}{{#itemslength}}ies{{/itemslength}}</td>' + removeFuncTemplate)
    },
    events: {
        'click a[href="up"]': 'moveup',
        'click a[href="down"]': 'movedown',
        'click a[href="remove"]': 'remove',
        'click a[href="select"]': 'select'
    },
    render: function () {
        var vm = this.getViewmodel()
        this.$el.addClass(vm.status).html(this.partials[this.options.type].render(vm))
        return this
    },
    getViewmodel: function () {
        var item, preferences = {}, arraylengths = {}
        switch (this.options.type) {
            case 'deal_items':
            case 'deal_gift':
                item = this.model.get('item')
                preferences = _.map(this.model.get('preferences'), function (p) {
                    return _.extend(p, { itemid: item._id })
                })
                arraylengths = {
                    itemlength: (this.model.get('preferences').length > 1)
                }
                var selits = this.$el.find('.itemsfunc')
                var url = this.model.collection.url + '/' + this.model.id + '/select'
                this.itemsselect = new PreferencesSelectView({ el: selits, url: url, selected: this.model.get('preferences') })
                break
            case 'deal':
                item = this.model
                arraylengths = {
                    itemlength: (item.get('items').length > 1),
                    giftlength: (item.get('gift').length > 1)
                }
                break
            case 'categories':
                item = this.model
                arraylengths = {
                    itemlength: (item.get('items').length > 1)
                }
                break
            case 'items':
                item = this.model
                arraylengths = {
                    itemlength: (item.get('preferences').length > 1)
                }
                break
            case 'preferences':
                item = this.model
                arraylengths = {
                    itemlength: (item.get('option').length > 1)
                }
                break
            case 'menus':
                item = this.model
                arraylengths = {
                    itemslength: (item.get('categories').length > 1)
                }
                break
            default:
                item = this.model
                break
        }
        //var imgScr = item.image
        return _.extend(this.model.toJSON(), {
            //pricefix: Number(this.model.get('price')).toFixed(2),
            //imgSrc: imgScr ? '<img src="' + imgScr + '" alt="' + imgScr + '" style="max-width:50px; max-height: 50px;"' : '',
            first: this.first(),
            last: this.last()
        }, preferences, arraylengths)
    },
    moveup: function (e) {
        e.preventDefault();
        var idx = this.model.collection.indexOf(this.model)
        this.model.collection.models[idx] = this.model.collection.models[idx - 1]
        this.model.collection.models[idx - 1] = this.model
        this.model.collection.trigger('change')
    },
    movedown: function (e) {
        e.preventDefault();
        var idx = this.model.collection.indexOf(this.model)
        this.model.collection.models[idx] = this.model.collection.models[idx + 1]
        this.model.collection.models[idx + 1] = this.model
        this.model.collection.trigger('change')
    },
    remove: function (e) {
        e.preventDefault();
        this.model.collection.remove(this.model)
    },
    select: function (e) {
        e.preventDefault()
        e.stopPropagation()
        var self = this
        var url = this.model.collection.url + '/' + this.model.get('item')._id + '/select'
        $.get(url, function (data) {
            var modal = $('<div/>').html(data).find('form').addClass('modal fade')
            $('body').append(modal)
            self.setPreferences(modal)
            modal.on('submit', function (e) {
                e.preventDefault();
                var form = $(this)
                self.model.set('preferences', self.getPreferences(form))
                form.modal('hide')
            }).modal()
                .on('hidden', function () {
                    $(this).remove()
                })
        })
    },
    getPreferences: function (form) {
        var prefs = []
        var id = this.model.get('item')._id
        form.find('input[name^="preferences"]').each(function () {
            var val = this.value
            if (val && this.checked) {
                prefs.push({ _id: val, itemid: id })
            }
        })
        return prefs
    },
    setPreferences: function (form) {
        var prefs = this.model.get('preferences')
        form.find('input[name^="preferences"]').each(function () {
            var val = this.value
            if (val)
                this.checked = _.any(prefs, function (p) { return val == p._id })
        })
        return prefs
    },
    first: function () {
        return this.model.collection.indexOf(this.model) == 0
    },
    last: function () {
        return this.model.collection.indexOf(this.model) == this.model.collection.length - 1
    }
});

var SelectItemView = Backbone.View.extend({
    tagName: "label",
    className: "checkbox",
    template: Hogan.compile('<input type="checkbox" value="{{_id}}"{{#checked}} checked="checked"{{/checked}} />{{name}}'),
    render: function () {
        var vm = _.extend(this.model.toJSON(), {
            checked: this.options.checked
        })
        var title = this.model.get('desc') || this.model.get('name')
        this.$el.html(this.template.render(vm)).attr({ 'title': title })
        return this
    }
});

var ItemContainerView = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, 'fetchSuccess')

        this.collection = new ContainerItemCollection()
        this.collection.model = ContainerItemModel[this.options.type]
        this.collection.url = this.options.url

        this.collection.on('add change remove', this.render, this)
        //if (this.$el.is(':visible'))
        this.fetch()
    },
    fetch: function () {
        var urlsplit = this.options.url.split('/')
        var ctrselel = $('#' + this.options.type + 'Select')
        this.itemselector = new SelectConatinerView({ el: ctrselel, type: this.options.type, url: '/' + urlsplit[1] + '/' + urlsplit[urlsplit.length - 1], selected: this.collection })
        this.collection.fetch({
            success: this.fetchSuccess
        })
    },
    fetchSuccess: function (collection, response) {
        this.render()
    },
    render: function () {
        this.$el.empty()
        this.collection.each(function (item) {
            this.renderItem(item)
        }, this)
    },
    renderItem: function (item) {
        var self = this
        var itemView = new ContainerItemView({
            model: item,
            type: self.options.type
        })
        this.$el.append(itemView.render().el)
    }
});

var SelectConatinerView = Backbone.View.extend({
    events: {
        'click .cancel': 'cancel',
        'click .btn-success': 'apply',
        'click .btn-filter': 'filter'
    },
    initialize: function () {
        this.collection = new ContainerItemCollection()
        this.collection.model = ContainerItemModel[this.options.type]
        this.collection.url = this.options.url
        this.$container = this.$el.closest('.lbctrcontainer')
        this.bindSelect()
        this.collection.fetch()
    },
    render: function () {
        var selectcontainer = this.$el.find('.selcntner')
        selectcontainer.empty()
        var items = this.collection.models
        if (this.filterexp)
            items = items.filter(function (i) { return this.match(this.filterexp, i.get('name')) }, this)
        if (items.length > 0) {
            var self = this
            _.each(items, function (item, i) {
                self.renderItem(item, i)
            })
            var pagination = this.$el.find('.pagination')
            if (!pagination.data('lbpaginate'))
                pagination.lbpaginate({
                    //items_per_page: 5,
                    content: selectcontainer,
                    columns: 2
                })
            else
                pagination.lbpaginate('initialize')
        } else
            this.$el.find('button.btn-success').attr({ disabled: 'disabled' })
    },
    renderItem: function (item, i) {
        var self = this
        var checked = self.hasItem(item)
        var itemView = new SelectItemView({
            model: item,
            type: self.options.type,
            checked: checked
        })
        this.$el.find('.selcntner').append(itemView.render().el)
    },
    hasItem: function (item) {
        if (this.options.type == 'deal_items' || this.options.type == 'deal_gift')
            return this.options.selected.find(function (i) { return i.get('item')._id == item.id }) != null
        return this.options.selected.get(item.id) != null
    },
    apply: function () {
        var selected = this.options.selected
        var self = this
        this.$el.find('input[type="checkbox"]').each(function () {
            var $this = $(this)
            var val = $this.val()
            var selItem = self.options.selected.get(val)
            if ($this.is(':checked') && selItem == null)
                self.addItem(val)
            else if (!$this.is(':checked') && selItem !== null)
                self.options.selected.remove(selItem)
        })
    },
    cancel: function () {
        this.$el.find('input[type="checkbox"]').each(function () {
            this.checked = this.defaultChecked
        })
    },
    addItem: function (id) {
        var item = this.collection.get(id)
        if (this.options.type == 'deal_items' || this.options.type == 'deal_gift') {
            var pref = []
            _.each(item.get('preferences'), function (p) {
                if (p.mandatory)
                    pref.push({ _id: p.option[0]._id, itemid: id })
            })
            this.options.selected.add(new ContainerItemModel[this.options.type]({ item: item.toJSON(), preferences: pref }))
        }
        else
            this.options.selected.add(new ContainerItemModel[this.options.type](item.toJSON()))
    },
    bindSelect: function () {
        var self = this
        this.$container.find('a[href="#' + this.options.type + 'Select"]').on('click', function (e) {
            e.preventDefault()
            self.render()
        })
        this.$container.find('input#' + this.options.type + 'Lookup').typeahead({
            source: function (query, process) {
                process(self.mappedSource())
            },
            minLength: 3,
            matcher: function (item) {
                return self.match(this.query, item.name)
            },
            updater: function (json) {
                var item = JSON.parse(json)
                self.addItem(item.id)
            }
        })
    },
    filter: function (e) {
        this.filterexp = $('#' + this.options.type + 'Filter').val()
        this.render()
    },
    match: function (query, name) {
        return (new RegExp(query, 'i')).test(name)
    },
    mappedSource: function () {
        var self = this
        var source = self.collection.models.filter(function (m) {
            return self.options.selected.get(m.get('_id')) == null
        })
        return source.map(function (model) {
            return {
                id: model.id,
                name: model.get('name'),
                // these functions allows Bootstrap typehead to use this item in places where it was expecting a string
                toString: function () {
                    return JSON.stringify(this);
                },
                toLowerCase: function () {
                    return this.name.toLowerCase();
                },
                indexOf: function (string) {
                    return String.prototype.indexOf.apply(this.name, arguments);
                },
                replace: function (string) {
                    return String.prototype.replace.apply(this.name, arguments);
                }
            }
        })
    }
});

$(function () {
    var LB = window['LB']
    if (!LB)
        LB = window['LB'] = {}
    $('[data-lbctritem]').each(function () {
        var ctrtype = $(this).data('lbctritem')
        var url = $(this).data('lbctrurl')
        var ctrel = $(this).find('tbody')
        LB[ctrtype] = new ItemContainerView({ el: ctrel, type: ctrtype, url: url })
    })
});