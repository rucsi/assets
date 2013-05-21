/* =========t====================================================
* LBmap api
* ============================================================== */
!function ($) {
    "use strict";
    // jshint ;_;
    /* LBpaginate CLASS DEFINITION
    * ========================== */
    function LBvalidate(element, options) {
        this.options = $.extend({}, $.fn.lbvalidate.defaults, options)
        this.$element = element
        this.initialize()
    }
    LBvalidate.prototype = {
        initialized: false,
        constructor: LBvalidate,
        rules: {
            userInt: function () {
                return {
                    rules: {
                        name: {
                            required: true
                        },
                        email: {
                            required: true,
                            email: true
                        }
                    },
                    messages: {
                        name: {
                            required: "Please provide your full name"
                        },
                        email: {
                            required: "Please enter a valid email address",
                            email: "Please enter a valid email address"
                        }
                    }
                }
            },
            restInt: function () {
                return {
                    rules: {
                        name: {
                            required: true
                        },
                        email: {
                            required: true,
                            email: true
                        },
                        'contact[name]': {
                            required: true
                        },
                        'contact[phone]': {
                            required: true,
                            phoneUK: true
                        }
                    },
                    messages: {
                        name: {
                            required: "Please provide your restaurant's name"
                        },
                        email: {
                            required: "Please enter a valid email address",
                            email: "Please enter a valid email address"
                        },
                        'contact[name]': {
                            required: "Please provide a contact name"
                        },
                        'contact[phone]': {
                            required: "Please enter a valid phone number",
                            phoneUK: "Please enter a valid phone number"
                        }
                    }
                }
            },
            loginForm: function () {
                return {
                    rules: {
                        email: {
                            required: true,
                            email: true
                        },
                        password: {
                            required: true
                        }
                    },
                    messages: {
                        email: {
                            required: "Please enter a valid email address",
                            email: "Please enter a valid email address"
                        },
                        password: {
                            required: "Please provide your password"
                        }
                    }
                }
            },
            register: function () {
                return $.extend(true, {}, $.fn.lbvalidate.email_password, $.fn.lbvalidate.has_to_agree, {
                    rules: {
                        name: {
                            required: true
                        },
                        phone: {
                            required: true,
                            phoneUK: true
                        },
                        confirmemail: {
                            equalTo: "#register_email"
                        },
                        confirmpassword: {
                            equalTo: "#register_password"
                        }
                    },
                    messages: {
                        name: {
                            required: "Please enter your full name"
                        },
                        phone: {
                            required: "Please enter a valid phone number",
                            phoneUK: "Please enter a valid phone number"
                        }
                    }
                })
            },
            join: function () {
                return $.extend(true, {},
                    $.fn.lbvalidate.email_password,
                    $.fn.lbvalidate.restaurant_form,
                    $.fn.lbvalidate.address_form,
                    $.fn.lbvalidate.contact_form,
                    $.fn.lbvalidate.has_to_agree, {
                        rules: {
                            confirmemail: {
                                equalTo: "#join_email"
                            },
                            confirmpassword: {
                                equalTo: "#join_password"
                            }
                        }
                    })
            },
            searchForm: function () {
                return {
                    rules: {
                        postcode: {
                            required: true,
                            postCode: true
                        }
                        /*confirm_password: {
                            required: true,
                            minlength: 5,
                            equalTo: "#password"
                        },
                        topic: {
                            required: "#newsletter:checked",
                            minlength: 2
                        },
                        agree: "required"*/
                    },
                    messages: {
                        postcode: {
                            required: "Please enter a valid postcode",
                            postCode: "Please enter a valid postcode"
                        }
                        /*lastname: "Please enter your lastname",
                        username: {
                            required: "Please enter a username",
                            minlength: "Your username must consist of at least 2 characters"
                        },
                        password: {
                            required: "Please provide a password",
                            minlength: "Your password must be at least 5 characters long"
                        },
                        confirm_password: {
                            required: "Please provide a password",
                            minlength: "Your password must be at least 5 characters long",
                            equalTo: "Please enter the same password as above"
                        },
                        email: "Please enter a valid email address",
                        agree: "Please accept our policy"*/
                    }
                }
            },
            restaurantForm: function () {
                return $.extend(true, {},
                    $.fn.lbvalidate.email_password,
                    $.fn.lbvalidate.restaurant_form,
                    $.fn.lbvalidate.address_form,
                    $.fn.lbvalidate.contact_form,
                    $.fn.lbvalidate.opentimes_form,
                    $.fn.lbvalidate.services_form)
            },
            dealForm: function () {
                return $.extend({
                    rules: {
                        "deal[name]": {
                            required: true
                        },
                        "deal[type]": {
                            required: true
                        },
                        "deal[offValue]": {
                            required: "#ot_deal:checked, #ot_multibuy:checked",
                        },
                        "deal[overValue]": {
                            required: "#ot_multibuy:checked"
                        }/*,
                        "deal[gift][offValue]": {
                            required: "#gift-ot:checked"
                        }*/
                    },
                    messages: {
                        "deal[name]": {
                            required: "Please enter the name of the deal"
                        },
                        "deal[type]": {
                            required: "Please select the type of the deal"
                        },
                        "deal[offValue]": {
                            required: "Please set the deal value"
                        },
                        "multibuy[offValue]": {
                            required: "Please set the multibuy value"
                        },
                        "multibuy[overValue]": {
                            required: "Please set the multibuy value"
                        }/*,
                        "deal[gift][offValue]": {
                            required: "Please set the value"
                        }*/
                    }
                }, $.fn.lbvalidate.opentimes_form)
            },
            checkoutForm: function () {
                return $.extend(true, {}, $.fn.lbvalidate.address_form, $.fn.lbvalidate.payment_form, $.fn.lbvalidate.paypoint_form,
                    {
                        rules: {
                            "address[line1]": {
                                required: '.sel_dt option[value="delivery"]:selected'
                            },
                            "address[line2]": {
                            },
                            "address[line3]": {
                            },
                            "address[town]": {
                                required: '.sel_dt option[value="delivery"]:selected'
                            },
                            'address[postcode]': {
                                required: '.sel_dt option[value="delivery"]:selected',
                                postCode: true
                            }
                        }
                    }, {
                        rules: {
                            name: {
                                required: true
                            }
                        },
                        messages: {
                            name: {
                                required: "Please enter your full name"
                            }
                        }
                    })
            },
            managerForm: function () {
                return $.extend(true, {},
                    $.fn.lbvalidate.email_password, {
                        rules: {
                            name: {
                                required: true
                            },
                            confirmemail: {
                                equalTo: "#manager_email"
                            },
                            confirmpassword: {
                                equalTo: "#manager_password"
                            },
                            role: {
                                required: true
                            }

                        },
                        messages: {
                            name: {
                                required: "Please enter your full name"
                            },
                            role: {
                                required: "Please specify a role"
                            }
                        }
                    })
            },
            changePwdForm: function () {
                return {
                    rules: {
                        oldPassword: {
                            required: true
                        },
                        newPassword: {
                            required: true
                        },
                        newPasswordConfirm: {
                            required: true,
                            equalTo: "#password"
                        }
                    },
                    messages: {
                        oldPassword: {
                            required: "Please provide your password"
                        },
                        newPassword: {
                            required: "Please provide a new password"
                        },
                        newPasswordConfirm: {
                            required: "Please confirm your new password",
                            equalTo: "Please enter the same password as above"
                        }
                    }
                }
            }
        },
        initialize: function () {
            var self = this;//.attr('novalidate', 'novalidate')
            //var submit = this.$element.data('events')['submit']
            //var handler = null
            //if (submit) handler = submit['handler']
            //this.$element.off('submit')
            var ruleId = this.$element.data('lbvalidate-rules') || this.$element.get(0).id
            var formRules = this.rules[ruleId]
            if (formRules) {
                var opts = $.extend({ /*submitHandler: submit*/ }, this.options, formRules())
                /*this.$element.find('.close').on('click', function () {
                this.$element.on('destroyed', function () {
                    //self.validator.resetForm()
                    self.resetform()
                })*/
                this.$element.on('hidden', function () {
                    self.validator.resetForm()
                    self.resetform()
                })
                this.validator = this.$element.validate(opts)
                //this.$element.trigger("lbvalidate")
            }
            //this.$element.on('submit', function () { self.validate() })
        },
        tabvalidate: function (tab) {
            var val = this.validator
            var res = true
            if (val) {
                tab.find('input, select').each(function () {
                    if (!val.element(this)) {
                        var $element = $(this)
                        var pop = $element.data('popover')
                        $element.popover('destroy')
                        $element.closest('.error').removeClass('error')
                        if (pop) {
                            $element.removeData('popover')
                            pop.$tip.remove()
                        }
                        res = false
                        return false
                    }
                })
            }
            return res
        },
        fsvalidate: function (fieldset) {
            var val = this.validator
            var res = true
            if (val) {
                fieldset.find('input, select').each(function () {
                    if ($(this).is(':visible'))
                        if (!val.element(this)) {
                            res = false
                        }
                })
            }
            return res
        },
        elemvalidate: function (elements) {
            var val = this.validator, res = true
            elements.each(function () {
                if ($(this).is(':visible')) {
                    if ($(this).data('popover'))
                        $(this).popover('hide')
                    if (!val.element(this))
                        res = false
                }
            })
            return res
        },
        resetform: function () {
            //var elements = this.$element.find('input, select').filter(':visible')
            //$.each(elements, function (index, element) {
            //    var $element = $(this)
            //    if ($element.data('popover')) {
            //        //$element.data('errorShown').remove()
            //        $element.closest('.error').removeClass('error')
            //        $element.popover('destroy')
            //    }
            //});
            $('.popover[rel="' + this.$element.get(0).id + '"]').remove()
        }
    }
    /* LBvalidate PLUGIN DEFINITION
    * =========================== */
    $.fn.lbvalidate = function (option) {

        /*if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }*/
        //var params = Array.prototype.slice.call(arguments, 1)[0]
        $.fn.lbvalidate.initialize()
        return this.each(function () {
            var $this = $(this)
            , data = $this.data('lbvalidate')
            , options = typeof option == 'object' && option
            if (!data) $this.data('lbvalidate', (data = new LBvalidate($this, options)))
            if (typeof option == 'string') data[option]()
        })
    }
    $.fn.lbvalidate.Constructor = LBvalidate;
    $.fn.lbvalidate.initialize = function () {
        if ($.fn.lbvalidate.defaults.initialized) return
        //extend jQuery validator
        $.validator.addMethod('postCode', function (value) {
            if (!value) return true
            return /^([gG][iI][rR] ?0[aA]{2}|[a-pr-uwyzA-PR-UWYZ]([0-9]{1,2}|([a-hk-yA-HK-Y][0-9]([abehmnprv-y0-9ABEHMNPRV-Y])?)|[0-9][a-hjkps-uwA-HJKPS-UW]) ?[0-9][abd-hjlnp-uw-zABD-HJLNP-UW-Z]{2})$/.test(value);
        }, 'Please enter a valid UK postal code.')

        $.validator.addMethod('phoneUK', function (value) {
            return /^(([0]{1})|([\+][4]{2}))([1]|[2]|[3]|[7]){1}\d{8,9}$/.test(value);
        }, 'Please enter a valid UK phone number.')

        $.validator.addMethod('timeset', function (value, control, selector) {
            var comp = $(selector).is(':checked')
            if (comp && !$(selector).hasClass('empty') && (value == '' || value == -1))
                return false
            return true
        }, 'Please select a time.')

        $.validator.addMethod('lt', function (value, control, selector) {
            var comp = $(selector).val()
            if (comp && value && comp > -1 && value > -1) {
                return Number(value) < Number(comp)
            }
            return true
        }, 'Please enter an earlier time.')

        $.validator.addMethod('gt', function (value, control, selector) {
            var comp = $(selector).val()
            if (comp && value && comp > -1 && value > -1) {
                return Number(comp) < Number(value)
            }
            return true
        }, 'Please enter a later time.')
        /*$.validator.addMethod('earlierTime', function (value, control, selector) {
            var comp = $(selector).val()
            if (comp && value) {
                var date = new Date()
                var ehm = value.split(':')
                var lhm = comp.split(':')
                var earlier = date.getTime() + (new Number(ehm[0]) * 60 * 60 * 1000) + (new Number(ehm[1]) * 60 * 1000)
                var later = date.getTime() + (new Number(lhm[0]) * 60 * 60 * 1000) + (new Number(lhm[1]) * 60 * 1000)
                return earlier < later
            }
            return true
        }, 'Please enter a time earlier than the other.')

        $.validator.addMethod('laterTime', function (value, control, selector) {
            var comp = $(selector).val()
            if (comp && value) {
                var date = new Date()
                var ehm = comp.split(':')
                var lhm = value.split(':')
                var earlier = date.getTime() + (new Number(ehm[0]) * 60 * 60 * 1000) + (new Number(ehm[1]) * 60 * 1000)
                var later = date.getTime() + (new Number(lhm[0]) * 60 * 60 * 1000) + (new Number(lhm[1]) * 60 * 1000)
                return earlier < later
            }
            return true
        }, 'Please enter a time later than the other.')*/
        $.fn.lbvalidate.defaults.initialized = true
    }

    $.fn.lbvalidate.email_password = {
        rules: {
            email: {
                required: true,
                email: true
            },
            confirmemail: {
                required: true,
                equalTo: "#email"
            },
            password: {
                required: true
            },
            confirmpassword: {
                required: true,
                equalTo: "#password"
            }
        },
        messages: {
            email: {
                required: "Please enter a valid email address",
                email: "Please enter a valid email address"
            },
            confirmemail: {
                required: "Please enter a valid email address",
                equalTo: "Please enter the same email as above"
            },
            password: {
                required: "Please provide a password"
            },
            confirmpassword: {
                required: "Please provide a password",
                equalTo: "Please enter the same password as above"
            }
        }
    }
    $.fn.lbvalidate.has_to_aggree = {
        rules: {
            agree: {
                required: true
            }
        },
        messages: {
            agree: {
                required: "Please accept our policy"
            }
        }
    }
    $.fn.lbvalidate.address_form = {
        rules: {
            "address[line1]": {
                required: true
            },
            "address[line2]": {
            },
            "address[line3]": {
            },
            "address[town]": {
                required: true
            },
            'address[postcode]': {
                required: true,
                postCode: true
            }
        },
        messages: {
            "address[line1]": {
                required: "Please enter your address"
            },
            "address[line2]": {
            },
            "address[line3]": {
            },
            "address[town]": {
                required: "Please enter your town"
            },
            "address[postcode]": {
                required: "Please enter a valid postcode",
                postCode: "Please enter a valid postcode"
            }
        }
    }
    $.fn.lbvalidate.contact_form = {
        rules: {
            "contact[name]": {
                required: true
            },
            "contact[email]": {
                required: true,
                email: true
            },
            "contact[telephone]": {
                required: true,
                phoneUK: true
            }
        },
        messages: {
            "contact[name]": {
                required: "Please enter a contact name"
            },
            "contact[email]": {
                required: "Please enter a valid email address",
                email: "Please enter a valid email address"
            },
            "contact[telephone]": {
                required: "Please enter a valid phone number",
                phoneUK: "Please enter a valid phone number"
            }
        }
    }
    $.fn.lbvalidate.opentimes_form = {
        rules: {
            'opening[0][open]': {
                timeset: "[name='opening[0][isOpen]']:checked"
                //lt: "[name='opening[0][close]']"
            },
            'opening[0][close]': {
                timeset: "[name='opening[0][isOpen]']:checked"
                //gt: "[name='opening[0][open]']"
            },
            'opening[1][open]': {
                timeset: "[name='opening[1][isOpen]']:checked"
                //lt: "[name='opening[1][close]']"
            },
            'opening[1][close]': {
                timeset: "[name='opening[1][isOpen]']:checked"
                //gt: "[name='opening[1][open]']"
            },
            'opening[2][open]': {
                timeset: "[name='opening[2][isOpen]']:checked"
                //lt: "[name='opening[2][close]']"
            },
            'opening[2][close]': {
                timeset: "[name='opening[2][isOpen]']:checked"
                //gt: "[name='opening[2][open]']"
            },
            'opening[3][open]': {
                timeset: "[name='opening[3][isOpen]']:checked"
                //lt: "[name='opening[3][close]']"
            },
            'opening[3][close]': {
                timeset: "[name='opening[3][isOpen]']:checked"
                //gt: "[name='opening[3][open]']"
            },
            'opening[4][open]': {
                timeset: "[name='opening[4][isOpen]']:checked"
                //lt: "[name='opening[4][close]']"
            },
            'opening[4][close]': {
                timeset: "[name='opening[4][isOpen]']:checked"
                //gt: "[name='opening[4][open]']"
            },
            'opening[5][open]': {
                timeset: "[name='opening[5][isOpen]']:checked"
                //lt: "[name='opening[5][close]']"
            },
            'opening[5][close]': {
                timeset: "[name='opening[5][isOpen]']:checked"
                //gt: "[name='opening[5][open]']"
            },
            'opening[6][open]': {
                timeset: "[name='opening[6][isOpen]']:checked"
                //lt: "[name='opening[6][close]']"
            },
            'opening[6][close]': {
                timeset: "[name='opening[6][isOpen]']:checked"
                //gt: "[name='opening[6][open]']"
            },
            'opening[7][open]': {
                timeset: "[name='opening[7[isOpen]']:checked"
                //lt: "[name='opening[7][close]']"
            },
            'opening[7][close]': {
                timeset: "[name='opening[7][isOpen]']:checked"
                //gt: "[name='opening[7][open]']"
            }
        },
        messages: {
            'opening[0][open]': {
                timeset: "Please enter the opening time"
            },
            'opening[0][close]': {
                timeset: "Please enter the closing time"
            },
            'opening[1][open]': {
                timeset: "Please enter the opening time"
            },
            'opening[1][close]': {
                timeset: "Please enter the closing time"
            },
            'opening[2][open]': {
                timeset: "Please enter the opening time"
            },
            'opening[2][close]': {
                timeset: "Please enter the closing time"
            },
            'opening[3][open]': {
                timeset: "Please enter the opening time"
            },
            'opening[3][close]': {
                timeset: "Please enter the closing time"
            },
            'opening[4][open]': {
                timeset: "Please enter the opening time"
            },
            'opening[4][close]': {
                timeset: "Please enter the closing time"
            },
            'opening[5][open]': {
                timeset: "Please enter the opening time"
            },
            'opening[5][close]': {
                timeset: "Please enter the closing time"
            },
            'opening[6][open]': {
                timeset: "Please enter the opening time"
            },
            'opening[6][close]': {
                timeset: "Please enter the closing time"
            },
            'opening[7][open]': {
                timeset: "Please enter the opening time"
            },
            'opening[7][close]': {
                timeset: "Please enter the closing time"
            }
        }
    }
    $.fn.lbvalidate.services_form = {
        rules: {
            "services[locations]": {
                required: "[name='services[delivery]']:checked"
            },
            "services[minamount]": {
                required: true/*{
                    depends: function() {
                        return $("[name='services[menuonly]']:checked").length == 0;
                    }
                }*/
            },
            "services[servicecharge]": {
                required: "[name='services[eatin]']:checked",
            },
            "services[minimum]": {
                required: "[name='services[delivery]']:checked",
            },
            "services[cost]": {
                required: "[name='services[delivery]']:checked",
            },
            "services[time]": {
                required: "[name='services[delivery]']:checked",
            }
        },
        messages: {
            "services[locations]": {
                required: "Please set the locations where you deliver"
            },
            "services[minamount]": {
                required: "Please enter the minimum order amount"
            },
            "services[servicecharge]": {
                required: "Please enter the service charge amount"
            },
            "services[minimum]": {
                required: "Please enter the minimum amount of delivery"
            },
            "services[cost]": {
                required: "Please enter the cost of delivery"
            },
            "services[time]": {
                required: "Please enter the avarage time of delivery"
            }
        }
    }
    $.fn.lbvalidate.restaurant_form = {
        rules: {
            "name": {
                required: true
            },
            "cuisines": {
                required: true
            }
        },
        messages: {
            "name": {
                required: "Please enter your restaurant's name"
            },
            "cuisines": {
                required: "Please enter your primary cuisine"
            }
        }
    }
    $.fn.lbvalidate.payment_form = {
        rules: {
            "payment[method]": {
                required: true
            }
        },
        messages: {
            "payment[method]": {
                required: "Please select a payment method"
            }
        }
    }
    $.fn.lbvalidate.paypoint_form = {
        rules: {
            "paypoint[strCardHolder]": {
                required: '.sel_pm option.card:selected'
            },
            "paypoint[strAddress]": {
                required: '.sel_pm option.card:selected'
            },
            "paypoint[strCity]": {
                required: '.sel_pm option.card:selected'
            },
            "paypoint[strPostcode]": {
                required: '.sel_pm option.card:selected',
                postCode: true
            }
        },
        messages: {
            "paypoint[strCardHolder]": {
                required: "Please enter the cardholder's name"
            },
            "paypoint[strAddress]": {
                required: "Please enter the cardholder's address"
            },
            "paypoint[strCity]": {
                required: "Please enter the cardholder's town"
            },
            "paypoint[strPostcode]": {
                required: "Please enter the cardholder's postcode"
            }
        }
    }
    $.fn.lbvalidate.defaults = {
        onkeyup: false,
        /*onfocusout: function(e) {
            this.element(e)
        },*/
        //onfocusout: function (element) { $(element).valid(); },
        /*highlight: function (element, errorClass, validClass) {
            var control = $(element).closest('.control-group');
            if (!control.length)
                control = $(element)
            control.addClass(errorClass).removeClass(validClass);
            $(element.form).find("label[for=" + element.id + "]")
                           .addClass(errorClass);
        },
        unhighlight: function (element, errorClass, validClass) {
            var control = $(element).closest('.control-group');
            if (!control.length)
                control = $(element)
            control.removeClass(errorClass).addClass(validClass);
            $(element.form).find("label[for=" + element.id + "]")
                           .removeClass(errorClass);
        }*/
        /*errorPlacement: function (error, element) {
            error.insertBefore(element);
        }*/
        showErrors: function (errorMap, errorList) {
            var relForm = this.currentForm.id
            /*$('.popover[rel="' + relForm + '"]').each(function () {
                if (!$(this).data('popover'))
                    $(this).popover('hide')
            })*/
            //$(".popover[rel='" + relForm + "']").popover('hide');
            $.each(this.successList, function (index, value) {
                var control = $(value).closest('.control-group');
                if (!control.length)
                    control = $(value)
                control.addClass('success').removeClass('error');
                var $element = $(value)
                if ($element.is(':checkbox') || $element.is(':radio')) {
                    var elem = $element.is(':checkbox') ? ':checkbox' : ':radio'
                    var label = $element.closest('.control-group').find(elem + '[name="' + $element.attr('name') + '"]').closest('label').last()
                    if (label.length)
                        $element = label
                }
                else if ($element.is('select')) {
                    var select = $element.closest('.control-group').find('select').last()
                    if (select.length)
                        $element = select
                }
                var popover = $element.data('popover')
                if (popover && popover.tip().hasClass('in')) {
                    popover.tip().removeClass('in')
                    popover.tip().detach()
                }
            })
            $.each(errorList, function (index, value) {
                var control = $(value.element).closest('.control-group');
                if (!control.length)
                    control = $(value.element)
                control.addClass('error').removeClass('success');

                var $element = $(value.element)
                if ($element.is(':checkbox') || $element.is(':radio')) {
                    var elem = $element.is(':checkbox') ? ':checkbox' : ':radio'
                    var label = $element.closest('.control-group').find(elem + '[name="' + $element.attr('name') + '"]').closest('label').last()
                    if (label.length)
                        $element = label
                }
                else if ($element.is('select')) {
                    var select = $element.closest('.control-group').find('select').last()
                    if (select.length)
                        $element = select
                }
                if (!$element.data('popover'))
                    /*popover = */
                    $element.popover({
                        trigger: 'manual',
                        placement: $element.data('placement') || 'right',
                        html: true,
                        content: "<label>" + value.message + "</label>",
                        template: '<div class="popover error" rel="' + relForm + '" style="z-index: 1100;"><div class="arrow"></div><div class="popover-inner"><div class="popover-content"><p class="control-group error"></p></div></div></div>',
                        container: $element.closest('[data-spy="validate"]')
                    })
                //_popover.data('popover').options.content = value.message;
                if (!$element.data('popover').tip().hasClass('in'))
                    $element.popover('show')
            });
        }
    }
    /* LBvalidate DATA-API
    * ================== */
    $(window).on('load', function () {
        $('[data-spy="validate"]').each(function () {
            var $spy = $(this)
            $spy.lbvalidate($spy.data())
        });
    })
}(window.jQuery);