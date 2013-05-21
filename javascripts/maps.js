/* =============================================================
* LBmap api
* ============================================================== */
!function ($) {
    "use strict";
    // jshint ;_;
    /* LBmap CLASS DEFINITION
    * ========================== */
    function LBmap(element, options) {
        this.options = $.extend({}, $.fn.lbmap.defaults, options)
        this.element = element
        this.cdnUrl = 'https://d2gm47746jsgrl.cloudfront.net'
        this.initialize()
    }
    LBmap.prototype = {
        constructor: LBmap,
        addMarker: function (items) {
            if (items.length) {
                var icon;
                var self = this
                var defIcon = {
                    iconUrl: self.cdnUrl + '/assets/images/leaflet/marker-icon.png',
                    shadowUrl: self.cdnUrl + '/assets/images/leaflet/marker-shadow.png',
                    iconSize: new L.Point(25, 41),
                    iconAnchor: new L.Point(13, 41),
                    popupAnchor: new L.Point(1, -34),
                    shadowSize: new L.Point(41, 41)
                }
                if (items.length > 1) {
                    icon = new L.numberedIcon(
                        _.defaults({
                            iconUrl: self.cdnUrl + '/assets/images/leaflet/marker-hole.png',
                            number: items.length
                        }, defIcon)
                    )
                }
                else
                    icon = new L.icon(defIcon)
                var location = items[0]._address[0].location
                var marker = L.marker([location[1], location[0]], { icon: icon })
                    .bindPopup(this.createPopup(items)).addTo(this.map)
                marker.on('click', function () { marker.openPopup() })
            }
        },
        createPopup: function (items) {
            var popup = []
            for (var i = 0, j = items.length; i < j; i++) {
                popup.push($('li[data-id="' + items[i]._id + '"] .am-lpc').detach().html())
                if (i !== j - 1)
                    popup.push('<hr>')
            }
            return popup.join('')
        },
        handleNoGeolocation: function () {
            //centered to London by default
            this.options.home = [51.5081289, -0.12800500000003012]
        },
        initialize: function () {

            if (!this.options.home) {
                this.options.home = [51.5081289, -0.12800500000003012]
                //if (navigator.geolocation) {
                //    var self = this
                //    var postcode = $('#postcode')
                //    if (postcode.length) {

                //    }
                //    navigator.geolocation.getCurrentPosition(function (position) {
                //        self.options.home = [position.coords.latitude, position.coords.longitude]
                //        // $.lbcookie.create('LBhomeloc', position.coords.longitude + "," + position.coords.latitude)
                //    }, function () {
                //        self.handleNoGeolocation()
                //    });
                //} // Browser doesn't support Geolocation
                //else {
                //    this.handleNoGeolocation()
                //}
            }
            else
                this.homeSet = true
            this.home = [this.options.home[1], this.options.home[0]]
            this.map = L.map(this.element).setView(this.home, 13)
            // map settings
            var mqTileLayer = L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', { maxZoom: 18, subdomains: ['otile1', 'otile2', 'otile3', 'otile4'], attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>' })

            mqTileLayer.addTo(this.map)
            this.addHome()
            if (this.options.items.length)
                this.addItems()
        },
        addItems: function () {
            var self = this
            var groups = _.groupBy(self.options.items, function (item) { return item._address[0].location })
            _.each(groups, function (g) {
                self.addMarker(g)
            })
        },
        addHome: function () {
            if (!this.home_marker) {
                var homeIcon = L.icon({
                    iconUrl: this.cdnUrl + '/assets/images/leaflet/marker-home.png',
                    shadowUrl: this.cdnUrl + '/assets/images/leaflet/marker-shadow.png',
                    iconSize: new L.Point(25, 41),
                    iconAnchor: new L.Point(13, 41),
                    popupAnchor: new L.Point(1, -34),
                    shadowSize: new L.Point(41, 41)
                })
                this.home_marker = L.marker(this.home, { icon: homeIcon })
                    .bindPopup('<h4>You are here</h4>').addTo(this.map)
                var self = this
                this.home_marker.on('click', function () { self.home_marker.openPopup() })
            }
        },
        setHome: function (coords) {
            this.home = [coords[1], coords[0]]
            this.home_marker.setLatLng(this.home)
            this.map.setView(this.home)
            this.homeSet = true
        },
        defaultHome: function () {
            return !this.homeSet
        }
    }
    /* LBmap PLUGIN DEFINITION
    * =========================== */
    $.fn.lbmap = function (option) {
        var args = Array.prototype.slice.call(arguments, 1)
        return this.each(function () {
            var $this = $(this)
            , data = $this.data('lbmap')
            , options = typeof option == 'object' && option
            if (!data) $this.data('lbmap', (data = new LBmap(this, options)))
            if (typeof option == 'string') data[option](args)
        })
    };
    $.fn.lbmap.Constructor = LBmap;
    $.fn.lbmap.defaults = {
        items: [],
        home: ''
    };
    /* LBmap DATA-API
    * ================== */
    $(window).on('load', function () {
        $('[data-spy="map"]').each(function () {
            var $spy = $(this)
            $spy.lbmap($spy.data())
        })
    })
}(window.jQuery);