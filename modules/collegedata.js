function Sequelize() {
  const Sequelize = require('sequelize');
  var sequelize = new Sequelize('jwdbnfde', 'jwdbnfde', '1_FawLZcxnF5SltOmdtFSlOKy9nfvXn7', {
    host: 'raja.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
  });

  const Student = sequelize.define('Student', {
    studentNum: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
  });

  const Course = sequelize.define('Course', {
    courseId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
  });

  Student.belongsTo(Course, { foreignKey: 'courseId' });
  Course.hasMany(Student, { foreignKey: 'courseId' });

  function initialize() {
    return new Promise((resolve, reject) => {
      sequelize
        .sync()
        .then(() => {
          console.log('Database synced successfully.');
          resolve();
        })
        .catch((err) => {
          console.error('Unable to sync the database:', err);
          reject('Unable to sync the database.');
        });
    });
  }

  function getAllStudents() {
    return new Promise((resolve, reject) => {
      Student.findAll()
        .then((students) => {
          if (students.length === 0) {
            reject('No students found.');
          } else {
            resolve(students);
          }
        })
        .catch((err) => {
          console.error('Error getting all students:', err);
          reject('Unable to get all students.');
        });
    });
  }

  function getCourses() {
    return new Promise((resolve, reject) => {
      Course.findAll()
        .then(function(courses){
          if (courses.length > 0) {
            resolve(courses);
          } else {
            reject('No courses found');
          }
        })
        .catch((error) => {
          reject(`Error retrieving courses: ${error.message}`);
        })
    });
  }

  function addStudent(studentData) {
    studentData.TA = (studentData.TA) ? true : false;

    for (const prop in studentData) {
      if (studentData.hasOwnProperty(prop) && studentData[prop] === "") {
        studentData[prop] = null;
      }
    }

    return new Promise((resolve, reject) => {
      Student.create(studentData)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(`Unable to create student: ${error.message}`);
        });
    });
  }

  function getStudentByNum(num) {
    return new Promise((resolve, reject) => {
      Student.findAll({
          where: {
            studentNum: num
          }
      })
        .then((filteredStudents) => {
          if (filteredStudents.length > 0) {
            resolve(filteredStudents[0]);
          } else {
            reject(`No student found with studentNum ${num}`);
          }
        })
        .catch((error) => {
          reject(`Error retrieving student: ${error.message}`);
        });
    });
  }


function getCourseById(id) {
  return new Promise((resolve, reject) => {
    Course.findAll({ 
      where: {
        courseId: id
      }
    })
      .then((filteredCourses) => {
        if (filteredCourses.length > 0) {
          resolve(filteredCourses[0]);
        } else {
          reject(`No course found with id ${id}`);
        }
      })
      .catch((error) => {
        reject(`Error retrieving course: ${error.message}`);
      });
  });
}

function updateStudent(studentData) {
  studentData.TA = (studentData.TA) ? true : false;

  for (const prop in studentData) {
    if (studentData.hasOwnProperty(prop) && studentData[prop] === "") {
      studentData[prop] = null;
    }
  }

  return new Promise((resolve, reject) => {
    Student.create(studentData)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(`Unable to create student: ${error.message}`);
      });
  });
}

function getStudentsByCourse(course) {
  return new Promise((resolve, reject) => {
    Student.findAll()
      .then((students) => {
        const filteredStudents = students.filter((student) => student.course === course);
        if (filteredStudents.length > 0) {
          resolve(filteredStudents);
        } else {
          reject(`No students found for course ${course}`);
        }
      })
      .catch((error) => {
        reject(`Error retrieving students: ${error.message}`);
      });
  });
}

function addCourse(courseData) {
  for (let prop in courseData) {
    if (courseData[prop] === "") {
      courseData[prop] = null;
    }
  }
  courseData.isActive = true;
  return new Promise(function(resolve, reject) {
    Course.create(courseData)
      .then(function() {
        resolve();
      })
      .catch(function() {
        reject("unable to create course");
      });
  });
}

function updateCourse(courseData) {
  Object.keys(courseData).forEach((key) => {
    if (courseData[key] === "") {
      courseData[key] = null;
    }
  });

  return sequelize.sync().then(function (courseData) {
    Course.update({
      courseCode: courseData.courseCode,
      courseDescription: courseData.courseDescription
    }, {
      where: { courseId: courseData.courseId }
    }).then(function () { console.log("successfully updated user 2");});

  })

  .then(() => {
    return Promise.resolve();
  })
  .catch((err) => {
    return Promise.reject("unable to update course");
  });
}

async function deleteStudentByNum(studentNum) {
  try {
    const deletedStudent = await Student.destroy({
      where: {
        studentNum: studentNum,
      },
    });
    if (deletedStudent) {
      return Promise.resolve();
    } else {
      return Promise.reject("Student not found");
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

function deleteCourseById(id) {
  return new Promise((resolve, reject) => {
    Course.destroy({ where: { courseId: id } })
      .then(numDeleted => {
        if (numDeleted === 0) {
          reject(new Error(`No course found with id ${id}`));
        } else {
          resolve();
        }
      })
      .catch(err => reject(err));
  });
}
module.exports = {initialize, getAllStudents, getAs, getCourses, getStudentsByCourse, getStudentsByNum, addStudent, getCourseById, updateStudent, addCourse, updateCourse, deleteStudentByNum, deleteCourseById };
}
