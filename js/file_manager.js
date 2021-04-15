// 文件管理器插件
;(function($ , factory){
    let layer;
    let plugs = ['layer'];

    $.fn.fileManager = function(options){
        let fm = factory(this, options);
        fm.init();
    };
})(jQuery, function(el, options){
    let a = function(el, options){
        this.$el = el;
        let default_ = {
            folders: {},
            homePath: '/',
            defaultFolder: '/assets',
            checkedFolders: [], 
            showType: 'list', // 'icon', 'list',
            getDirsUrl: '#',
            callBack: undefined
        };
        this.options = $.extend(true, default_, options)
    }
    
    a.prototype = {
        init: function(){
            let mydate = new Date();
            this.uid = 'uid' + mydate.getDay()+ mydate.getHours()+ mydate.getMinutes()+mydate.getSeconds()+mydate.getMilliseconds()+ Math.round(Math.random() * 10000);
            this.showType = this.options.showType;
            this.folders = this.options.folders;
            this.defaultFolder = this.options.defaultFolder;
            this.presentFolder = this.options.defaultFolder;
            this.checkedFolders = this.options.checkedFolders;
            this.bindEvent();
            this.createElement();
            this.render();
            this.bindPlugEvent();
            this.renderCheckedFolders();
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
                    type = 'list'
                }else if(type == 'list'){
                    $(this).find('i').removeClass('fa-list').addClass('fa-th');
                    type = 'icon'
                }
                _this.showType = type;
                _this.renderTargetBody();
            })

            _this.$target.find('.last-path').click(function(){
                let now_path = _this.presentFolder;
                let new_path = now_path.split('/').slice(0, -1).join('/');
                let last_path = new_path ? new_path: '/';
                _this.presentFolder = last_path;
                _this.render();
            })

            _this.$target.find('.home-path').click(function(){
                _this.presentFolder = _this.options.homePath || '/';
                _this.render();
            })

            _this.$target.find('.close').click(function(){
                _this.$target.slideToggle();
            })

            _this.$target.find('.clear-all-checked').click(function(){
                _this.checkedFolders = [];
                _this.render();
                _this.renderCheckedFolders();
            })

            _this.$target.find('.refresh-path').click(function(){
                _this.getDirs(_this.presentFolder)
            })

            $(document).on('click', `#${_this.uid}-target-div .path-child`, function(){
                let path = $(this).data('path');
                _this.presentFolder = path
                _this.render();
            })

            $(document).on('dblclick', `#${_this.uid}-target-div .folder-item`, function(e){
                let path = $(this).data('path');
                _this.presentFolder = path
                _this.render();
            })

            $(document).on('change' ,`#${_this.uid}-target-div input[name=checked-folder]`, function(){
                let path = $(this).data('path');
                let action = $(this).is(':checked');
                _this.checkedPathChange(path, action);
            })

            $(document).on('dblclick', `#${_this.uid}-target-div input[name=checked-folder]`, function(evt){
                evt.stopPropagation();
                evt.preventDefault();
            })

            $(document).on('click', `#${_this.uid}-target-div .target-footer .checked-item-del`, function(){
                let path = $(this).data('path');
                let new_ = _this.checkedFolders.filter(f => f != path);
                _this.checkedFolders = new_;
                _this.render();
                _this.renderCheckedFolders();
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
                                        <button class='last-path layui-btn layui-btn-primary layui-btn-xs'><i class='fa fa-arrow-circle-left'></i> 上层</button>
                                        <button class='clear-all-checked layui-btn layui-btn-primary layui-btn-xs'><i class='fa fa-trash-o'></i> 清空</button>
                                        <button class='refresh-path layui-btn layui-btn-primary layui-btn-xs'><i class='fa fa-refresh'></i> 刷新</button>
                                    </div>
                                    <div class='layui-col-md4 fast-tools'>
                                        <button class='layui-btn layui-btn-primary layui-btn-xs show-type-change'><i class='fa ${this.showType  == 'icon' ? 'fa-th': 'fa-list'}'></i></button>
                                    </div>
                                </div>
                                <hr class='my-hr'>
                                <div class='layui-row'><span>路径: </span><span class='now-path'></span></div><hr class='my-hr'>
                            </div>
                            <div id='${this.uid}-target-body' class='layui-row target-body my-scrollbar'>
                                <!-- <div class='layui-col-md8 folder-show'></div>
                                <div class='layui-col-md4 folder-info'></div> -->
                            </div><hr class='my-hr'>
                            <div id='${this.uid}-target-footer' class='layui-row target-footer'>
                                <div class='layui-col-md1 checked-title'>已选路径</div>
                                <div class='layui-col-md11 checked-path my-scrollbar'></div>
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
        },
        getDirs: function(path){
            let _this = this;

            $.ajax({
                url: `${window.location.origin}/${this.options.getDirsUrl}${path}`,
                method: 'GET'
            }).done(res => {
                if(!res.code){
                    _this.folders[res.data.path] = res.data.dirs;
                    _this.render();
                }
            }).fail(()=>{})
        },
        renderTargetBody: function(){
            let show = this.folders[this.presentFolder];
            if(show == undefined){
                this.getDirs(this.presentFolder)
                return false
            }
            let type = this.showType;
            let body = '';

            if(show.length){
                show.map(folder => {
                    body += (type == 'icon'? this.foldersIconEx(folder): this.foldersListEx(folder)) 
                })
            }else{
                body = `<div class='nothing'>...</div>`
            }

            let h = $('.now-path').closest('div').height();
            h && this.$target.find('.target-body').css({'height': `calc(100% - ${161 + h}px)`});
            this.$target.find('.target-body').html(`<div>${body}</div>`);
        },
        foldersIconEx: function(folder){
            return `<div class='folder-item folder-icon-item' data-path='${folder.path}'>
                        <div class='check'><input type='checkbox' data-path='${folder.path}' name='checked-folder'></div>
                        <div title='${folder.path}'><i class='fa fa-folder-open-o fa-3x'></i></div>
                        <span title='${folder.path.split('/').pop()}'>${folder.path.split('/').pop()}</span>
                    </div>`        
        },
        foldersListEx: function(folder){
            return `<div class='folder-item folder-list-item' data-path='${folder.path}'>
                        <div class='check'><input type='checkbox' data-path='${folder.path}' name='checked-folder'></div>
                        <div><span title='${folder.path}'>${folder.path.split('/').pop()}</span></div>
                    </div>`
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
            }else{
                // 选中到不选中
                if(allCheck != 1){
                    console.log(4);
                    if(this.checkedFolders.includes(path)){
                        let new_ = this.checkedFolders.filter(f => {return f != path});
                        this.checkedFolders = new_;
                        flag = true;
                    }
                }else{
                    // 当前路径全选中然后删除其中的一个
                    let ffpath = this.checkedFolders.filter(f => path.indexOf(f) == 0)[0];
                    this.checkNotWholeCheck(ffpath, path);
                    flag = true;
                }
            }

            flag && this.renderCheckedFolders();
        },
        renderCheckedFolders: function(){
            let checked = this.checkedFolders;
            let body = '';

            if(checked){
                checked.map((c, i) => {
                    body += `<div class='layui-row folder-checked-item'><div class='layui-col-md10'>${i + 1}、${c}</div><div class='layui-col-md1 checked-item-del' data-path='${c}'><i class='fa fa-trash' title='删除'></i></div></div>`
                })
            }

            $(`#${this.uid}-target-div .target-footer .checked-path`).html(body);
            this.options.callBack && this.options.callBack(this.checkedFolders);
        },
        renderCheckbox: function(){
            let checkboxes = $(`#${this.uid}-target-div .target-body input[name=checked-folder]`);
            let checkedFolders = this.checkedFolders;

            checkboxes.each((i, c) => {
                let p =$(c).data('path');
                let flag = '';
                let r = checkedFolders.some((f, j) => {
                    if(f == p){
                        flag = 'whole_check'
                        $(c).prop('checked', true);
                        return true
                    }else{
                        let p_l = p.split('/').filter(p_ => p_);
                        let f_l = f.split('/').filter(f_ => f_);
                        let t = false;

                        if(p_l < f_l){
                            t = p_l.every((m,n) => m == f_l[n]);
                            if(t){
                                flag = 'half_check'
                                $(c).prop('checked', false);
                                $(c).prop('indeterminate', true);
                                return true
                            }
                        }else if(f_l <= p_l){
                            t = f_l.every((m,n) => m == p_l[n]);
                            if(t){
                                flag = 'whole_check'
                                $(c).prop('checked', true);
                                return true
                            }
                        }
                    }
                })
            })
        },
        checkWholeCheck: function(path){
            // 检查全选

            let f = $.extend(true, [], path.split('/'))
            f.pop();
            let f_path = f.length == 1 ? '/': f.join('/'); // 父层
            let f_path_children = this.folders[f_path] .map(f => {return f.path}); // 父的子路径
            let checked_folders = this.checkedFolders.concat([path]); // 已选中
            let whole_check = f_path_children.every(f => checked_folders.includes(f));
            if(whole_check){
                console.log(1);
                let new_ = this.checkedFolders.filter(c => {
                        return !f_path_children.includes(c)
                    })

                this.checkedFolders = new_;
                this.checkWholeCheck(f_path)
            }else{
                this.checkedFolders.push(path)
            }
        },
        checkNotWholeCheck: function(ffpath, path){
            // 检查不全选
            let checked = this.checkedFolders.concat([]);
            let ffpath_child = this.folders[ffpath].map(f => f.path);
            
            let a = checked.filter( c => {return  c != ffpath})
            a.push.apply(a, ffpath_child)
            
            let ffpath_ = ''
            a.some(f => {
                if(path.indexOf(f) == 0){
                    ffpath_ = f;
                    return true
                }
            })

            this.checkedFolders = a;

            if(ffpath_ != path ){
                this.checkNotWholeCheck(ffpath_, path)
            }else{
                this.checkedFolders = a.filter(a_ => a_ != path)
                return false
            }
        }
    }

    return new a(el, options);
});