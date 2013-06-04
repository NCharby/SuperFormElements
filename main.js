/* ---------------------------------------------------------------------
SuperFormElements v1.6
Author: Nick Charbonneau
Replaces native form elements with CSS3 friendly divs and replicates behavior
Selects, radios, and checkboxes supported.  Just add super-form to any object.
Init Options:
    selectDataAttr: Name of the data- attribute used to reference the replacement list items
    activeClass:    Class added to selected elements 
    generalClass:   Trigger class. Should be applied to the parent form element
    deactivatedClass: If this class is present on a select, the select will not open.
    prefixClass:    Prefix for class added to new form elements
    wrapperTag:     Type of tag used for new elements
    dropdownWidthShift: Adds or subtracts from the width the dropdowns. (useful for matching up borders)
------------------------------------------------------------------------ */
PIQ.SuperFormElements = {
    $options: {
        selectDataAttr: 'selOption',
        activeClass:    'active',
        generalClass:   'super-form',
        deactivatedClass:'is-deactivated',
        prefixClass:    'super-',
        wrapperTag:     'div',
        dropdownWidthShift: -1
    },

    init: function(opt){
        var self = this;
        self.$options = $.extend( self.$options, opt);
        if( $('.'+self.$options.generalClass).length > 0 ){            
            $('.'+self.$options.generalClass).find('input[type="radio"], input[type="checkbox"], select').each(function(){
                var elem = $(this);
                elem.wrap(function(){
                    return self.wrapElems(elem)
                });
                self.bind(elem);
            });            
        };
    },
    wrapElems: function(elem){
        var self = this;
        if (elem.prop('tagName') == "SELECT" ){
                elem.hide();                        
                return '<' 
                    + self.$options.wrapperTag 
                    + ' class="' 
                    + self.$options.prefixClass 
                    + 'select ' 
                    + ((elem.attr('class')) ? elem.attr('class') : '')
                    + '" />'
            } else {
                elem.hide();                        
                return '<' 
                    + self.$options.wrapperTag 
                    + ' class="' 
                    + self.$options.prefixClass 
                    + elem.attr('type')
                    + ' ' 
                    + ((elem.attr('class')) ? elem.attr('class') : '')
                    + ' '
                    + ((elem.prop("checked") == true) ? ' '+self.$options.activeClass : '' )
                    +'" />';
            };
    },
    bind: function($elem){
        var self = this;        
        if ($elem.prop('tagName') == "SELECT" ){
            self.buildSelect($elem);

            $elem.parent('div')
                .on("click.SuperFormElements", {$elem: $elem ,self: this}, self.toggleSelect);

        } else {
            if($elem.attr('type') == 'checkbox' ){
                $elem.parent('div')
                    .on("click.SuperFormElements", {$elem: $elem ,self: this}, self.reportCheckbox);
            };
            if($elem.attr('type') == 'radio' ){
                $elem.parent('div')
                    .on("click.SuperFormElements", {$elem: $elem ,self: this}, self.reportRadio);
            };
        };
    },
    buildSelect: function($elem){
        var self = this,
        $wrapper = $elem.parent();

        $wrapper
            .append(function(){
                var newList = '<span>'
                            + $elem.children(':selected').text()
                            + '</span> \n <ul> \n';
                $elem.children()
                    .each(function(){
                        newList = newList   + '<li class="'
                                            + (($(this).text() == $elem.children(':selected').text() ) ? 'active' : '')
                                            + '" data-'
                                            + self.$options.selectDataAttr
                                            + '="'
                                            + $(this).val()
                                            + '" >'
                                            + $(this).text()
                                            + '</li> \n';
                        });
                newList = newList + '</ul>';
                return newList;
            })
            .children('ul').children()
                .on("click.SuperFormElements", {$elem: $elem, $wrapper: $wrapper, self: self}, self.reportSelectItem);

    },
    toggleSelect: function(e){
        //Hides all other open select forms
        $('.'+e.data.self.$options.prefixClass+'select').children('ul').hide();
        
        if(e.data.$elem.hasClass(e.data.self.$options.deactivatedClass)) {
            return false;
        }
        e.data.self.setSelectWidth(e.data.$elem.parent());
        e.data.$elem.parent().children('ul').toggle();

        //Don't trigger the document handler until actually clicked again
        e.stopImmediatePropagation();
        $(document).one("click.SuperSelectClose", function(j){
            $(e.target).parent().children('ul').hide();
        });
    },
    setSelectWidth: function($wrapper){
        var self = this;
        $wrapper.children('ul').width( ($wrapper.children('span').outerWidth() + self.$options.dropdownWidthShift) );
    },
    reportSelectItem: function(e){
        e.data.$wrapper.children('ul').children().removeClass(e.data.self.$options.activeClass);
        e.data.self.switcher(e.data.$elem, 'selected', $(e.target));
        e.data.$wrapper.children('span').text( e.data.$elem.children(':selected').text() );
    },
    reportCheckbox: function(e){
        e.data.self.switcher(e.data.$elem, 'checked');
    },
    reportRadio: function(e){
        $('input[name*="' + $(e.data.$elem).prop('name') + '"]').parent().removeClass(e.data.self.$options.activeClass);
        e.data.self.switcher(e.data.$elem, 'checked');
    },
    switcher: function($elem, type, $caller){
        if($caller){
            $elem.val($caller.attr('data-'+this.$options.selectDataAttr));
            $caller.toggleClass(this.$options.activeClass);
        } else {
            if($elem.prop(type)){
               $elem.prop(type, false);
            } else {
                $elem.prop(type, true);
            };            
            $elem.parent('div').toggleClass(this.$options.activeClass);
        };
    },
    update: function(){
        var self = this;
        $('.'+self.$options.generalClass).find('input[type="radio"], input[type="checkbox"], select').filter(":visible").each(function(){
            var elem = $(this);
            elem.wrap(function(){
                return self.wrapElems(elem)
            });
            self.bind(elem);
        });
    }
};