$(function () {
    var eventRests = $('#events ul#content')
    var $eventform = $('#eventForm')
    if ($eventform.length) {
        var eventRestaurantTemplate = '<li class="clearfix"><input class="hide" type="checkbox" name="event[restaurants]" checked="checked" /><span class="pull-left"></span><button class="pull-right close rm" type="button"><i class="icon-remove-sign"></i></button></li>'
        var $eventdate = $eventform.find('.eventdate')
        var now = new Date()
        now.setMinutes(0, 0, 0)
        var $dp = $eventform.find('.datepicker').datetimepicker({
            thicon: 'calendar',
            format: "dd/mm/yyyy hh:ii",
            startDate: now,
            todayBtn: 'linked',
            maxView: 4,
            forceParse: false,
            minView: 0,
            minuteStep: 15,
            autoclose: true,
            linkField: $eventdate
        })
        var date = $eventdate.val()
        if (date)
            $dp.datetimepicker('update', new Date(date))
        $('#selectRest').on('modalReady', function (e, modal) {
            var $modal = $(modal)
            eventRests.find('li input').each(function (e) {
                $modal.find('input[value="' + this.value + '"]').attr({ 'checked': 'checked' })
            })
            var $filter = $modal.find('#restFilter')
            var $evrest = $modal.find('.evrest')
            var pagination = $modal.find('.pagination')
            $modal.find('.filter').on('click', function (e) {
                var filterexp = $filter.val()
                var hidden = $([]), shown = $([])
                _.each($evrest, function (r) {
                    if ((new RegExp(filterexp, 'i')).test($(r).find('label').text()))
                        shown = shown.add(r)
                    else
                        hidden = hidden.add(r)
                }, this)
                hidden.addClass('filt').slideUp()
                shown.removeClass('filt').slideDown()
                pagination.lbpaginate("go_to_page")
            })
            $modal.find('.select').on('click', function () {
                eventRests.empty()
                _.each($('#eventRests input:checked'), function (input) {
                    addSelRest(input.value, input.nextSibling.data)
                })
            })

            pagination.lbpaginate(pagination.data())
        })
        var addSelRest = function (id, name) {
            var template = eventRestaurantTemplate
            var $eventRestaurantTemplate = $(eventRestaurantTemplate)
            $eventRestaurantTemplate.find('input').attr({ 'value': id })
            $eventRestaurantTemplate.find('span').text(name)
            $eventRestaurantTemplate.find('.rm').on('click', function () {
                $(this).closest('li').remove()
            })
            eventRests.append($eventRestaurantTemplate)
        }
        var mappedSource = function (data) {
            var self = this
            var source = _.filter(data.source, function (r) {
                return !(_.any(data.selected, function (s) {
                    return r._id == s
                }))
            })
            return _.map(source, function (model) {
                return {
                    id: model._id,
                    name: model.name,
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
        $('#restLookup').typeahead({
            source: function (query, process) {
                var self = this
                return $.get('/event/restaurants/' + query, function (data) {
                    return self.process(mappedSource({ source: data, selected: _.pluck(eventRests.find('input:checked'), 'value') }))
                })
            },
            minLength: 3,
            matcher: function (item) {
                return (new RegExp(this.query, 'i')).test(item.name)
            },
            updater: function (json) {
                var item = JSON.parse(json)
                addSelRest(item.id, item.name)
            }
        })
    }
});