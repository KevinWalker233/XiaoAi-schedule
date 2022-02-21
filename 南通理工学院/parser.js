var jsonArray = [];

function scheduleHtmlParser(html) {
    var $ = cheerio.load(html, { decodeEntities: false });
    if ($("#Table6").length > 0) {//班级课表查询界面适配
        $("#Table6 tr").each(
            function (i) {
                if (i > 1) {
                    $(this).children('td').each(function (j) {
                        if ((i - 1) == 3 || (i - 1) == 7) {
                            if (j > 0 && $(this) && $(this).html() && $(this).html() != "&nbsp;") {
                                var classA = [].concat(getClass($(this).html(), j, (i - 1)));
                                for (var k = 0; k < classA.length; k++) {
                                    jsonArray.push(classA[k]);
                                }
                                // console.log("第" + (i - 1) + "节课，周" + (j) + "课程名称：" + $(this).html());
                            }
                        } else if ((i - 1) == 1 || (i - 1) == 5 || (i - 1) == 9) {
                            if ((j - 1) > 0 && $(this) && $(this).html() && $(this).html() != "&nbsp;") {
                                var classA = [].concat(getClass($(this).html(), (j - 1), (i - 1)));
                                for (var k = 0; k < classA.length; k++) {
                                    jsonArray.push(classA[k]);
                                }
                                // console.log("第" + (i - 1) + "节课，周" + (j - 1) + "课程名称：" + $(this).html());
                            }
                        }
                    })
                }
            }
        )
    }
    var jsonArray1 = [];
    for (var i = 0; i < jsonArray.length; i++) {
        if (jsonArray[i].name && jsonArray[i].name != "" && jsonArray[i].name != " " && jsonArray[i].weeks.length > 0) {
            jsonArray1.push(jsonArray[i]);
        }
    }
    return jsonArray1;
}

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