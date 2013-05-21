$().ready(function () {
    $('[placeholder]').focus(function () {
        var input = $(this)
        if (input.val() == input.attr('placeholder')) {
            input.val('')
            input.removeClass('ph-fix')
        }
    }).blur(function () {
        var input = $(this)
        if (input.val() == '' || input.val() == input.attr('placeholder')) {
            input.addClass('ph-fix')
            input.val(input.attr('placeholder'))
        }
    }).blur()
    $('[placeholder]').parents('form').onPre('submit', function () {
        $(this).find('[placeholder]').each(function () {
            var input = $(this)
            if (input.hasClass('ph-fix')) { //input.val() == input.attr('placeholder')
                input.val('')
            }
        })
    })
});