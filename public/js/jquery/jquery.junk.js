/*
 * Bad controller implementation, but quick and it'll do. ;P
 */
(function(){

  $.fn.name_changer = function( options ){
    
    if ( !this.length ) return;

    var settings = $.extend({}, options);
    
    return this.each(function(){
      var controller = $(this), name_node = $('.name', this);

      /* if jQuery cookie is available. */
      if ($.cookie && $.cookie('nw_name')){
        name_node.text($.cookie('nw_name'));
      }
      
      /* Don't care for the dependency here. */
      map.presenter.updateUserName(name_node.text());
      
      controller.delegate('a', 'click', 
        function(){
          var name = $('.name', controller).text();
          controller.html('<form><input type="text" value='+name+' /><button type="submit">That\'s me.</button></form>');
          controller.find('input').trigger('select');
          return false;
        });
        
      controller.delegate('form', 'submit', 
        function(){
          var name = $('input', controller).val();
          map.presenter.updateUserName(name);
          $.cookie && $.cookie('nw_name', name); /* Write name cookie if we can. */
          controller.html('Sup, <span class="name">'+name+'</span>. <a href="/">Change name</a>');
          return false;
        });    
    });    
  };

  $.fn.multiview = function( a, b ){

    if ( !this.length ) return;
    
    var data = this.data('multiview');    
    if (data && data[a]){
      return data[a].call(this, b)      
    }
    
    var settings = $.extend({ index: 0 }, a);
    
    return this.each(function(){
      var children = $(this).children().hide(), 
          hide = function(){ children.hide(); };
      
        $(this).data('multiview', {
          hide:hide,
          show: function( index ){
            hide();
            children.eq(index).show();
            return this;
          }
        });
    });
  };

  $.fn.actions = function(){
    if (!this.length) return;
    return this.each(function(){
      var controller = $(this);
      
      controller.delegate('tr', 'click', function(e){
        var target = $(e.target);
        if (target.is('button')){
          controller.find('input').val(0);
          $(this).find('input').val(9999);
        }        
      });
      
      controller.delegate('.deploy-button', 'click', function(){
        controller.find('input').each(function(){
          var input = $(this), val = input.val(), to = input.data('to');
          if (val && val != '0' && to){
            map.presenter.moveSomeTroops(to, val)
            input.val(0);
          }            
        });      
      });
    });
  };
  
  
  $('#action-panel').actions();
  $('.multiview').multiview();
  $('#name').name_changer();

})(jQuery);