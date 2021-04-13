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
        let default_ = {
            folders: {},
            defaultFolder: '/assets',
            checkedFolders: [], 
            showType: 'icon' // 'icon', 'list'
        };
        this.options = $.extend(true, default_, options)
    }
    
    a.prototype = {
        init: function(){
            // console.log('i am a++');
            let mydate = new Date();
            this.uid = 'uid' + mydate.getDay()+ mydate.getHours()+ mydate.getMinutes()+mydate.getSeconds()+mydate.getMilliseconds()+ Math.round(Math.random() * 10000);
            this.showType = this.options.showType;
            this.folders = this.options.folders;
            this.defaultFolder = this.options.defaultFolder;
            this.presentFolder = this.options.defaultFolder;
            this.checkedFolders = this.options.checkedFolders;
            this.bindEvent();
            this.createElement();
            this.openManagerLayer();
            console.log('*************');
            console.log(this);
            console.log('*************');
            this.render();
            this.bindPlugEvent();
        },
        bindEvent: function(){
            this.$el.click(()=>{this.openManagerLayer()})
        },
        bindPlugEvent: function(){
            let _this = this;

            _this.$target.find('.show-type-change').click(function(){
                let type = $(this).find('i').hasClass('fa-th') ? 'icon': 'list';
                if(type == 'icon'){
                    $(this).find('i').removeClass('fa-th').addClass('fa-list');
                }else if(type == 'list'){
                    $(this).find('i').removeClass('fa-list').addClass('fa-th')
                }
                _this.showType = type;
            })

            _this.$target.find('.last-path').click(function(){
                let now_path = _this.presentFolder;
                let new_path = now_path.split('/').slice(0, -1).join('/');
                let last_path = new_path ? new_path: '/';
                _this.presentFolder = last_path;
                _this.render();
            })

            $(document).on('click', `#${_this.uid}-target-div .path-child`, function(){
                let path = $(this).data('path');
                _this.presentFolder = path
                _this.render();
            })

            console.log($(`#${_this.uid}-target-div .folder-icon-item`).not('input'));
            $(document).on('dblclick' ,$(`#${_this.uid}-target-div .folder-icon-item`).not('input'), function(){
                let path = $(this).data('path');
                if(_this.folders[path]){
                    _this.presentFolder = path
                    _this.render();
                }else{

                }
            })

            $(document).on('change' ,`#${_this.uid}-target-div input[name=checked-folder]`, function(evt){
                let path = $(this).data('path');
                let action = $(this).is(':checked');
                _this.checkedPathChange(path, action);
            })
        },
        openManagerLayer: function(){
            this.$target && this.$target.slideToggle()
        },
        createElement: function(){
            let html = `<div id='${this.uid}-target-div' class='layui-container target-div'>
                            <div id='${this.uid}-target-header' class='layui-row target-header'>
                                <div class='layui-row'>
                                    <div class='layui-col-md11'><i class='fa fa-folder-open'></i>　路径选择工具</div> 
                                    <div class='layui-col-md1 close'><button class='target-body-close layui-btn layui-btn-primary layui-btn-xs'><i class='fa fa-times'></i></button></div>
                                </div><hr class='my-hr'>
                                <div class='layui-row target-tools'>
                                    <div class='layui-col-md8 normal-tools'>
                                        <button class='home-path layui-btn layui-btn-primary layui-btn-xs'><i class='fa fa-home'></i> 首页</button>
                                        <button class='last-path layui-btn layui-btn-primary layui-btn-xs'><i class='fa fa-arrow-circle-left'></i> 上一层</button>
                                        <button class='refresh-path layui-btn layui-btn-primary layui-btn-xs'><i class='fa fa-refresh'></i> 刷新当前</button>
                                    </div>
                                    <div class='layui-col-md4 fast-tools'>
                                        <button class='layui-btn layui-btn-primary layui-btn-xs show-type-change'><i class='fa ${this.showType  == 'icon' ? 'fa-th': 'fa-list'}'></i></button>
                                    </div>
                                </div>
                                <hr class='my-hr'>
                                <div class='layui-row'><span>路径: </span><span class='now-path'></span></div><hr class='my-hr'>
                            </div>
                            <div id='${this.uid}-target-body' class='layui-row target-body'>
                                <!-- <div class='layui-col-md8 folder-show'></div>
                                <div class='layui-col-md4 folder-info'></div> -->
                            </div><hr class='my-hr'>
                            <div id='${this.uid}-target-footer' class='layui-row target-footer'>
                                <div class='layui-col-md1 checked-title'>已选路径</div>
                                <div class='layui-col-md11 checked-path'></div>
                            </div>
                        </div>`

            this.$target = $(html);
            this.$target.css({'display': 'none'})
            this.$el.after(this.$target)
        },
        render: function(){
            this.renderNowPath();
            this.renderTargetBody();
            this.renderCheckbox();
        }
        ,
        renderNowPath: function(){
            let now_path = '';
            if(this.presentFolder == '/'){
                now_path = '/'
            }else{
                let a = this.presentFolder.split('/').filter(p => {return p});
                let b = $.extend(true, [], a);
                b.unshift('');
                a.map((p, i) => {
                    let path = b.slice(0, i + 2).join('/');
                    now_path += `&nbsp;>&nbsp;<span class='path-child' data-path='${path}'>${p}</span>`
                })
            }

            this.$target.find('.now-path').html(now_path);
            // return now_path
        }
        ,
        renderTargetBody: function(){
            let show = this.folders[this.presentFolder];
            let type = this.showType;
            let body = '';
            console.log(show.length);
            if(show.length){
                show.map(folder => {
                    body += (type == 'icon'? this.foldersIconEx(folder): this.foldersListEx(folder)) 
                })
            }else{
                body = `<div class='nothing'>...</div>`
            }

            this.$target.find('.target-body').html(`<div>${body}</div>`);
            // return `<div>${body}</div>`
        },
        foldersIconEx: function(folder){
            return `<div class='folder-icon-item' data-path='${folder.path}'>
                        <div class='check'><input type='checkbox' data-path='${folder.path}' name='checked-folder'></div>
                        <div title='${folder.path}'><i class='fa fa-folder-open-o fa-3x'></i></div>
                        <span title='${folder.path.split('/').pop()}'>${folder.path.split('/').pop()}</span>
                    </div>`        
        },
        foldersListEx: function(folder){
            return
        },
        checkedPathChange: function(path, action){
            // 改变当前选中的事件
            let flag = false;
            // 是否当前路径全选
            let allCheck = $(`#${this.uid}-target-div input[name=checked-folder]`).not('input:checked').length;
            if(action){
                // 没选中到选中
                this.checkWholeCheck(path);
                flag = true;
                // if(allCheck){
                //     if(!this.checkedFolders.includes(path)){
                //         this.checkedFolders.push(path);
                //         flag = true;
                //     }
                // }else{
                //     // this.checkWholeCheck(path);
                //     //当前路径都选中
                //     // let f = $.extend(true, [], path.split('/'))
                //     // f.pop();
                //     // let f_path = f.join('/')
                //     // let f_path_children = this.folders[f_path].map(f => {return f.path});
                //     // let checked_folders = this.checkedFolders;
                //     // let new_ = checked_folders.filter(c => {
                //     //     return !f_path_children.includes(c)
                //     // })

                //     // new_.push(f_path)
                //     // this.checkedFolders = new_;
                //     // flag = true;
                // }
            }else{
                // 选中到不选中
                if(allCheck != 1){
                    if(this.checkedFolders.includes(path)){
                        let new_ = this.checkedFolders.filter(f => {return f != path});
                        this.checkedFolders = new_;
                        flag = true;
                    }
                }else{
                    // 当前路劲全选中然后删除其中的一个
                }
            }

            flag && this.renderCheckedFolders();
        },
        renderCheckedFolders: function(){
            let checked = this.checkedFolders;
            let body = '';

            if(checked){
                checked.map((c, i) => {
                    body += `<div class='layui-row folder-checked-item'><div class='layui-col-md10'>${i + 1}、${c}</div><div class='layui-col-md1 checked-item-del'><i class='fa fa-trash'></i></div></div>`
                })
            }

            $(`#${this.uid}-target-div .target-footer .checked-path`).html(body)
        },
        renderCheckbox: function(){
            let checkboxes = $(`#${this.uid}-target-div .target-body input[name=checked-folder]`);
            let checkedFolders = this.checkedFolders;

            checkboxes.each((i, c) => {
                let path =$(c).data('path');
                let flag = '';
                let r = checkedFolders.some((f, j) => {
                    if(path.indexOf(f) == 0){
                        // 是选中的路径子集
                        flag = 'whole_check'
                        $(c).prop('checked', true);
                        return true
                    }else if(f.indexOf(path) == 0){
                        flag = 'half_check';
                        $(c).prop('checked', false);
                        $(c).prop('indeterminate', true);
                        return true
                    }
                })
                // if(this.checkedFolders.includes(path)){
                //     // $(c).prop('checked', true);
                    
                // }
            })
        },
        checkWholeCheck: function(path){
            // 检查全选
            let f = $.extend(true, [], path.split('/'))
            f.pop();
            let f_path = f.join('/'); // 父层
            let f_path_children = this.folders[f_path].map(f => {return f.path}); // 父的子路径
            let checked_folders = this.checkedFolders.concat([path]); // 已选中
            let whole_check = f_path_children.every(f => checked_folders.includes(f));
            
            if(whole_check){
                let new_ = this.checkedFolders.filter(c => {
                        return !f_path_children.includes(c)
                    })

                new_.push(f_path)
                this.checkedFolders = new_;
                this.checkWholeCheck(f_path)
            }else{
                return false
            }
        }

    }

    return new a(el, options);
});