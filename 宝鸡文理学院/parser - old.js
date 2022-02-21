var time = [
    { "section": 1, "startTime": "08:00", "endTime": "08:50" },
    { "section": 2, "startTime": "09:00", "endTime": "9:50" },
    { "section": 3, "startTime": "10:10", "endTime": "11:00" },
    { "section": 4, "startTime": "11:10", "endTime": "12:00" },
    { "section": 5, "startTime": "14:30", "endTime": "15:20" },
    { "section": 6, "startTime": "15:30", "endTime": "16:20" },
    { "section": 7, "startTime": "16:30", "endTime": "17:20" },
    { "section": 8, "startTime": "17:30", "endTime": "18:20" },
    { "section": 9, "startTime": "19:30", "endTime": "20:20" },
    { "section": 10, "startTime": "20:20", "endTime": "21:30" },
]
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
                            var classA = [].concat(getClass($(this).html(), (j - 1), (i - 1)));
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
    var jsonArray1 = JSON.stringify(jsonArray);
    var time1 = JSON.stringify(time);
    var conss = new Object();
    conss.courseInfos = JSON.parse(jsonArray1.replace(/\ufeff/g, ""));
    conss.sectionTimes = JSON.parse(time1.replace(/\ufeff/g, ""));
    var json2 = JSON.stringify(conss);
    console.info(JSON.parse(json2.replace(/\ufeff/g, "")));
    return JSON.parse(json2);
}

function getClass(classHtml, day, section) {
    var classA = [];
    var classs = classHtml.split('<br>');

    if (classs.length > 1) {//防止空课程
        if (classs.length <= 6) {//当课程为标准课程
            var classObj = {};
            classObj.name = classs[0];
            classObj.position = classs[3];
            classObj.teacher = classs[2];
            classObj.weeks = [].concat(getWeeks(classs[1]));
            classObj.day = day;
            classObj.sections = [];
            classObj.sections.push(time[(section - 1)]);
            classObj.sections.push(time[(section)]);
            classA.push(classObj);
        } else {//当课程为双课程

            //第一节课
            var classObj = {};
            classObj.name = classs[0];
            classObj.position = classs[3];
            classObj.teacher = classs[2];
            classObj.weeks = [].concat(getWeeks(classs[1]));
            classObj.day = day;
            classObj.sections = [];
            classObj.sections.push(time[(section - 1)]);
            classA.push(classObj);

            //第二节课
            var classObj1 = {};
            classObj1.name = classs[6];
            classObj1.position = classs[9];
            classObj1.teacher = classs[8];
            classObj.weeks = [].concat(getWeeks(classs[7]));
            classObj1.day = day;
            classObj1.sections = [];
            classObj1.sections.push(time[(section)]);
            classA.push(classObj1);
        }
    }
    return classA;
}

function getWeeks(weeksHtml) {
    var weeksStr = weeksHtml;
    var weeksA = [];
    if (weeksStr.indexOf('单') != -1) {
        var weeksA1 = weeksHtml.split('-');
        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
            weeksA.push(i);
        }
    } else if (weeksStr.indexOf('双') != -1) {
        var weeksA1 = weeksHtml.split('-');
        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i = i + 2) {
            weeksA.push(i);
        }
    } else {
        var weeksA1 = weeksHtml.split('-');
        for (var i = parseInt(weeksA1[0]); i <= parseInt(weeksA1[1]); i++) {
            weeksA.push(parseInt(i))
        }
    }
    return weeksA;
}