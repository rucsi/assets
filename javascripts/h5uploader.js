function h5uploader(elementId, options) {
    options.maxWidth = options.maxWidth || 640;
    options.maxHeight = options.maxHeight || 480;

    var el = document.getElementById(elementId);
    el.appendChild(getTemplateEl());

    var inputEl = document.getElementById('uploader-files');
    inputEl.addEventListener('change', handleFiles, false);

    function onStart(name) {
        document.getElementById('uploader-progress').appendChild(getProgTemplateEl(name));
    }

    function onProgress(name, loaded, total, percent) {
        document.getElementById('bar-' + name).style.width = percent + '%';
    }

    function onComplete(response) {
        document.getElementById('uploader-progress').innerHTML = '';
        if (options.onComplete) options.onComplete(response);
    }

    function handleFiles() {
        var uploading = this.files.length;
        Array.prototype.forEach.call(this.files, function (file) {
            loadImage(file, function (dataUrl) {
                resizeImage(dataUrl, file.type, function (data) {
                    postData('/images', data, file.name, file.type, function (response) {
                        uploading--;
                        if (uploading == 0) onComplete(response);
                    });
                });
            });
        });
    }

    function loadImage(file, callback) {
        if (!file.type.match('image.*')) {
            throw new Error('File "' + file.name + '" is not an image.');
        }

        var reader = new FileReader();
        reader.onloadend = function () {
            callback(this.result);
        }
        reader.readAsDataURL(file);
    }

    function resizeImage(dataUrl, type, callback) {
        var img = document.createElement('img');
        img.src = dataUrl;

        img.onload = function () {
            var width = img.width;
            var height = img.height;

            if (width > height) {
                if (width > options.maxWidth) {
                    height *= options.maxWidth / width;
                    width = options.maxWidth;
                }
            } else {
                if (height > options.maxHeight) {
                    width *= options.maxHeight / height;
                    height = options.maxHeight;
                }
            }

            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            var data = canvas.toDataURL(type);
            callback(data);
        }
    }

    function postData(url, data, name, type, callback) {
        var xhr = new XMLHttpRequest();

        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                var percent = Math.round(e.loaded / e.total * 100);
                onProgress(name, e.loaded, e.total, percent);
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var response = JSON.parse(xhr.responseText);
                callback(response);
            }
        }

        onStart(name);

        xhr.open('POST', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('X-File-Name', encodeURIComponent(name));
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.setRequestHeader('X-Mime-Type', type);
        var bstring = atob(data.split(',')[1]);
        xhr.sendAsBinary(bstring);
    }

    function getTemplateEl() {
        var tmplHtml = '<div class="btn btn-primary" style="width: auto; position: relative; overflow: hidden; direction: ltr;"><i class="icon-upload icon-white icon-large"></i> Upload image(s)<input id="uploader-files" type="file" name="files" multiple="multiple" style="position: absolute; right: 0px; top: 0px; margin: 0px; padding: 0px; cursor: pointer; opacity: 0;"></div><div id="uploader-progress" style="padding: 20px;"></div>';
        var tmplEl = document.createElement('div');
        tmplEl.innerHTML = tmplHtml;
        return tmplEl;
    }

    function getProgTemplateEl(name) {
        var progTmplEl = document.createElement('div');
        progTmplEl.className = 'progress progress-striped active';
        progTmplEl.innerHTML = '<div id="bar-' + name + '" class="bar" style="width: 0%;">' + name + '</div>';
        return progTmplEl;
    }
}

// xhr.sendAsBinary polyfill
if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
    XMLHttpRequest.prototype.sendAsBinary = function (string) {
        var bytes = Array.prototype.map.call(string, function (c) {
            return c.charCodeAt(0) & 0xff;
        });
        this.send(new Uint8Array(bytes));
    };
}

(function ($) {

    $.fn.h5uploader = function () {
        return this.each(function () {
            var $element = $(this)
            var uploader = new h5uploader(this.id, {
                onComplete: function (response) {
                    if ($element.data('upload') == 'reload') {
                        window.location.reload(true)
                    } else {
                        $element.trigger('uploadComplete', response)
                    }
                }
            });
        });
    }

})(jQuery);