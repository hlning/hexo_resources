
    document.oncontextmenu = function () {
        return false;
    }

    $(document).ready(function () {
        $(".scroll").click(function (event) {
            event.preventDefault();
            $('html,body').animate({
                    scrollTop: $(this.hash).offset().top
                },
                1000);
        });

        //获取npm发布信息
        init();

        $(".dropdown").hover(function () {
                $('.dropdown-menu', this).stop(true, true).slideDown("fast");
                $(this).toggleClass('open');
            },
            function () {
                $('.dropdown-menu', this).stop(true, true).slideUp("fast");
                $(this).toggleClass('open');
            });
    });

    let giteesMap = {};
    var pageIndexMap = {};

    async function init() {
        axios.get('https://unpkg.com/rino_hexo_video/video.json')
            .then((response) => {
                //获取gitee信息
                let gitees = response.data.gitee;
                //循环
                gitees.forEach((item, index) => {
                    //body获取主信息
                    let body = item.body;
                    //name
                    let name = body.name;
                    //url
                    let url = body.url;
                    //img
                    let img = body.img;

                    //label获取标签信息
                    let labels = item.label;
                    //标签名称
                    let labelName = labels[0].name;

                    //分类统计
                    let gitee = {};
                    gitee.name = name;
                    gitee.url = url;
                    gitee.img = img;
                    if (!giteesMap.hasOwnProperty(labelName)) {
                        giteesMap[labelName] = {
                            gitee: [gitee],
                            count: 1
                        };
                    } else {
                        let data = giteesMap[labelName];
                        data.gitee.push(gitee);
                        data.count = ++data.count;
                        giteesMap[labelName] = data;
                    }
                })

                //通过统计数据初始化页面信息
                let html = "";
                let tabContent = "";
                let isFirst = true;
                for (var key in giteesMap) {
                    if (giteesMap[key].count == 0) continue;

                    let labelEn = key.split("-")[0];
                    let labelZh = key.split("-")[1];
                    //保存页码
                    pageIndexMap[labelEn] = 1;
                    //主体内容
                    html += ("<div role=\"tabpanel\" class=\"tab-pane fade " + (isFirst ? "active in" : "") + "\" id=\"" + labelEn + "\" aria-labelledby=\"" + labelEn + "-tab\">" +
                        generateHtml(giteesMap[key].count, key, giteesMap[key].gitee) +
                        "</div>");
                    //tab内容
                    tabContent += "<li role=\"presentation\" " + (isFirst ? "class=\"active\"" : "") + "><a href=\"#" + labelEn + "\" id=\"" + labelEn + "-tab\" role=\"tab\" data-toggle=\"tab\"\n" +
                        "                                                          aria-controls=\"" + labelEn + "\" aria-expanded=\"true\">" + labelZh + "</a></li>";
                    isFirst = false;
                }

                $("#myTabContent").append(html);
                $("#myTab").append(tabContent);
                $("#loading").remove();
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    function generateHtml(count, label, gitees) {
        if (!gitees || (!!gitees && gitees.length < 1)) return;
        let labelEn = label.split("-")[0];

        //电影内容
        let content = "";
        //分页内容
        let pageContent = "";
        gitees.forEach((item, index) => {
            content += "<div class=\"col-md-4 w3l-movie-gride-agile\" " + (index > 5 ? "style='display:none'" : "") + ">\n" +
                "                        <a href=\"javascript:void(0)\"\n" +
                "                           onclick=\"playVideo('" + item.url + "')\"\n" +
                "                           class=\"hvr-shutter-out-horizontal\">\n" +
                "                            <img src=\"" + item.img + "\"\n" +
                "                                 style=\"height:350px\" title=\"album-name\" class=\"img-responsive\" alt=\" \"\n" +
                "                            />\n" +
                "                            <div class=\"w3l-action-icon\">\n" +
                "                                <i class=\"fa fa-play-circle\" aria-hidden=\"true\">\n" +
                "                                </i>\n" +
                "                            </div>\n" +
                "                        </a>\n" +
                "                        <div class=\"mid-1 agileits_w3layouts_mid_1_home\">\n" +
                "                            <div class=\"w3l-movie-text\">\n" +
                "                                <h6>\n" +
                "                                    <a href=\"#\">\n" +
                "                                        " + item.name + "\n" +
                "                                    </a>\n" +
                "                                </h6>\n" +
                "                            </div>\n" +
                "                        </div>\n" +
                "                    </div>";
        })

        //每页显示6条，分多少页
        let sumPage = parseInt(count / 6);
        for (let i = 1; i <= (sumPage%6 == 0 ? sumPage : sumPage + 1 ); i++) {
            pageContent += "<li " + (i > 5 ? "style='display:none'" : "") + "><a href='javascript:void(0)' onclick='goPage($(this))'>" + i + "</a></li>";
        }

        content += "<div class=\"clearfix\"></div>\n" +
            "                    <div id=\"" + labelEn + "_page\" class=\"blog-pagenat-wthree\">\n" +
            "\n" +
            "<ul><li><a class='frist' href='javascript:void(0)' onclick='goPage($(this))'>上一页</a></li>" +
            pageContent +
            "<li><a class='last' href='javascript:void(0)' onclick='goPage($(this))'>下一页</a></li>" +
            "<li><input id='num' type='text'/></li>" +
            "<li><a class='last' href='javascript:void(0)' onclick='goPage($(\"#num\"))'>跳转</a></li>" +
            "</ul>" +
            "                    </div>\n" +
            "                </div>";
        return content;
    }


    function goPage(obj) {
        //跳转页码
        var curIndex = obj.text() || obj.val();

        var tabpanel = obj.parents("div[class^='tab-pane fade']");
        var idName = tabpanel.attr("id");

        //总数
        var issuesCount = 0;
        for (let key in giteesMap) {
            if (key.indexOf(idName) >= 0) {
                issuesCount = giteesMap[key].count;
                break;
            }
        }

        //获取页码
        let pageIndex = pageIndexMap[idName];
        
        //总页数
        let sumPage = issuesCount%6==0?parseInt(issuesCount / 6):parseInt(issuesCount / 6)+1;

        if ("上一页" == curIndex) {
            pageIndex = parseInt((pageIndex == 1) ? 1 : (pageIndex - 1));
        } else if ("下一页" == curIndex) {
            pageIndex = parseInt(pageIndex == sumPage ? sumPage : (pageIndex + 1));
        } else {
            pageIndex = parseInt(curIndex);
        }
        
        if(!Number.isFinite(pageIndex) || (!!pageIndex && (pageIndex<1 || pageIndex>sumPage))) return;
        pageIndexMap[idName] = pageIndex;

        //翻页按钮显示
        var sibObjs = obj.parents("ul").find("li");
        sibObjs.each(function (index) {
            //a标签
            var aObj = $(this).find("a");
            var aTxt = aObj.text();
            aObj.css("background", "");
            aObj.css("color", "");
            if ("上一页" == aTxt || "下一页" == aTxt || "跳转" == aTxt || !aTxt) {
                $(this).show();
            } else if (parseInt(aTxt) >= (pageIndex >= 2 ? pageIndex - 2 : pageIndex) && parseInt(aTxt) < (pageIndex >= 2 ? pageIndex + 3 : pageIndex + 5)) {
                if (parseInt(aTxt) == pageIndex) {
                    aObj.css("background", "#29292A");
                    aObj.css("color", "white");
                }
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        //页面显示
        tabpanel.find("div[class='col-md-4 w3l-movie-gride-agile']").each(function (index) {
            if (index >= ((pageIndex - 1) * 6) && index < (pageIndex * 6)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    var myVideo;

    function playVideo(url) {
        $("#videoDev").append("<video id='myVideo' class='video-js vjs-default-skin vjs-big-play-centered' controls='' preload='auto' data-setup='{}'>" + "<source id='source' src='" + url + "' type='application/x-mpegURL'></source>" + "</video>");
        // videojs 简单使用
        myVideo = videojs('myVideo', {
            bigPlayButton: true,
            textTrackDisplay: false,
            posterImage: false,
            errorDisplay: false,
        });
        myVideo.play(); // 视频播放
        myVideo.pause(); // 视频暂停
        $("#videoDev").show();
    }

    function closeVideo() {
        myVideo.dispose();
        $("video").parent().remove();
        $("#videoDev").hide();
    }