/* ---------------------------------------------------------------------
SuperFormElements v1.6.2
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
    lastClick: null,
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
                .on("click.SuperFormElements", {$elem: $elem ,self: this}, self.showSelect);

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
    showSelect: function(e){
        var self = e.data.self,
            $elem = e.data.$elem.parent();
        //Hides all other open select forms
        $('.'+self.$options.prefixClass+'select').children('ul').hide();
        //Ignore deactivated ones
        if($elem.hasClass(self.$options.deactivatedClass)) {
            return;
        }
        self.setSelectWidth($elem);
        if( !$elem.hasClass(self.$options.activeClass) ) {
            self.lastClick = $(e.target);
            //test for click on option list
            if( $(e.target).prop('tagName') !== "LI" ){
                $elem.addClass(self.$options.activeClass)
                    .children('ul').show();
            } else {
                $(document).trigger("click.SuperSelectClose");
            }
        } else {
            if($(e.target)[0] === self.lastClick[0] ){
                $elem.addClass(self.$options.activeClass)
                    .children('ul').show();
            }
            if($(e.target) === $elem || $(e.target).parent()[0] == $elem[0]){
                $(document).trigger("click.SuperSelectClose");
            }
        }
        //Don't trigger the document handler until actually clicked again
        e.stopPropagation();
        $(document).one("click.SuperSelectClose", function(k){
            $(e.target)
                .parent()
                    .removeClass(self.$options.activeClass)
                .children('ul')
                    .hide();
        });
    },
    setSelectWidth: function($wrapper){
        var self = this;
        $wrapper.children('ul').width( ($wrapper.children('span').outerWidth() + self.$options.dropdownWidthShift) );
    },
    reportSelectItem: function(e){
        e.data.self.switcher(e.data.$elem, 'selected', $(e.target));
        e.data.$wrapper.children('span').text( e.data.$elem.children(':selected').text() );
        $('.'+e.data.self.$options.prefixClass+'select')
            .removeClass(e.data.self.$options.activeClass)
            .children('ul').hide();
    },
    reportCheckbox: function(e){    
        if( $(e.target).prop('tagName') !== "DIV" ){ //Account for clicks on ancestor labels
            e.data.$elem.parent('div').toggleClass(e.data.self.$options.activeClass);           
            return;
        }
        e.data.self.switcher(e.data.$elem, 'checked');
        e.preventDefault();
    },
    reportRadio: function(e){
        $('input[name*="' + $(e.data.$elem).prop('name') + '"]').parent().removeClass(e.data.self.$options.activeClass);
        if( $(e.target).prop('tagName') !== "DIV" ){ //Account for clicks on ancestor labels
            e.data.$elem.parent('div').toggleClass(e.data.self.$options.activeClass);           
            return;
        }
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
        $(document).trigger("click.SuperSelectClose");
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