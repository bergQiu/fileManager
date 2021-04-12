// 文件管理器插件
;(function($ , factory){
    let layer;
    let plugs = ['layer'];

    layui.use(plugs, function(){
        layer = layui.layer;
    })

    $.fn.fileManager = function(options){
        let fm = factory(this, options);
        fm.init();
    };
})(jQuery, function(el, options){
    let a = function(el, options){
        this.$el = el;
        this.options = $.extend(true, {}, options)
    }
    
    a.prototype = {
        init: function(){
            // console.log('i am a++');
            let mydate = new Date();
            this.uid = 'uid' + mydate.getDay()+ mydate.getHours()+ mydate.getMinutes()+mydate.getSeconds()+mydate.getMilliseconds()+ Math.round(Math.random() * 10000);
            this.bindEvent();
            this.createElement();
        },
        bindEvent: function(){
            console.log(1);
            console.log(this);
            this.$el.click(()=>{this.openManagerLayer()})
        },
        openManagerLayer: function(){
            // console.log('hello ');
            // console.log('打开弹窗');
            this.$target && this.$target.slideToggle()
        },
        createElement: function(){
            console.log(3);
            console.log(this);
            let html = `<div id='${this.uid}-target-div' class='layui-container target-div'>
                            <div class='layui-row target-header'><i class='fa fa-folder-open'></i>　路径选择工具</div>
                            
            </div>`

            this.$target = $(html);
            this.$target.css({'display': 'none'})
            this.$el.after(this.$target)
        }
    }

    return new a(el, options);
});