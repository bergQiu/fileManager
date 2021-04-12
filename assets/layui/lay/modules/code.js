/** layui-v2.5.6 MIT License By https://www.layui.com */;
layui.define("jquery", function (e) {
    "use strict";
    var a = layui.$,
        l = "http://www.layui.com/doc/modules/code.html";
    e("code", function (e) {
        var t = [];
        var copy_ele = `<button class='layui-btn layui-btn-primary layui-btn-xs code-copy' style='position:absolute;top:5px;right:10px'><i class='fa fa-copy'></i></button>`;
        e = e || {}, e.elem = a(e.elem || ".layui-code"), e.about = !("about" in e) || e.about, e.copy = !('copy' in e) || e.copy, e.elem.each(function () {
            t.push(this)
        }), layui.each(t.reverse(), function (t, i) {
            var c = a(i),
                o = c.html();
            (c.attr("lay-encode") || e.encode) && (o = o.replace(/&(?!#?[a-zA-Z0-9]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;")), c.html('<ol class="layui-code-ol"><li>' + o.replace(/[\r\t\n]+/g, "</li><li>") + "</li></ol>"), c.find(">.layui-code-h3")[0] || c.prepend('<h3 class="layui-code-h3">' + (c.attr("lay-title") || e.title || "code") + (e.about ? '<a href="' + l + '" target="_blank">layui.code</a>' : "") + (e.copy ? copy_ele : "") + "</h3>");
            var d = c.find(">.layui-code-ol");
            c.addClass("layui-box layui-code-view"), (c.attr("lay-skin") || e.skin) && c.addClass("layui-code-" + (c.attr("lay-skin") || e.skin)), (d.find("li").length / 100 | 0) > 0 && d.css("margin-left", (d.find("li").length / 100 | 0) + "px"), (c.attr("lay-height") || e.height) && d.css("max-height", c.attr("lay-height") || e.height)
        })

        $('.code-copy').on('click', function(){
            try{
                let data = $(this).parent().next().text();
                let parse_data = data.replace(/ /, '');
                $(this).parent().next().after(`<input id='code-copy-data-hide' value='${parse_data}'></input>`)
                $('#code-copy-data-hide').css({opacity:0})
                $('#code-copy-data-hide').focus();
                $('#code-copy-data-hide').select();
                document.execCommand('Copy')
                $('#code-copy-data-hide').remove();
                layer.msg('复制成功')
            }catch(e){layer.msg('复制失败')}
        })
    })
}).addcss("modules/code.css", "skincodecss");
