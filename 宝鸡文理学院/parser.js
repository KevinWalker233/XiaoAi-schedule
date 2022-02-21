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