$().ready(function () {
    var launch = new Date(2013, 07, 01, 10).getTime()
    var start = new Date(2012, 08, 31).getTime()
    var today = new Date().getTime()
    var amount_total = (launch - start)
    var current_value = (today - start)
    var progress = Math.floor((current_value / amount_total) * 100)
    var status = $('.status')
    var $bar = status.find('.bar')
    var prgs = $('#prgs')
    var process = setInterval(function () {
        var current = Math.floor(prgs.text())
        if (current >= progress) {
            clearInterval(process);
        }
        text = Math.round(100 * $bar.height() / status.height())
        prgs.text(text)
    }, 50)
    $bar.css({ height: progress + '%' })
    status.find('.tooltip').css({ bottom: progress + '%' })
    new Countdown({
        target: "countdown",
        style: "flip",
        rangeHi  : "month",
        rangeLo: "minute",
        height: 50,
        year: 2013, 
        month: 7,
        day: 1,
        hour: 10
    });
    $('form[data-async]').on('submit', function (e) {
        e.preventDefault();
        var form = $(this);
        if (form.valid()) {
            var user = (this.id !== 'rest')
            $.ajax({
                url: this.action,
                type: this.method,
                data: form.serialize(),
                success: function (data) {
                    form.find('.info').html(data)
                    form.find('.data').toggle()
                    if (user)
                        analytics.track('User subscribed on landing page', data)
                    else
                        analytics.track('Restaurant subscribed on on landing page', data)
                },
                error: function (err) {
                    form.find('.info').html(err)
                    return false;
                }
            });
        }
    });
});