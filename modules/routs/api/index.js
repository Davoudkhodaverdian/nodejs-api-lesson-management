const express = require('express')
const router = express.Router()
const db = require('./../../database/create')
const lessonTypes = require('./../../data/lessonTypes')



router.get('/lessons', (req, res) => {

  let sql = 'SELECT * FROM lessons'
  db.all(sql, [], (err, rows) => {
    if (err) res.status(422).json(err);
    res.status(200).send({ rows: rows, lessonTypes });
  });

})

router.post('/computergroup', (req, res) => {

  try {

    const { year, classes } = req.body;
    let sql = "INSERT OR IGNORE INTO computerGroupSourceInformation(computerGroup_id,year,classes)  VALUES(?,?,?)";
    db.run(sql, [year, year, classes.join(',')], function (err) {
      if (err) throw err;
      console.log(`add row in computergroup table`);
      res.status(200).send({ message: "computergroup inserted" });

    });


  } catch (error) { if (error) throw error; }

})


router.post('/lessons', (req, res) => {

  const insertLessons = () => {
    const { name, groupNumber, theoreticalUnit, practicalUnit, codeLesson, codeLessonType } = req.body;
    const fullUnit = Number(theoreticalUnit) + Number(practicalUnit);
    let sql = "INSERT OR IGNORE INTO lessons (lesson_id,name,group_number,theoretical_unit,practical_unit,full_unit,full_lesson_type)  VALUES(?,?,?,?,?,?,?)"
    db.run(sql, [codeLesson, name, groupNumber, theoreticalUnit, practicalUnit, fullUnit, codeLessonType], function (err) {
      if (err) throw err;
      console.log(`add row in lessons table`);
      const lessonType = lessonTypes[lessonTypes.findIndex((i) => i[0] == codeLessonType)][5];
      res.status(200).json(
        {
          statusText: 'lesson inserted', data: { key: codeLesson, value: (`${name} - ${lessonType}`) },
          status: 200
        }
      );

    });
  }

  try {

    if (lessonTypes.find(item => item[0] == req.body.codeLessonType)) {
      insertLessons();
    } else {
      res.status(422).json([{ title: "codeLessonType", message: 'چنین کد نوع درسی وجود ندارد' }]);
    }


  } catch (error) { if (error) throw error; }

})


router.get('/userstimes', (req, res) => {
  try {
    const receiveUsersData = (times) => {
      let sql = 'SELECT * FROM users'
      db.all(sql, [], (err, rows) => {
        if (err) throw err;
        receiveLessonsData({ users: rows, times });
      });
    }
    const receiveLessonsData = ({ users, times }) => {
      let sql = 'SELECT * FROM lessons'
      db.all(sql, [], (err, rows) => {
        if (err) throw err;
        receiveComputerGroupData({ users, times, lessons: rows });
      });
    }
    const receiveComputerGroupData = ({ users, times, lessons }) => {
      let sql = 'SELECT * FROM computerGroupSourceInformation'
      db.all(sql, [], (err, rows) => {
        if (err) throw err;
        receiveLessonsUsers({ users, times, lessons, computerGroup: rows });
      });
    }
    const receiveLessonsUsers = ({ users, times, lessons, computerGroup }) => {
      let sql = 'SELECT * FROM lessonsUsers'
      db.all(sql, [], (err, rows) => {
        if (err) throw err;
        res.status(200).send({ users, times, lessons, computerGroup, lessonsUsers: rows });
      });
    }
    let sql = 'SELECT * FROM times';
    db.all(sql, [], (err, rows) => {
      if (err) throw err;
      receiveUsersData(rows);
    });
  } catch (error) { if (error) throw error; }
})


router.post('/lessonsUsers', (req, res) => {
  try {
    const { codePersonal } = req.body;
    const addLessonsUsers = ({ lessons }) => {

      req.body.lessonsUsers.map((value, index) => {
        let lesson = lessons.find(i => i.lesson_id == value);
        db.run(`INSERT OR IGNORE INTO lessonsUsers(lesson_user_id,name,personal_code,lesson_id)  VALUES(?,?,?,?)`,
          [(lesson.lesson_id + lesson.full_lesson_type), lesson.name, codePersonal, lesson.lesson_id], function (err) {
            if (err) res.status(422).json(err);
            // get the last insert id
            console.log(`add rows in lessonsUsers table`);
            if (req.body.lessonsUsers.length == (index + 1)) {

              res.status(200).json({ statusText: 'lessonsUsers inserted', status: 200 });
            }
          });
      })

    }
    const receiveLessonsData = () => {
      let sql = 'SELECT * FROM lessons';
      db.all(sql, [], (err, rows) => {
        if (err) res.status(422).json(err);
        console.log(rows);
        addLessonsUsers({ lessons: rows });
        if (req.body.lessonsUsers.length === 0) res.status(200).send({ lessons: rows });
      });
    }

    const receiveUsersData = () => {
      let sql = 'SELECT * FROM users'
      db.all(sql, [], (err, rows) => {
        if (err) res.status(422).json(err);
        if (!rows.find(i => i.personal_code == codePersonal))
          res.status(422).json([{ title: "codePersonal", message: 'استادی با این کد پرسنلی وجود ندارد' }]);
        else receiveLessonsData();
      });
    }
    receiveUsersData();
  } catch (error) {
    if (error) res.status(422).send(error);
  }
})

router.post('/userstimes', (req, res) => {
  try {
    const { name, family, codePersonal, scientificOrder, cooperationType, chargedMinimum, chargedMaximum } = req.body;
    const scientificOrderdesc = scientificOrder == '1' ? "استاد" :scientificOrder == '2' ? "دانشیار":  scientificOrder == '3' ?"استادیار" :  "مربی";
    const cooperationTypedesc = cooperationType == '1' ? "هیات علمی - تمام وقت" : cooperationType == '2' ? "هیات علمی - نیمه وقت" :"مدعو";
    const addTimes = () => {

      req.body.timeData.map((values, index) => {
        const { day, firstTime, lastTime } = values.data;
        db.run(`INSERT OR IGNORE INTO times(weekday,first_time, last_time,personal_code)  VALUES(?,?,?,?)`,
          [day, firstTime, lastTime, codePersonal], function (err) {
            if (err) res.status(422).json(err);
            // get the last insert id
            console.log(`add rows in times table`);
            //console.log(req.body.timeData.length == (index + 1))
            if (req.body.timeData.length == (index + 1)) {
              res.status(200).send({ statusText: 'users times  inserted', status: 200 });
            }

          });
      })
    }
    db.run(`INSERT OR IGNORE INTO users (first_name,last_name,personal_code,scientificOrder,cooperationType,scientificOrderdesc,cooperationTypedesc,charged_minimum,charged_maximum)  VALUES(?,?,?,?,?,?,?,?,?)`,
      [name, family, codePersonal, scientificOrder, cooperationType, scientificOrderdesc, cooperationTypedesc, chargedMinimum, chargedMaximum], function (err) {
        if (err) res.status(422).json(err);
        console.log(`add row in users table`);
        addTimes();
        if (req.body.timeData.length === 0) res.status(200).send({ statusText: 'users  inserted', status: 200 });
      });
  } catch (error) {
    if (error) res.status(422).send(error);
  }
})

router.get('/userinfo', (req, res) => {
  //
  const xlsx = require('xlsx');
  const wb = xlsx.readFile('files/exel-info.xlsx');
  const ws = wb.Sheets['infouser'];
  const data = xlsx.utils.sheet_to_json(ws)
  res.status(200).send(data);

})

module.exports = router;