# XiaoAi-schedule

适配了宝鸡文理学院和南通理工学院的小爱课程表

下方教程已经上传CSDN

[https://blog.csdn.net/KevinWalkerSrc/article/details/123043489](https://blog.csdn.net/KevinWalkerSrc/article/details/123043489)

## 新版小爱课程表正方教务系统课表适配
### 前言
之前写过一篇小爱课程表的教务系统适配，但是是比较老的版本开发者工具适配了，最近看到小爱课程表开发者工具更新了，就想着写一篇新的博客，顺便优化一下之前的代码，还提供了部分课程实例的一些解析代码
### 1.安装小爱课程表开发者工具
其实安装这部分并不属于本篇文章的内容，但是鉴于新版开发者工具提供了更全面的文档信息，所以把文档链接放在前面，方便读者去安装下载开发者工具：
[https://open-schedule-prod.ai.xiaomi.com/docs/#/help/](https://open-schedule-prod.ai.xiaomi.com/docs/#/help/)
### 2.文档分析
安装好以后，我们打开文档，阅读一下导入课表需要的代码
![在这里插入图片描述](https://img-blog.csdnimg.cn/1d01ce6f12dc443c9ea4c60460971738.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAS2V2aW5XYWxrZXJTcmM=,size_20,color_FFFFFF,t_70,g_se,x_16)
我们知道，导入课表的代码分为了3个文件以及他们的作用
于是我们按顺序分别开始编辑代码
#### (1)provider.js
第一个代码是提供必要的html，也就是拿到网页的html后直接return即可，所以我们分析网页内必要的代码部分![在这里插入图片描述](https://img-blog.csdnimg.cn/5b036ee7f586412caae6fba3ac1d5a91.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAS2V2aW5XYWxrZXJTcmM=,size_20,color_FFFFFF,t_70,g_se,x_16)
我们可以看到，正方教务系统的功能区域代码是基于iframe的，因此我们必要的功能区域代码也就是id=”iframeautoheight“的部分，所以provider.js代码如下：
```javascript
function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    return dom.querySelector('#iframeautoheight').contentWindow.document.body.innerHTML;
}
```
#### (2)parser.js
![在这里插入图片描述](https://img-blog.csdnimg.cn/388e317802e6464bad6fe231a50d0fe2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAS2V2aW5XYWxrZXJTcmM=,size_20,color_FFFFFF,t_70,g_se,x_16)

第二个代码的功能是返回具体课程内容的，所以对第一个代码返回过来的html文件进行解析最后生成对应格式返回即可。
下面我们对课表网页进行分析，课表是用table进行展示的：
![在这里插入图片描述](https://img-blog.csdnimg.cn/a9b3231afbeb4ac29469277744d48b88.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAS2V2aW5XYWxrZXJTcmM=,size_19,color_FFFFFF,t_70,g_se,x_16)下面我们的思路就是对table进行遍历。通过阅读文档，我们知道，parser是提供了`Cheerio`的，所以我们使用其去解析网页代码：
```javascript
var jsonArray = [];

function scheduleHtmlParser(html) {
    var $ = cheerio.load(html, { decodeEntities: false });
    $("#Table6 tr").each(
        function (i) {
            if (i > 1) {
                $(this).children('td').each(function (j) {
                    if ((i - 1) == 3 || (i - 1) == 7) {
                        if (j > 0) {
                            console.log("第"+(i-1)+"节课，周"+(j)+"课程信息："+$(this).html());
                        }
                    } else if ((i - 1) == 1 || (i - 1) == 5 || (i - 1) == 9) {
                        if ((j - 1) > 0) {
                            console.log("第"+(i-1)+"节课，周"+(j-1)+"课程信息："+$(this).html());
                        }
                    }
                })
            }
        }
    )
    
    return jsonArray;
}
```

好了，课表解析出来之后，接下来我们测试一下：
![在这里插入图片描述](https://img-blog.csdnimg.cn/fe2f5fa4c4374b44b2c597a46e0885ec.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAS2V2aW5XYWxrZXJTcmM=,size_20,color_FFFFFF,t_70,g_se,x_16)
输出结果没有问题，下面我们分析课程信息。不难看出，每个课程均为4行，分别是课程名、上课周次、教师姓名、上课地点，之间分别有`<br>`进行分割，如果为多个课程，后面会有`<br><br><br>`对不同课程进行分割，所以我们只需要通过`split()`函数对课程信息字符串进行分割即可，所以代码如下：
```javascript
/**
    得到单科课程信息（班级课表）
*/
function getClass(classHtml, day, section) {
    var classA = [];
    var classs = classHtml.split('<br><br><br>');
    if (classs.length >= 1) { //防止空课表
        for (var i = 0; i < classs.length; i++) { //遍历所有课程
            if (classs[i].indexOf("<br>") != -1) { //判断课程信息是否可以正常分割
                var classObj = {};
                var classsObj = classs[i].split("<br>"); //对课程进行分割
                classObj.name = classsObj[0];
                classObj.position = classsObj[3];
                classObj.teacher = classsObj[2];
                classObj.weeks = [].concat(getWeeks(classsObj[1]));
                classObj.day = day;
                classObj.sections = [];
                classObj.sections.push(section);
                classObj.sections.push(section + 1);
                classA.push(classObj);
            }
        }
    }
    return classA;
}

/**
    周次解析（班级课表）
*/
function getWeeks(weeksHtml) {
    var weeksStr = weeksHtml;
    var weeksA = [];
    if (weeksStr) {
        var weekArr = weeksStr.split(',')
        if (weekArr.length > 2) { //不正常周次
            for (var j = 0; j < weekArr.length - 1; j++) { //循环所有周次区间
                if (weekArr[j].indexOf("单") != -1) { //单周
                    if (weekArr[j]) {
                        var weeksA1 = weekArr[j].split('-');
                        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                            weeksA.push(i);
                        }
                    }
                }
                else if (weekArr[j].indexOf("双") != -1) { //双周
                    if (weekArr[j]) {
                        var weeksA1 = weekArr[j].split('-');
                        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                            weeksA.push(i);
                        }
                    }
                } else {
                    if (weekArr[j].indexOf("-") != -1) { //带有-符号的周次
                        if (weekArr[j]) {
                            var weeksA1 = weekArr[j].split('-');
                            for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i++) {
                                weeksA.push(parseInt(i))
                            }
                        }
                    } else {//不带有-符号的周次
                        weeksA.push(parseInt(weekArr[j]))
                    }
                }

            }
        } else { //正常周次
            if (weeksStr.indexOf('单') != -1) {
                if (weeksHtml) {
                    var weeksA1 = weeksHtml.split('-');
                    for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                        weeksA.push(i);
                    }
                }
            } else if (weeksStr.indexOf('双') != -1) {
                if (weeksHtml) {
                    var weeksA1 = weeksHtml.split('-');
                    for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                        weeksA.push(i);
                    }
                }
            } else {
                if (weeksStr.indexOf("-") != -1) { //带有-符号的周次
                    if (weeksHtml) {
                        var weeksA1 = weeksHtml.split('-');
                        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i++) {
                            weeksA.push(parseInt(i))
                        }
                    }
                } else {//不带有-符号的周次
                    weeksA.push(parseInt(weekArr[0]))
                }
            }
        }
    }
    return weeksA;
}
```
代码可能有点多，但都是很基础的`判断`和`split()`的运用，周次解析没有简单的只解析`1-18(1,2)`这种格式，包括`1-2,3-8单,9,10-14双,15-18(1,2)`这种复杂的周次结构也可以解析
![在这里插入图片描述](https://img-blog.csdnimg.cn/49f581f1f7bd4a09a6ff03f3a5a64672.png)
所以，上面的代码拼到一起，就可以得到我们的课程解析的parser.js代码：
```javascript
var jsonArray = [];

function scheduleHtmlParser(html) {
    var $ = cheerio.load(html, { decodeEntities: false });
    $("#Table6 tr").each(
        function (i) {
            if (i > 1) {
                $(this).children('td').each(function (j) {
                    if ((i - 1) == 3 || (i - 1) == 7) {
                        if (j > 0) {
                            var classA = [].concat(getClass($(this).html(), j, (i - 1)));
                            for (var k = 0; k < classA.length; k++) {
                                jsonArray.push(classA[k]);
                            }
                        }
                    } else if ((i - 1) == 1 || (i - 1) == 5 || (i - 1) == 9) {
                        if ((j - 1) > 0) {
                            var classA = [].concat(getClass($(this).html(), (j - 1), (i - 1)));
                            for (var k = 0; k < classA.length; k++) {
                                jsonArray.push(classA[k]);
                            }
                        }
                    }
                })
            }
        }
    )
    
    return jsonArray;
}

/**
    得到单科课程信息（班级课表）
*/
function getClass(classHtml, day, section) {
    var classA = [];
    var classs = classHtml.split('<br><br><br>');
    if (classs.length >= 1) { //防止空课表
        for (var i = 0; i < classs.length; i++) { //遍历所有课程
            if (classs[i].indexOf("<br>") != -1) { //判断课程信息是否可以正常分割
                var classObj = {};
                var classsObj = classs[i].split("<br>"); //对课程进行分割
                classObj.name = classsObj[0];
                classObj.position = classsObj[3];
                classObj.teacher = classsObj[2];
                classObj.weeks = [].concat(getWeeks(classsObj[1]));
                classObj.day = day;
                classObj.sections = [];
                classObj.sections.push(section);
                classObj.sections.push(section + 1);
                classA.push(classObj);
            }
        }
    }
    return classA;
}

/**
    周次解析（班级课表）
*/
function getWeeks(weeksHtml) {
    var weeksStr = weeksHtml;
    var weeksA = [];
    if (weeksStr) {
        var weekArr = weeksStr.split(',')
        if (weekArr.length > 2) { //不正常周次
            for (var j = 0; j < weekArr.length - 1; j++) { //循环所有周次区间
                if (weekArr[j].indexOf("单") != -1) { //单周
                    if (weekArr[j]) {
                        var weeksA1 = weekArr[j].split('-');
                        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                            weeksA.push(i);
                        }
                    }
                }
                else if (weekArr[j].indexOf("双") != -1) { //双周
                    if (weekArr[j]) {
                        var weeksA1 = weekArr[j].split('-');
                        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                            weeksA.push(i);
                        }
                    }
                } else {
                    if (weekArr[j].indexOf("-") != -1) { //带有-符号的周次
                        if (weekArr[j]) {
                            var weeksA1 = weekArr[j].split('-');
                            for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i++) {
                                weeksA.push(parseInt(i))
                            }
                        }
                    } else {//不带有-符号的周次
                        weeksA.push(parseInt(weekArr[j]))
                    }
                }

            }
        } else { //正常周次
            if (weeksStr.indexOf('单') != -1) {
                if (weeksHtml) {
                    var weeksA1 = weeksHtml.split('-');
                    for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                        weeksA.push(i);
                    }
                }
            } else if (weeksStr.indexOf('双') != -1) {
                if (weeksHtml) {
                    var weeksA1 = weeksHtml.split('-');
                    for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                        weeksA.push(i);
                    }
                }
            } else {
                if (weeksStr.indexOf("-") != -1) { //带有-符号的周次
                    if (weeksHtml) {
                        var weeksA1 = weeksHtml.split('-');
                        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i++) {
                            weeksA.push(parseInt(i))
                        }
                    }
                } else {//不带有-符号的周次
                    weeksA.push(parseInt(weekArr[0]))
                }
            }
        }
    }
    return weeksA;
}
```
#### (4)timer.js
这个代码就很好理解了，用来设置课程的时间，总周次的一些信息，所以我们照着文档提供的代码修改即可（开学时间为空即可）：
```javascript
/**
 * 时间配置函数，此为入口函数，不要改动函数名
 */
 async function scheduleTimer({
    providerRes,
    parserRes
} = {}) {
    return {
        totalWeek: 20, // 总周数：[1, 30]之间的整数
        startSemester: '', // 开学时间：时间戳，13位长度字符串，推荐用代码生成
        startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
        showWeekend: true, // 是否显示周末
        forenoon: 4, // 上午课程节数：[1, 10]之间的整数
        afternoon: 4, // 下午课程节数：[0, 10]之间的整数
        night: 2, // 晚间课程节数：[0, 10]之间的整数
        sections: [
            { section: 1, startTime: "08:00", endTime: "08:50" },
            { section: 2, startTime: "09:00", endTime: "9:50" },
            { section: 3, startTime: "10:10", endTime: "11:00" },
            { section: 4, startTime: "11:10", endTime: "12:00" },
            { section: 5, startTime: "14:30", endTime: "15:20" },
            { section: 6, startTime: "15:30", endTime: "16:20" },
            { section: 7, startTime: "16:30", endTime: "17:20" },
            { section: 8, startTime: "17:30", endTime: "18:20" },
            { section: 9, startTime: "19:30", endTime: "20:20" },
            { section: 10, startTime: "20:20", endTime: "21:30" }
        ], // 课程时间表，注意：总长度要和上边配置的节数加和对齐
    }
    // PS: 夏令时什么的还是让用户在夏令时的时候重新导入一遍吧，在这个函数里边适配吧！奥里给！————不愿意透露姓名的嘤某人
}
```
### 4.补充代码
上面我们实现的代码已经可以满足正常课表的解析了，这部分主要是提供一些不正常的课程信息的解析方法，最后贴上对应的parser.js的代码。
#### (1)专修课
![在这里插入图片描述](https://img-blog.csdnimg.cn/420311b2d383443286e67aa020ca0b9b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAS2V2aW5XYWxrZXJTcmM=,size_20,color_FFFFFF,t_70,g_se,x_16)
如果出现这种专修科，因为周次一致的缘由，所以笔者的方案是将课程拼接起来
![在这里插入图片描述](https://img-blog.csdnimg.cn/d3a7edcc5a4642acbb9e912fb7da8e63.png)
所以我们的课程解析的代码为：
```javascript
/**
    得到单科课程信息（班级课表）
*/
function getClass(classHtml, day, section) {
    var classA = [];
    var classs = classHtml.split('<br><br><br>');
    if (classs.length >= 1) { //防止空课表
        for (var i = 0; i < classs.length; i++) { //遍历所有课程
            if (classs[i].indexOf("<br>") != -1) { //判断课程信息是否正常
                var classObj = {};
                var classsObj = classs[i].split("<br>"); //对课程进行分割
                if (classs[1] && classs[1] != "" && classs[1] != undefined) { //如果存在index为1的索引
                    if (classs[1] && classs[1] != "" && classs[0].split("<br>")[1] != classs[1].split("<br>")[1]) { //如果当前课程前两节小课时间不相同，则是单双周课，而不是专修课
                        classObj.name = classsObj[0];
                        classObj.position = classsObj[3];
                        classObj.teacher = classsObj[2];
                        classObj.weeks = [].concat(getWeeks(classsObj[1]));
                        classObj.day = day;
                        classObj.sections = [];
                        classObj.sections.push(section);
                        classObj.sections.push(section + 1);
                        classA.push(classObj);
                    } else { //如果当前课程前两节小课时间不相同，则不是单双周课，而是专修课
                        if (i == 0) { //第一次添加值
                            classObj.name = classsObj[0];
                            classObj.position = classsObj[3];
                            classObj.teacher = classsObj[2];
                            classObj.weeks = [].concat(getWeeks(classsObj[1]));
                            classObj.day = day;
                            classObj.sections = [];
                            classObj.sections.push(section);
                            classObj.sections.push(section + 1);
                            classA.push(classObj);
                        } else if (i == classs.length - 1) { //最后一次添加值
                            classA[classA.length - 1].name = classA[classA.length - 1].name + "," + classsObj[0];
                            classA[classA.length - 1].position = classA[classA.length - 1].position + "," + classsObj[3];
                            classA[classA.length - 1].teacher = classA[classA.length - 1].teacher + "," + classsObj[2];
                        } else { //正常添加值
                            classA[classA.length - 1].name = classA[classA.length - 1].name + "," + classsObj[0];
                            classA[classA.length - 1].position = classA[classA.length - 1].position + "," + classsObj[3];
                            classA[classA.length - 1].teacher = classA[classA.length - 1].teacher + "," + classsObj[2];
                        }
                    }
                } else {//如果不存在，则为单个课程
                    classObj.name = classsObj[0];
                    classObj.position = classsObj[3];
                    classObj.teacher = classsObj[2];
                    classObj.weeks = [].concat(getWeeks(classsObj[1]));
                    classObj.day = day;
                    classObj.sections = [];
                    classObj.sections.push(section);
                    classObj.sections.push(section + 1);
                    classA.push(classObj);
                }

            }
        }
    }
    return classA;
}
```
#### (2)学生个人课表
笔者学校教务系统提供了班级课表和学生个人课表两种课表查询功能，上面我们仅仅做了班级课表的解析，如果上线到教务系统适配中，同学使用个人课表解析就会出现问题了，所以我们用相同的方法对个人课表进行解析，具体的分析方法同上，这里提供一份完整的解析代码，读者可以根据班级课表的解析代码举一反三去学习了解一下个人课表的解析代码：
parser.js
```javascript
var jsonArray = [];

function scheduleHtmlParser(html) {
    var $ = cheerio.load(html, { decodeEntities: false });
    if ($("#Table6").length > 0) {//班级课表查询界面适配
        $("#Table6 tr").each(
            function (i) {
                if (i > 1) {
                    $(this).children('td').each(function (j) {
                        if ((i - 1) == 3 || (i - 1) == 7) {
                            if (j > 0) {
                                var classA = [].concat(getClass($(this).html(), j, (i - 1)));
                                for (var k = 0; k < classA.length; k++) {
                                    jsonArray.push(classA[k]);
                                }
                                //                         console.log("第"+(i-1)+"节课，周"+(j)+"课程名称："+$(this).html());
                            }
                        } else if ((i - 1) == 1 || (i - 1) == 5 || (i - 1) == 9) {
                            if ((j - 1) > 0) {
                                var classA = [].concat(getClass($(this).html(), (j - 1), (i - 1)));
                                for (var k = 0; k < classA.length; k++) {
                                    jsonArray.push(classA[k]);
                                }
                                //                         console.log("第"+(i-1)+"节课，周"+(j-1)+"课程名称："+$(this).html());
                            }
                        }
                    })
                }
            }
        )
    }
    else {//个人课表查询界面适配
        $("#Table1 tr").each(
            function (i) {
                if (i > 1) {
                    $(this).children('td').each(function (j) {
                        if ((i - 1) == 3 || (i - 1) == 7) {
                            if (j > 0) {
                                var classA = [].concat(getClassUser($(this).html(), j, (i - 1)));
                                if (classA.length === 1) {
                                    jsonArray.push(classA[0]);
                                } else if (classA.length === 2) {
                                    jsonArray.push(classA[0]);
                                    jsonArray.push(classA[1]);
                                }
                                //                         console.log("第"+(i-1)+"节课，周"+(j)+"课程名称："+$(this).html());
                            }
                        } else if ((i - 1) == 1 || (i - 1) == 5 || (i - 1) == 9) {
                            if ((j - 1) > 0) {
                                var classA = [].concat(getClassUser($(this).html(), (j - 1), (i - 1)));
                                if (classA.length === 1) {
                                    jsonArray.push(classA[0]);
                                } else if (classA.length === 2) {
                                    jsonArray.push(classA[0]);
                                    jsonArray.push(classA[1]);
                                }
                                //                         console.log("第"+(i-1)+"节课，周"+(j-1)+"课程名称："+$(this).html());
                            }
                        }
                    })
                }
            }
        )
    }
    return jsonArray;
}

/**
    得到单科课程信息（班级课表）
*/
function getClass(classHtml, day, section) {
    var classA = [];
    var classs = classHtml.split('<br><br><br>');
    if (classs.length >= 1) { //防止空课表
        for (var i = 0; i < classs.length; i++) { //遍历所有课程
            if (classs[i].indexOf("<br>") != -1) { //判断课程信息是否正常
                var classObj = {};
                var classsObj = classs[i].split("<br>"); //对课程进行分割
                if (classs[1] && classs[1] != "" && classs[1] != undefined) { //如果存在index为1的索引
                    if (classs[1] && classs[1] != "" && classs[0].split("<br>")[1] != classs[1].split("<br>")[1]) { //如果当前课程前两节小课时间不相同，则是单双周课，而不是专修课
                        classObj.name = classsObj[0];
                        classObj.position = classsObj[3];
                        classObj.teacher = classsObj[2];
                        classObj.weeks = [].concat(getWeeks(classsObj[1]));
                        classObj.day = day;
                        classObj.sections = [];
                        classObj.sections.push(section);
                        classObj.sections.push(section + 1);
                        classA.push(classObj);
                    } else { //如果当前课程前两节小课时间不相同，则不是单双周课，而是专修课
                        if (i == 0) { //第一次添加值
                            classObj.name = classsObj[0];
                            classObj.position = classsObj[3];
                            classObj.teacher = classsObj[2];
                            classObj.weeks = [].concat(getWeeks(classsObj[1]));
                            classObj.day = day;
                            classObj.sections = [];
                            classObj.sections.push(section);
                            classObj.sections.push(section + 1);
                            classA.push(classObj);
                        } else if (i == classs.length - 1) { //最后一次添加值
                            classA[classA.length - 1].name = classA[classA.length - 1].name + "," + classsObj[0];
                            classA[classA.length - 1].position = classA[classA.length - 1].position + "," + classsObj[3];
                            classA[classA.length - 1].teacher = classA[classA.length - 1].teacher + "," + classsObj[2];
                        } else { //正常添加值
                            classA[classA.length - 1].name = classA[classA.length - 1].name + "," + classsObj[0];
                            classA[classA.length - 1].position = classA[classA.length - 1].position + "," + classsObj[3];
                            classA[classA.length - 1].teacher = classA[classA.length - 1].teacher + "," + classsObj[2];
                        }
                    }
                } else {//如果不存在，则为单个课程
                    classObj.name = classsObj[0];
                    classObj.position = classsObj[3];
                    classObj.teacher = classsObj[2];
                    classObj.weeks = [].concat(getWeeks(classsObj[1]));
                    classObj.day = day;
                    classObj.sections = [];
                    classObj.sections.push(section);
                    classObj.sections.push(section + 1);
                    classA.push(classObj);
                }

            }
        }
    }
    return classA;
}

/**
    周次解析（班级课表）
*/
function getWeeks(weeksHtml) {
    var weeksStr = weeksHtml;
    var weeksA = [];
    if (weeksStr) {
        var weekArr = weeksStr.split(',')
        if (weekArr.length > 2) { //不正常周次
            for (var j = 0; j < weekArr.length - 1; j++) { //循环所有周次区间
                if (weekArr[j].indexOf("单") != -1) { //单周
                    if (weekArr[j]) {
                        var weeksA1 = weekArr[j].split('-');
                        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                            weeksA.push(i);
                        }
                    }
                }
                else if (weekArr[j].indexOf("双") != -1) { //双周
                    if (weekArr[j]) {
                        var weeksA1 = weekArr[j].split('-');
                        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                            weeksA.push(i);
                        }
                    }
                } else {
                    if (weekArr[j].indexOf("-") != -1) { //带有-符号的周次
                        if (weekArr[j]) {
                            var weeksA1 = weekArr[j].split('-');
                            for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i++) {
                                weeksA.push(parseInt(i))
                            }
                        }
                    } else {//不带有-符号的周次
                        weeksA.push(parseInt(weekArr[j]))
                    }
                }

            }
        } else { //正常周次
            if (weeksStr.indexOf('单') != -1) {
                if (weeksHtml) {
                    var weeksA1 = weeksHtml.split('-');
                    for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                        weeksA.push(i);
                    }
                }
            } else if (weeksStr.indexOf('双') != -1) {
                if (weeksHtml) {
                    var weeksA1 = weeksHtml.split('-');
                    for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
                        weeksA.push(i);
                    }
                }
            } else {
                if (weeksStr.indexOf("-") != -1) { //带有-符号的周次
                    if (weeksHtml) {
                        var weeksA1 = weeksHtml.split('-');
                        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i++) {
                            weeksA.push(parseInt(i))
                        }
                    }
                } else {//不带有-符号的周次
                    weeksA.push(parseInt(weekArr[0]))
                }
            }
        }
    }
    return weeksA;
}

/**
    得到单科课程信息（个人课表）
*/
function getClassUser(classHtml, day, section) {
    var classA = [];
    var classs = classHtml.split('<br>');

    if (classs.length > 1) {//防止空课程
        if (classs.length <= 6) {//当课程为标准课程
            var classObj = {};
            classObj.name = classs[0];
            classObj.position = classs[3];
            classObj.teacher = classs[2];
            classObj.weeks = [].concat(getWeeksUser(classs[1]));
            classObj.day = day;
            classObj.sections = [];
            classObj.sections.push(section);
            classObj.sections.push(section + 1);
            classA.push(classObj);
        } else {//当课程为双课程
            //第一节课
            var classObj = {};
            classObj.name = classs[0];
            classObj.position = classs[3];
            classObj.teacher = classs[2];
            classObj.weeks = [].concat(getWeeksUser(classs[1]));
            classObj.day = day;
            classObj.sections = [];
            classObj.sections.push(section);
            classA.push(classObj);

            //第二节课
            if (classs[5].indexOf('调') != -1) {
                var classObj1 = {};
                classObj1.name = classs[7];
                classObj1.position = classs[10];
                classObj1.teacher = classs[9];
                classObj1.weeks = [].concat(getWeeksUser(classs[8]));
                classObj1.day = day;
                classObj1.sections = [];
                classObj1.sections.push(section + 1);
                classA.push(classObj1);
            } else {
                var classObj1 = {};
                classObj1.name = classs[5];
                classObj1.position = classs[8];
                classObj1.teacher = classs[7];
                classObj1.weeks = [].concat(getWeeksUser(classs[6]));
                classObj1.day = day;
                classObj1.sections = [];
                classObj1.sections.push(section + 1);
                classA.push(classObj1);
            }
        }
    }
    return classA;
}

/**
    周次解析（个人课表）
*/
function getWeeksUser(weeksHtml) {
    var weeksStr = weeksHtml;
    var weeksA = [];
    if (weeksStr.indexOf('-') != -1) {
        var weeksA1 = weeksHtml.split('-');
        var start = 0;
        var end = 0;
        if (weeksA1[0][weeksA1[0].length - 2] != '第') {
            start = parseInt(weeksA1[0][weeksA1[0].length - 2] + weeksA1[0][weeksA1[0].length - 1])
        } else {
            start = parseInt(weeksA1[0][weeksA1[0].length - 1])
        }

        if (weeksA1[1][1] != '周') {
            end = parseInt(weeksA1[1][0] + weeksA1[1][1])
        } else {
            end = parseInt(weeksA1[1][0])
        }

        if (weeksStr.indexOf('单') != -1) {
            for (var i = start; i <= end; i = i + 2) {
                weeksA.push(i);
            }
        } else if (weeksStr.indexOf('双') != -1) {
            for (var i = start; i <= end; i = i + 2) {
                weeksA.push(i);
            }
        } else {
            for (var i = start; i <= end; i++) {
                weeksA.push(parseInt(i))
            }
        }
    }
    return weeksA;
}
```
#### (3)多周循环课程
第三种是笔者在给其他学校做课程信息适配时候遇到的一种情况
![在这里插入图片描述](https://img-blog.csdnimg.cn/dce285a39b0e49bf9c887d905d5139d3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAS2V2aW5XYWxrZXJTcmM=,size_7,color_FFFFFF,t_70,g_se,x_16)
该课程上课方式为，总周次18周，6周为一循环，每周上课教室不同，所以下面仅提供该种情况的解析代码
```javascript
/**
    得到单科课程信息（班级课表）
*/
function getClass(classHtml, day, section) {
    var classA = [];
    if (classHtml) {
        var classs = classHtml.split('<br><br><br>');
        if (classs[0] != "&nbsp;") {//防止空课程
            if (classHtml.indexOf("/周") != -1) {//如果是特殊的周次
                for (var j = 0; j < (18 / classs.length); j++) { //对周次进行循环
                    for (var i = 0; i < classs.length; i++) {//遍历所有课程
                        if (classs[i]) {
                            var classsObj = classs[i].split("<br>");
                            var classObj = {};
                            classObj.name = classsObj[0];
                            classObj.position = classsObj[3];
                            classObj.teacher = classsObj[2];
                            var weeksA2 = [];
                            var numWeek = ((i + 1) + (classs.length * j));
                            weeksA2.push(numWeek);
                            classObj.weeks = weeksA2;
                            classObj.day = day;
                            classObj.sections = [];
                            classObj.sections.push(section);
                            classObj.sections.push(section + 1);
                            classA.push(classObj);
                        }
                    }
                }
            } else {//正常周次
                for (var i = 0; i < classs.length; i++) {//遍历所有课程
                    if (classs[i]) {
                        var classsObj = classs[i].split("<br>");
                        var classObj = {};
                        classObj.name = classsObj[0];
                        classObj.position = classsObj[3];
                        classObj.teacher = classsObj[2];
                        classObj.weeks = [].concat(getWeeks(classsObj[1]));
                        classObj.day = day;
                        classObj.sections = [];
                        classObj.sections.push(section);
                        classObj.sections.push(section + 1);
                        classA.push(classObj);
                    }
                }
            }
        }
    }
    return classA;
}
```
### 结尾
到这里文章就算完成了，如果有不懂的地方可以直接联系我咨询，最后附上审核通过的截图：
![在这里插入图片描述](https://img-blog.csdnimg.cn/b619ac4062f1475cb894e3183e76ee83.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAS2V2aW5XYWxrZXJTcmM=,size_20,color_FFFFFF,t_70,g_se,x_16)