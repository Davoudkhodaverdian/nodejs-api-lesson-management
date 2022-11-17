
const sqlite3 = require('sqlite3').verbose();


// Connect to DB sqlite
const db = new sqlite3.Database('./db/database', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to SQlite database.');
});

const CreateComputerGroupSourceInformation = ()=>{
  // Create table computerGroupSourceInformation
  db.run('CREATE TABLE IF NOT EXISTS computerGroupSourceInformation(computerGroup_id INTEGER PRIMARY KEY,year TEXT NOT NULL,classes TEXT NOT NULL)', (err) => {
        
});
}

const CreateTableUsers = ()=> {
    // Create table users
    db.run('CREATE TABLE IF NOT EXISTS users(first_name TEXT NOT NULL,last_name TEXT NOT NULL,personal_code TEXT NOT NULL PRIMARY KEY,scientificOrder TEXT NOT NULL,cooperationType TEXT NOT NULL,scientificOrderdesc TEXT NOT NULL,cooperationTypedesc TEXT NOT NULL,charged_minimum INTEGER NOT NULL,charged_maximum INTEGER NOT NULL)', (err) => {
        
        if (!err) {
            CreateTableLessons();
            CreateTableTimes();
        }
    });

}
const CreateTableTimes = () => {
    // Create table Times
    db.run('CREATE TABLE IF NOT EXISTS times(time_id INTEGER PRIMARY KEY ,weekday TEXT NOT NULL,first_time TEXT NOT NULL, last_time TEXT NOT NULL,personal_code TEXT NOT NULL,FOREIGN KEY (personal_code) REFERENCES users (personal_code))');
}
const CreateTableLessonsUsers = () => {
    // Create table lessons
    db.run('CREATE TABLE IF NOT EXISTS lessonsUsers(lesson_user_id INTEGER PRIMARY KEY ,name TEXT NOT NULL,personal_code TEXT NOT NULL,lesson_id TEXT NOT NULL,FOREIGN KEY (lesson_id) REFERENCES lessons (lesson_id))');
}
const CreateTableLessons = () => {
    // Create table lessons
    db.run('CREATE TABLE IF NOT EXISTS lessons(lesson_id INTEGER PRIMARY KEY ,name TEXT NOT NULL,group_number INTEGER NOT NULL,theoretical_unit INTEGER NOT NULL,practical_unit INTEGER NOT NULL,full_unit INTEGER NOT NULL,full_lesson_type TEXT NOT NULL, FOREIGN KEY (full_lesson_type) REFERENCES lessontypes (full_lesson_type))', (err) => {
        
        if (!err) {
            CreateTableLessonsUsers();
        }
    });
    
}
// Create table lessontypes
let sql = 'CREATE TABLE lessontypes(full_lesson_type TEXT NOT NULL PRIMARY KEY,grade INTEGER NOT NULL,grade_type INTEGER NOT NULL,time_grade_type INTEGER NOT NULL,academic_orientation INTEGER NOT NULL,name_type TEXT NOT NULL)';
db.run(sql, (err) => {
    if (!err) {
        // Insert constant data in table lessontypes
        const lessonTypes = require('./../../modules/data/lessonTypes');
        lessonTypes.map((values) => {
            db.run(`INSERT OR IGNORE INTO lessontypes (full_lesson_type,grade,grade_type,time_grade_type,academic_orientation,name_type)  VALUES(?,?,?,?,?,?)`, values, function (err) {
                if (err) {
                    return console.log(err.message);
                }
                // get the last insert id
                console.log(`A row has been inserted with rowid ${this.lastID}`);
            });
        })
        CreateTableUsers();
        CreateComputerGroupSourceInformation();
    }
});


//   db.close((err) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     console.log('Close the database connection.');
//   });
// Connection ended with close method

module.exports = db;