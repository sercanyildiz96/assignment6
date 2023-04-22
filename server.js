/*********************************************************************************
*  WEB700 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name:Sercan Yildiz Student ID: 131043226 Date: 04/22/2023
*
*
*  Online (Cycliic) Link: https://wild-pear-angler-hose.cyclic.app/
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const cd = require('./modules/collegedata.js');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('views', './views');
app.set("view engine", ".hbs");

app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  layoutsDir: __dirname + "/views/layouts/",
  defaultLayout: 'main',
  helpers: {
    navLink: function(url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="nav-item active"' : ' class="nav-item"') +
        '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
    },

    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
  }
}
}));

app.set("view engine", ".hbs");


app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
  next();
});

app.get("/", (req, res) => {
  res.render("home")
});

app.get("/about", (req, res) => {
  res.render("about")
});

app.get("/users", (req, res) => {
  res.sendFile(__dirname + '/views/users.html');
});

app.get("/htmlDemo", (req, res) => {
  res.render('htmlDemo')
});

app.get("/students",(req,res)=>{
cd.getAllStudents()
.then((data) => {
  if (data.length > 0) {
    res.render("students", { students: data });
  } else {
    res.render("students", { message: "No results found" });
  }
})
.catch((error) => {
  res.render("students", { message: error.message });
});
});

app.post('/students/add',  (req, res) => {
  cd.addStudents(req.body)
    .then(studentData => {
      res.redirect('/students');
    })
    .catch(error => {
      res.render("error", { message: error.message });
    });
});

app.get("/courses", (req, res) => {
cd.getCourses()
  .then((data) => {
    if (data.length > 0) {
      res.render("courses", { courses: data });
    } else {
      res.render("courses", { message: "No results found" });
    }
  })
  .catch((error) => {
    res.render("courses", { message: error.message });
  });
});

app.get("/student/:studentNum", async (req, res) => {
  try {
    const viewData = {}; 

    const student = await cd.getStudentByNum(req.params.studentNum);
    if (student) {
      viewData.student = student; 
    } else {
      viewData.student = null;
    }

    const courses = await cd.getCOurses(); 

    if (courses) {
      viewData.courses = courses;
    } else {
      viewData.courses = null;
    }

    const matchingCourse = viewData.courses.find(
      (course) => course.courseId === viewData.student.courseId
    );
    if (matchingCourse) {
      matchingCourse.selected = true;
    }

    if (viewData.student == null) {
      res.status(404).send("Student Not Found");
    } else {
      res.render("student", { viewData });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
