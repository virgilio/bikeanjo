(function () {
   'use strict';

    $(function () {
        var frm = $('#mailing');
        frm.submit(function () {
            $.ajax({
                type: frm.attr('method'),
                url: frm.attr('action'),
                data: frm.serialize(),
                success: function (data) {
                    if (data.success) {
                        $('.subscribe-form').hide();
                        $('.subscribe-success').show();
                    }
                },
                error: function(data) {
                    console.error(data);
                }
            });
            return false;
        });

        $(':input[data-bind-to]').each(function(evt){
            var $self = $(this);
            var $target = $($self.attr('data-bind-to'));

            $target.on('keyup paste', function(evt1){
                $self.val($target.val());
            });
        });

        $(':input[data-composed-bind]').each(function(evt){
            var $self = $(this);
            var $targets = $($self.attr('data-composed-bind'));

            var format = $self.attr('data-composed-format');
            if(format){
                $targets.on('change paste', function(evt1){
                    var values = $targets.map(function(){ return $(this).val(); });
                    try {
                        $self.val(vsprintf(format, values));
                    } catch(e) { }
                });
                return;
            }

            var bitoptions = $self.attr('data-composed-bitoptions');
            if(bitoptions) {
                $targets.on('change', function(evt1){
                    var value = 0;
                    $targets.each(function(i,e){
                        var checked = e.checked || $(e).is(':checked');
                        var integer = parseInt(e.value, 10);
                        if(checked) {
                            value = value | integer;
                        }
                    });
                    $self.val(value);
                });
            }

        });

        $('[data-dismiss=card]').click(function(evt){
            $(this).parents('.card').hide();
        });

        $('.form-group .radio .icons,:input:visible').each(function(i) {
            var $this = $(this);
            $this.prop('tabindex', i + 1);
        });

        $("[data-toggle='switch']").each(function(idx, el){
            $(el).bootstrapSwitch({
                'baseClass': 'switch',
            });
        });

        $('[data-file-preview]').each(function(){
            var $image = $(this);
            var $target = $($image.attr('data-file-preview'));

            $target.change(function(evt){
                if (this.files && this.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $image.attr('src', e.target.result);
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
        });

        $('[data-counter]').each(function(i){
            var $this = $(this);
            var value = parseInt($this.attr('data-counter'), 10) || 1;
            var duration = parseInt($this.attr('data-counter-duration'), 10) || 500;
            var timeout = duration / (value > 0 ? value : 1);
            var factor = Math.pow(10, Math.floor(Math.log10(value)));
            var current = 0;
            $this.text(current);

            function increment() {
                current += Math.ceil(Math.random() * factor);

                if(current < value) {
                    $this.text(current);
                    setTimeout(increment, timeout);
                } else {
                    $this.text(value);
                }
            }
            increment();
        });

        $('select[autocomplete]').each(function(i){
            var $select = $(this).hide();
            var $ac_results = $('<div class="ac_results">')
                .appendTo(document.body);

            var $input = $('<input type="text">')
                .attr('class', $select.attr('class'))
                .attr('tabindex', $select.attr('tabindex'))
                .val($select.find(':selected').text())
                .insertAfter($select);

            var options = $select.find('option').map(function(i,e){
                return {
                    label: $(e).text(),
                    value: $(e).attr('value'),
                    desc: $(e).attr('desc')
                };
            }).toArray();

            $(window).resize(function(){
                $ac_results.css('top', ($input.offset().top + $input.outerHeight(true)) + 'px');
                $ac_results.css('left', ($input.offset().left) + 'px');
            });
            $(window).trigger('resize');

            $input.autocomplete({
                'source': options,
                'minLength': 3,
                'appendTo': $ac_results,
                'focus': function( event, ui ) {
                    $input.val(ui.item.label);
                    return false;
                },
                'select': function( event, ui ) {
                    $select.val(ui.item.value);
                    return false;
                }
            }).autocomplete( "instance" )._renderItem = function( ul, item ) {
              return $( "<li>" )
                .append(item.label + (item.desc?" ("+item.desc+")":''))
                .appendTo( ul );
            };

            $input.blur(function(evt){
                var selected = $select.find('option:selected').text();
                if(selected !== $input.val()) {
                    $input.val(selected);
                }
            });
        });

        $('input[ac-source]').each(function(i){
            var $input = $(this);
            var api = $input.attr('ac-source');
            var query = $input.attr('ac-query-var');
            var initial_text = $input.attr('ac-initial-text');
            var initial_value = $input.attr('ac-initial-value');

            var $holder = $('<input type="hidden">').attr('name', $input.attr('name'));
            $input.attr('name', 'fake_' + Math.random().toString(16)).val(initial_text);
            $holder.insertAfter($input).val(initial_value);

            // adjust placement of dropdown
            var $ac_results = $('<div class="ac_results">').appendTo(document.body);
            $(window).resize(function(){setTimeout(function(){
                $ac_results.css('top', ($input.offset().top + $input.outerHeight(true)) + 'px');
                $ac_results.css('left', ($input.offset().left) + 'px');
            }, 500);}).trigger('resize');


            var filters = { };
            if($input.attr('ac-filter')) {
                eval('filters = ' + $input.attr('ac-filter'));
            }

            function source(request, response) {
                var data = jQuery.extend({}, filters);
                data[query] = request.term;
                $.get(api, data).success(function(data){
                    var options = data.results.map(function(obj){
                        return {
                            'label': obj.name,
                            'value': obj.id,
                            'desc':  obj.city_name,
                        }
                    });
                    response(options);
                });
            }

            function onselect (event, ui) {
                $holder.val(ui.item.value);
                $input.val(ui.item.label);
                return false;
            }

            function onfocus (event, ui) {
                return false;
            }

            $input.autocomplete({
                'source': source,
                'autoFocus': true,
                'minLength': 2,
                'delay': 100,
                'appendTo': $ac_results,
                'select': onselect,
                'focus': onfocus,
            }).attr('autocomplete', false)
              .prop('autocomplete', false)
              .autocomplete( "instance" )._renderItem = function( ul, item ) {
                var li = $( "<li>" ).append( "<a>" + item.label + "</a>" );

                if(item.desc && item.desc !== item.label){
                    li.append( "<a>" + item.desc + "</a>" )
                }

                return li.appendTo( ul );
            };
        });

        $('a[target=_popup]').click(function(evt){
            var href = $(this).attr('href');
            var title = $(this).attr('title') || 'Share';
            var left = Math.floor(($(window).width() - 500) / 2);
            var top = Math.floor(($(window).height() - 300) / 2);
            var win = window.open(href, title, 'left='+left+',top='+top+',width=500,height=300,toolbar=no,location=no');

            if(win) {
                evt.preventDefault();
            }
        });

        $('form[ajax]').each(function(idx, el){
            var $el = $(el);

            $el.submit(function(evt) {
                evt.preventDefault();
                var method = $el.attr('method') || 'post';
                var action = $el.attr('action');
                var data = $el.serializeArray();

                return $.ajax(action, {
                    'method': method,
                    'data':data
                }).always(function(content, status, response){
                    var callback = $el.attr('ajax-' + status);
                    if(callback) {
                        var result = eval('(' + callback + ')');
                    }
                });
            });
        });

        $(':input[from-queryvar]').each(function(idx, el){
            var $el = $(el);
            var query = $el.attr('from-queryvar');
            
            if(!query || !document.location.search) {
                return;
            }

            var regex = new RegExp(query+'=([^&]+)'); 
            var match = document.location.search.match(regex);

            if(match) {
                $el.val(decodeURI(match[1]));
            }
        });

        $('[send-to][send-content]').click(function(evt){
            var $el = $(this);
            $($el.attr('send-to')).val($el.attr('send-content'));
        });

        (function setupMobileMenu(){
            $('button.toggle-menu').jPushMenu({
                menuOpenClass      : 'cbp-spmenu-open',
                closeOnClickOutside: true,
                closeOnClickLink   : false
            });

            var cbp_spmenu = null;
            window.onscroll = function() {
                if(cbp_spmenu) {
                    if(window.scrollY <= 90) {
                        cbp_spmenu.style.top = (90 - window.scrollY) + 'px';
                    } else {
                        cbp_spmenu.style.top = '0';
                    }
                }
            };

            $('button.toggle-menu').click(function(){
                cbp_spmenu = $('.cbp-spmenu-open').length ? $('.cbp-spmenu-open')[0] : null;
            });
        })();

        if( $(window).width() <= 992 ) {
            $('#navbar .user-menu .dropdown').addClass('open');
        }
    });

    var match = document.cookie.match(/csrftoken=(\w+)/);
    var token = match ? match[1] : '';
 
    $.ajaxSetup({
        headers: { 'X-CSRFToken': token }
    });

    $(document).on('keydown.radio.data-api', '[data-toggle^=radio], .radio', function (e) {
        if( e.type === 'keydown' && e.keyCode === 32 ){
            $(this).trigger('click.radio.data-api');
        }
    });
})();
