(function (window, document, w) {

    w.fn.popup = function (data) {
        this.close_skip = 0;
        this.dom = {
            header: $('#popup-container .popup-header'),
            body: $('#popup-container .popup-body'),
            footer: $('#popup-container .popup-footer'),
            bg: $('#popup-container, #popup-bg')
        };
        this.w = data.w;
        this.on_close = null;

        var t = this;
        var popup_bg = $('#popup-container'),
            popup = $('#popup');

        $(document).on('click', '#' + popup_bg.attr('id'), function () {
            t.hide({from: 'bg'});
        });
        $(document).on('click', '#' + popup.attr('id'), function () {
            t.hide({from: ''});
        });
    };
    w.fn.popup.prototype = {
        constructor: w.fn.popup,
        show: function (data) {
            this.dom.header.html(data.header);
            this.dom.body.html(data.body);
            this.dom.footer.html(data.footer);

            if (data.callback.open && isFunction(data.callback.open)) {
                data.callback.open();
            }
            if (data.callback.close && isFunction(data.callback.close)) {
                this.on_close = data.callback.close;
            }

            this.dom.bg.removeClass('hidden');

            this.w.selected = data;
        },
        hide: function (data) {
            if (data.from === '') {
                this.close_skip = true;
            } else if (this.close_skip === true) {
                this.close_skip = false;
            } else if (data.from.length > 0) {
                if (data.callback && isFunction(data.callback)) {
                    data.callback();
                }
                if (this.on_close && isFunction(this.on_close)) {
                    this.on_close();
                    this.on_close = null;
                }

                this.dom.bg.addClass('hidden');
            }
        }
    };

    w.fn.create_url = function (data) {
        this.dom = {};
        this.html = {
            header: '',
            body: '',
            footer: ''
        };
        this.w = data.w;

        var col = $('.board-1px-col');
        var t = this;

        col.hover(function () {
            $('#selected-block').text($(this).data('row') + '-' + $(this).data('col'));
        }, function () {
            $('#selected-block').text('-');
        });

        $(document).on('click', '.board-1px-col', function () {
            var data = {
                col: $(this).data('col'),
                row: $(this).data('row')
            };
            t.show(data);
        });

        $('.board-1px-a').each(function () {
            if ($(this).attr('title').length > 0) {
                $(this)[0].id = 'board-1px-a-' + Math.round(Math.random() * 10000);

                t.createTooltip($(this)[0].id, $(this).attr('title'));
            }
        });

        $.ajax('ajax.php?html=board_popup_create_url', {
            success: function (data) {
                if (data.ajax) {
                    data.ajax.click = {
                        success : function (data_sucess) {
                            t.hide();
                            t.createItem(data_sucess);
                        }
                    };

                    w.register(data.ajax);
                }

                if (data.html && data.html.board_popup_create_url) {
                    t.html.header = data.html.board_popup_create_url.header;
                    t.html.body = data.html.board_popup_create_url.body;
                    t.html.footer = data.html.board_popup_create_url.footer;
                }
            },
            error: function () {
            },
            complete: function () {
            }
        });
    };
    w.fn.create_url.prototype = {
        constructor: w.fn.create_url,
        show: function (data) {
            data.callback = {
                open: function () {
                    $('#board-popup-col').val(data.col);
                    $('#board-popup-row').val(data.row);
                    $("#board-popup-color").drawrpalette();
                },
                close: function () {
                    $("#board-popup-color").drawrpalette('destroy');
                }
            };
            data.header = this.html.header;
            data.body = this.html.body;
            data.footer = this.html.footer;

            this.w.popup.show(data);
        },
        hide: function () {
            this.w.popup.hide({ from : 'create_url'});
        },
        createItem : function (data) {
            w.log(data);
            var div = $('.board-1px-' + data.row + '-' + data.col);
            var rand = Math.round(Math.random() * 1000);
            var id = 'board-1px-a-' + rand;
            var html = '<a href="' + data.url + '" ' +
                'class="board-1px-a" ' +
                'style="background-color: ' + data.color + '" ' +
                'title="' + data.title + '" ' +
                'id="' + id + '"' +
            '>'
            + '</a>'
            ;

            div.html(html);

            this.createTooltip(id, data.title);
        },
        createTooltip : function (id, title) {
            var t = new w.fn.Tooltip(id, {
                text: title,
                className: '',
                marginTop: 0
            });
        }

    };

    $(document).ready(function () {
        w.popup = new w.fn.popup({w: w});
        w.create_url = new w.fn.create_url({w: w});
    });

})
(window, document, w);
