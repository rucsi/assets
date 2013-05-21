/* =========t====================================================
* LBmap api
* ============================================================== */
!function ($) {
    "use strict";
    // jshint ;_;
    /* LBpaginate CLASS DEFINITION
    * ========================== */
    function LBpaginate(element, options) {
        this.options = $.extend({}, $.fn.lbpaginate.defaults, options)
        this.$element = element
        if (typeof this.options.content == 'function')
            this.$content = this.options.content()
        else if (typeof this.options.content == 'object')
            this.$content = this.options.content
        else
            this.$content = $(this.options.content)
        this.initialize()
    }
    LBpaginate.prototype = {
        constructor: LBpaginate,
        initialize: function () {
            //getting the amount of elements inside content div
            this.number_of_items = this.$content.children().length;
            //calculate the number of pages we are going to have
            this.number_of_pages = Math.ceil(this.number_of_items / this.options.items_per_page);

            if (this.number_of_pages <= 1) {
                this.$element.empty()
                if (this.options.columns)
                    this.create_columns()
                return
            }
            //set the value of the current page
            this.current_page = 0

            var self = this;
            var navigation_html = $('<ul/>');
            navigation_html.append($('<li class="prev" />')
                .append($('<a href="/previous" data-target="#"/>')
                    .text('«').on('click', function (e) {
                        e.preventDefault();
                        self.previous()
                    })));
            for (var i = this.current_page; i < this.number_of_pages; i++) {
                //add active class to the first page link
                navigation_html.append($('<li/>')
                    .append($('<a href="/go_to_page/' + (i + 1) + '" data-page="' + i + '" data-target="#">')
                        .text(i + 1).on('click', function (e) {
                            e.preventDefault();
                            var page = $(this).data('page');
                            if (page !== self.current_page)
                                self.go_to_page(page)
                        })));
            }
            navigation_html.append($('<li class="next"/>')
                .append($('<a href="/next" data-target="#"/>')
                    .text('»').on('click', function (e) {
                        e.preventDefault();
                        self.next()
                    })));
            this.$element.html(navigation_html);
            this.go_to_page(this.current_page);
        },
        previous: function () {
            //if there is an item before the current active link run the function
            if (!this.$element.find('.active').prev('li').hasClass('prev')) {
                this.go_to_page(this.current_page - 1);
            }
        },
        next: function () {
            //if there is an item after the current active link run the function
            if (!this.$element.find('.active').next('li').hasClass('next')) {
                this.go_to_page(this.current_page + 1);
            }
        },
        go_to_page: function (page_num) {
            if (!page_num) page_num = 0
            //get the element number where to start the slice from
            var start_from = page_num * this.options.items_per_page;
            //get the element number where to end the slice
            var end_on = start_from + this.options.items_per_page;
            //hide all children elements of content div, get specific items and show them

            var items = this.get_items()
            items.css('display', 'none').slice(start_from, end_on).css('display', '');
            if (this.options.columns)
                this.create_columns()

            /*get the page link that has longdesc attribute of the current page and add active_page class to it
            and remove that class from previously active page link*/
            this.$element.find('.prev, .next').removeClass('disabled');
            if (page_num <= 0)
                this.$element.find('.prev').addClass('disabled');
            if (page_num >= this.number_of_pages - 1)
                this.$element.find('.next').addClass('disabled');
            this.$element.find('a[data-page=' + page_num + ']').parent().addClass('active').siblings('li').removeClass('active');

            //update the current page field
            this.current_page = page_num;
            return false;
        },
        create_columns: function () {
            var items = this.$content.children().filter(function () { return $(this).css("display") !== "none" })
            //console.log('create_columns', items)
            var item_in_col = Math.floor(this.options.items_per_page / this.options.columns)
            for (var i = 0, j = this.options.columns; i < j; i++) {
                var col = $('<div class="col" />')
                var lastcol = (i == j - 1)
                var colwidth = Math.floor(100 / this.options.columns)
                col.addClass(lastcol ? 'pull-right' : 'pull-left').css({ 'width': colwidth + (lastcol ? (100 - j * colwidth) : 0) + '%' })
                var to = lastcol ? items.length : (i + 1) * item_in_col
                var current_items = items.slice(i * item_in_col, to)
                col.insertBefore(current_items.eq(0))
                col.append($(current_items).detach())
            }
        },
        get_items: function () {
            if (this.options.columns)
                this.$content.children('.col').children().unwrap()
            return this.options.exclude ? this.$content.children().not(this.options.exclude) : this.$content.children()

            /*var items
            $.each(this.$content.children(), function (c) {
                if ($(this).is('.col')) {
                    if (!items)
                        items = $(this).children()
                    else
                        items = items.add($(this).children())
                }
                else {
                    if (!items)
                        items = $(this)
                    else
                        items = items.add($(this))
                }
            })            
            return items*/
        }
    }
    /* LBpaginate PLUGIN DEFINITION
    * =========================== */
    $.fn.lbpaginate = function (option) {
        return this.each(function () {
            var $this = $(this)
            , data = $this.data('lbpaginate')
            , options = typeof option == 'object' && option
            if (!data) $this.data('lbpaginate', (data = new LBpaginate($this, options)))
            if (typeof option == 'string') data[option]()
        })
    };
    $.fn.lbpaginate.Constructor = LBpaginate;
    $.fn.lbpaginate.defaults = {
        //how much items per page to show
        items_per_page: 10,
        content: '#content',
        columns: false,
        exclude: false
    };
    /* LBpaginate DATA-API
    * ================== */
    $(window).on('load', function () {
        $('[data-spy="paginate"]').each(function () {
            var $spy = $(this)
            $spy.lbpaginate($spy.data())
        });
    })
}(window.jQuery);