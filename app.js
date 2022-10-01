require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const alert = require("alert");
const request = require("request");
const path=require("path");
const bodyParser = require("body-parser");
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose=require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const multer = require("multer");
const { nextTick } = require('process');
const { serializeUser } = require('passport');
const LocalStrategy = require('passport-local').Strategy
const fs = require('fs');


const imgPath="./pic/user_profile_pic/";
var imgName="blank_profile_picture.jpeg";
var courseID_count=0;
let temp_array=[];
let course_ID="";
let tempData=[];
let tempData1=[];



const app = express();
const storage =multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,"public/pic/user_profile_pic");
    },
    filename: (req,file,cb) => {
        console.log(file);
        // cb(null,email+path.extname(file.originalname));
        cb(null,req.user.username+".jpeg");

    }
});
var upChapter="";
var upCourseID="";
const upload = multer({storage: storage});
// multer for uploading video at /public/video
const storageVideo = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/video");
    },
    filename:(req,file,cb)=>{
        console.log(file);
        cb(null,req.user.username + upChapter + upCourseID+".MP4");
        // cb(null,"videotemp"+".MP4");

    }
});
const uploadVideo = multer({storage:storageVideo});



app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());



mongoose.connect(
     process.env.MONGODB_URI || 'mongodb+srv://keyboardwarriors:69420@projectdb.cb76nso.mongodb.net/?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  );

const adminSchema = new mongoose.Schema({
    adminEmail:{
        type:String,
        trim:true,
        lowercase:true,
        required:true,
    }
});


const faqSchema = new mongoose.Schema({
    userEmail:{
        type:String,
        trim:true,
        lowercase:true,
        required:true,
    },
    question:{
        type:String,
        required:true,
    },
    answer:{
        type: String,
    },
    ansEmail:{
        type:String,
        trim:true,
        lowercase:true,
    }
});

const chapterSchema = new mongoose.Schema({
    chapterID:{
        type:String,
    },
    chapterName:{
        type:String,
    },
    videoPath:{
        type:String,
    },
    videoTitle:{
        type:String,
    },
    tecEmail:{
        type:String,
    },
    courseID:{
        type:String,
    },
    chat:[{
        question:String,
        answer:String,
    }],
})

const courseSchema = new mongoose.Schema({
    courseID:{
        type:String,
    },
    tecEmail:{
        type:String,
        trim:true,
        lowercase:true,
        required:true,
    },
    courseName:{
        type:String,
    },
    courseStream:{
        type:String,
        enum:["Science","Arts&Commerce"]
    },
    topic:{
        type:String,
        enum:["Entrance Exams","Class XI & XII"]
    },
    chapter:[{
        type:String,
    }],
    subject:{
        type:String,
    },
    thumbnail:{
        type:String,
    },
    validity:{
        type:String,
        enum:["yes","no"],
    },
    type:{
        type:String,
        enum:["free","pro", "enterprise"],
    }
});


  const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
    },
    email:{
        type:String,
        trim:true,
        lowercase:true,
        required:true,
    },
    age:{
        type:Number,
        min:12,
        max:65,
    },
    gender:{
        type:String,
        enum:['male','female','others'],
    },
    school:{
       type:String,
    },
    guardian:{
        type:String,
    },
    plan:{
        type:String,
        enum:['free','pro','enterprise'],
    },
    pic:{
        type:String,
        
    },
    address:String,
    zip:{
        type:Number,
        
    },
    course_enrolled:[{
        type:String,
    }],
    qualification:{
                    type:String,
                    enum:['hs','b','m','phd','d'],
                },
    role:{
        type:String,
        enum: ['student','teacher'],
    }

});
userSchema.index({email: 1,role: 1},{unique: true});


userSchema.plugin(passportLocalMongoose);


// Databse Initialization: User-> Student, Tec->Teacher
const User = new mongoose.model("User",userSchema);
const Course = new mongoose.model("Course",courseSchema);
const Chapter = new mongoose.model("Chapter",chapterSchema);
const Faq = new mongoose.model("Faq",faqSchema);     
const Admin = new mongoose.model("Admin",adminSchema);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());        
        

// main program starts from here

app.get("/",function(req,res){
    if(req.isAuthenticated()){
        res.redirect("/home");
    }else{
    res.render("home");
    }
})

app.get("/signup",function(req,res){
    res.render("signup");
})

app.get("/login",function(req,res){
    res.render("login");
})

app.get("/home",function(req,res){
    if(req.isAuthenticated()){
        if(req.user.role=="student")
        res.render("home_auth",{user:req.user});
        else if(req.user.role=="teacher")
        res.render("techome_auth",{user:req.user});
    }else{
        console.log(" not Authenticated");
        res.redirect("/");
    }
})

app.get("/account",function(req,res){
    if(req.isAuthenticated()){
            User.find({email:req.user.username},function(err,data){
                console.log(data);
            if(req.user.role=="student")
            res.render("account",{user:req.user,data:data});
            else if(req.user.role=="teacher")
            res.render("tecaccount",{user:req.user,data:data});
        })
        }else{
            console.log(" not Authenticated");
            res.redirect("/");
        }
})

app.get("/photoUpload",function(req,res){
    if(req.isAuthenticated()){
        res.render("photoUpload");
    }else{
        console.log(" not Authenticated");
        res.redirect("/");
    }
})

app.get("/editname",function(req,res){
    if(req.isAuthenticated()){
        res.render("editname")
    }else{
        console.log(" not Authenticated");
        res.redirect("/");
    }
})

app.get("/pricing",function(req,res){
    if(req.isAuthenticated() && req.user.role=='student'){
        res.render("pricing_auth",{user:req.user});
    }else if(req.isAuthenticated() && req.user.role=='teacher'){
        res.redirect("/");
    }
    else{
        res.render("pricing");
    }
})

app.get("/FAQs",function(req,res){
    if(req.isAuthenticated() && req.user.role=='student'){
        Faq.find({},function(err,user1){
            res.render("faq",{user:req.user,data:user1});
        });
    }else if(req.isAuthenticated() && req.user.role=='teacher'){
        res.redirect("/");
    }else{
        console.log(" not Authenticated");
        res.redirect("/login");
    }
})

app.get("/courses",function(req,res){
    if(req.isAuthenticated()  && req.user.role=='student'){
        
        res.render("subject_page",{user:req.user,data:temp_array});
    }
    else{
        res.redirect("/");
    }
})

app.get("/course",function(req,res){
    temp_array=[];
    if(req.isAuthenticated()  && req.user.role=='student'){
        User.find({email:req.user.username},'course_enrolled',function(err,data){
            console.log(data[0].course_enrolled[1]);
            var i=0;
            let variable="";
            while(data[0].course_enrolled[i]){
            Course.find({courseID:data[0].course_enrolled[i],validity:"yes"},function(err,course){ 
                
                    variable=course[0];
                    temp_array.push(variable);
                    // console.log(variable);
                // console.log(temp_array);
                // console.log("outside"+temp_array);
            });
            i+=1;}
            res.redirect("/courses");
        })       
        
    }else if(req.isAuthenticated() && req.user.role=='teacher'){
        res.redirect("/");
    }
    else{
        res.redirect("/login");
    }
    
})

app.get("/chapters",function(req,res){
    // Chapter.find({courseID:req.body.id},function(err,data){
    //     tempData=data;
    // });
    if(req.isAuthenticated()  && req.user.role=='student'){
        console.log(tempData);
        res.render("chapter",{user:req.user,data:tempData});
    }else if(req.isAuthenticated() && req.user.role=='teacher'){
        res.redirect("/");
    }
    else{
        res.redirect("/login");
    }
})

app.post("/chapters",function(req,res){
    console.log(req.body.id);
    Chapter.find({courseID:req.body.id},function(err,data){
        tempData=data;
        // console.log(req.body.id)
        console.log("Temp data = "+data)
        res.redirect("/chapters");
        // res.render("chapter",{user:req.user, data:data});
    })
})

app.post("/chapterVideo",function(req,res){
    console.log(req.body.id);
    Chapter.find({chapterID:req.body.id},function(err,data){
        tempData1=data;
        console.log("ChapterVideo = "+tempData1) 
        // console.log(req.body.id)
        // console.log("Temp data = "+data)
        res.redirect("/learning");
        // res.render("chapter",{user:req.user, data:data});
    })
})

app.post("/chatsubmit",function(req,res){
    Chapter.find({courseID:req.body.courseID},function(err,data){
        console.log("Chat is : "+data[0].chat)
        var data1=data[0].chat;
        
        Chapter.findOneAndUpdate({courseID:req.body.courseID},{chat:data1},function(err){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/learning");
            }
        })
    })
})

app.get("/learning",function(req,res){
    if(req.isAuthenticated() && req.user.role=='student'){
        console.log(tempData1)
        res.render("courseVideo",{user:req.user,data:tempData1});
    }else if(req.isAuthenticated() && req.user.role=='teacher'){
        res.redirect("/");
    }
    else{
        res.redirect("/login");
    }
})

app.get("/offers",function(req,res){
    if(req.isAuthenticated()  && req.user.role=='student'){
        res.render("offers",{user:req.user});
    }else if(req.isAuthenticated() && req.user.role=='teacher'){
        res.redirect("/");
    }
    else{
        res.redirect("/login");
    }
})

app.get("/signout",function(req,res){
    req.logout(function(err){
        if(err){
            return next(err);
        }
        console.log("Account signed out successfully.");
        res.redirect("/");
    });
})

app.get("/about",function(req,res){
    res.render("about");
})


app.post("/signup",function(req,res){
        User.register({username:req.body.email, email: req.body.email, name:req.body.name, role:req.body.profile, pic:imgPath+imgName},req.body.password,function(err,User){
            if(err){
                console.log(err);
                res.render("signup_err",{err:err});
            }else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/login");
                })
            }
        })
    
})

app.post("/login",function(req,res){
    const user=new User({
        username: req.body.email,
        password: req.body.password
    });
    
    
    console.log(req.body.password);
    req.login(user,function(err){
        if(err){
            console.log(err);
            res.redirect("/login");
        }else{
            res.redirect("/home");
        }
    })
})

app.post("/photoUpload",upload.single("file"),function(req,res){
    
    const upload = multer({storage: storage});
    if(req.files){
        console.log(req.files)
    }
    
    User.findOneAndUpdate({email:req.user.email},{pic: imgPath+req.user.email+".jpeg"},{new:true},(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log ('inside the findOneAndUpdate');
            console.log(data);
        }
    })
    
        res.redirect("/account");
    
});

app.post("/editname",function(req,res){
    User.findOneAndUpdate({email:req.user.email},{name:req.body.newname},{new:true},(err,data)=>{
        if(err){
            console.log(err);
        }
    })
        res.redirect("/account");
});

app.post("/FAQs",function(req,res){
    var ques= new Faq({
        userEmail: req.user.username,
        question: req.body.question
    });
    ques.save();
    res.redirect("/FAQs");
})

app.post("/account",function(req,res){
    if(req.user.profile==='student'){
        User.findOneAndUpdate({email:req.user.email},{school:req.body.school,address:req.body.address+", "+req.body.address2,gender:req.body.gender,zip:req.body.zip},{new:true},(err,data)=>{
            if(err){
                console.log(err);
                req.redirect("/account");
            }
            else{
                req.redirect("/account");
            }
        })
    }else{
        User.findOneAndUpdate({email:req.user.email},{qualification:req.body.qualification,address:req.body.address+", "+req.body.address2,gender:req.body.gender,zip:req.body.zip},{new:true},(err,data)=>{
            if(err){
                console.log(err);
                res.redirect("/account");
            }
            else{
                res.redirect("/account");
            }})
    }
})

// all course contents

app.get("/content-course",function(req,res){
    if(req.isAuthenticated()){
        Course.find({topic:"Entrance Exams",validity:"yes"},function(err,data){
            if(err){
                console.log(err);
            }else{
            Course.find({topic:"Class XI & XII",validity:"yes"},function(err2,data2){
                if(err2){
                    console.log(err);
                }else{
                    // console.log(data);
                    console.log(data2);
                    res.render("content_course",{data:data,data2:data2,user:req.user});
                }
            })}
        })
    }else{
        res.redirect("/login");
    }
})

let tempcourse=[]
app.post("/takecoursexi",function(req,res){
    User.find({email:req.user.username},function(err,data){
        tempcourse=data[0].course_enrolled;
        tempcourse.push(req.body.id);
        User.findOneAndUpdate({email:req.user.username},{course_enrolled:tempcourse},function(err,data2){
            if(err){
                console.log(err);
            }else{
                res.redirect("/home");
            }
        })
    })
})

app.post("/takecourse",function(req,res){
    User.find({email:req.user.username},function(err,data){
        tempcourse=data[0].course_enrolled;
        tempcourse.push(req.body.id);
        User.findOneAndUpdate({email:req.user.username},{course_enrolled:tempcourse},function(err,data2){
            if(err){
                console.log(err);
            }else{
                res.redirect("/home");
            }
        })
    })
})


// Admin panel

app.get("/adminDashboard",function(req,res){
    if(!req.isAuthenticated()){
        
            res.render("adminlogin");
    }
        else{
            if(req.user.username==process.env.ADMIN_USERNAME){
            res.redirect("/adminDashboard");}
            else{
                res.redirect("/");
            }
        }
})

app.get("/adminManageStudents",function(req,res){
    if(!req.isAuthenticated()){
        
        res.render("adminlogin");
    }
    else{
        if(req.user.username==process.env.ADMIN_USERNAME){
        res.redirect("/adminManageStudents");}
        else{
            res.redirect("/");
        }
    }
})

app.get("/adminManageTeachers",function(req,res){
    if(!req.isAuthenticated()){
        
        res.render("adminlogin");
    }
    else{
        if(req.user.username==process.env.ADMIN_USERNAME){
        res.redirect("/adminManageTeachers");}
        else{
            res.redirect("/");
        }
    }
})

app.get("/admin-login",function(req,res){
    if(!req.isAuthenticated()){
        
            res.render("adminlogin");
    }
        else{
            if(req.user.username==process.env.ADMIN_USERNAME){
            res.redirect("/admin-portal");}
            else{
                res.redirect("/");
            }
        }
    }
    
)

app.get("/admin-portal",function(req,res){
    
    if(req.isAuthenticated()){
        if(req.user.username==process.env.ADMIN_USERNAME){
        console.log("You are now in admin portal");
        res.render("adminDashboard");
    }
    else{
        res.redirect("/admin-login");
    }}
    else{
        res.redirect("/admin-login");
    }
})

app.get("/admin-signout",function(req,res){
    if(req.isAuthenticated()){
        if(req.user.username==process.env.ADMIN_USERNAME){
        req.logout(function(err){
            if(err){
                return next(err);
            }
            console.log("Admin signed out successfully.");
            res.redirect("/");
            });
        }
        else{
            res.redirect("/");
        }
    }
    else{
        res.redirect("/");
    }
})

app.post("/admin-login",function(req,res){
    const user=new User({
        username: req.body.username,
        password: req.body.password,
    });
    // console.log(process.env.ADMIN_USERNAME)
    if(req.body.username==process.env.ADMIN_USERNAME && req.body.password==process.env.ADMIN_PASSWORD){
        User.find({username:req.body.username},function(err,user1){
            if(!user1[0]){
                
                User.register({username:req.body.username, email:req.body.username,name:"admin"},req.body.password,function(err,User){
                    if(err){
                        console.log(err);
                        res.render("adminlogin");
                    }else{
                        passport.authenticate("local")(req,res,function(){
                            res.redirect("/admin-portal");
                        })
                    }
                })
            }
            else{
                req.login(user,function(err){
                    if(err){
                        console.log(err);
                    }else{
                        res.redirect("/admin-portal");
                    }
                })
            }
        })
    }
    else{
        res.redirect("/admin-login");
    }
})

app.get("/adminViewStudentDetails",function(req,res){
    if(!req.isAuthenticated()){
        
        res.redirect("/admin-login");

    }
    else{
        if(req.user.username==process.env.ADMIN_USERNAME){
            User.find({role:"student"},function(err,data){
                if(err){
                    console.log(err);
                }else{
                    
                    res.render("adminViewStudentDetails",{data:data});}
                })
            }
        else{
            res.redirect("/");
        }
    }
})

app.get("/adminViewTeacherDetails",function(req,res){
    if(!req.isAuthenticated()){
        res.redirect("/admin-login");
        
    }
    else{
        if(req.user.username==process.env.ADMIN_USERNAME){
            User.find({role:"teacher"},function(err,data){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("adminViewTeacherDetails",{data:data});
                }
            })

        }
        else{
            res.redirect("/");
        }
    }
})

app.get("/adminViewCourseDetails",function(req,res){
    if(!req.isAuthenticated()){
        res.redirect("/admin-login");
    }
    else{
        if(req.user.username==process.env.ADMIN_USERNAME){
            Course.find({},function(err,data){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("adminViewCourseDetails",{data:data});
                }
            })

        }
        else{
            res.redirect("/");
        }
    }
})

app.post("/courseAdminManage",function(req,res){
    Course.findOneAndUpdate({courseID:req.body.id},{validity:"yes"},function(err,data){
        if(err){
            console.log(err);
        }else{
            res.redirect("/adminViewCourseDetails");
        }
    })
})

app.get("/adminViewFaqDetails",function(req,res){
    if(!req.isAuthenticated()){
        res.redirect("/admin-login");
    }
    else{
        if(req.user.username==process.env.ADMIN_USERNAME){
    Faq.find({answer:null},function(err,data){
        if(err){console.log(err)}else{
        
        res.render("adminViewFaqDetails",{data:data});
        }
    })
}
else{
    res.redirect("/");
}}
})

app.post("/adminFaqManage",function(req,res){
    Faq.findOneAndUpdate({_id:req.body.id},{answer:req.body.answer},function(err,data){
        if(err){
            console.log(err);
        }
        else{
            // console.log(req.body.id);
            res.redirect("/adminViewFaqDetails");
        }
    })
})


app.get("/courseUpload",function(req,res){
    if(req.isAuthenticated() && req.user.role=='teacher'){
        res.render("courseUpload",{user:req.user});
    }
    else if(req.user.role=='student'){
        res.redirect("/home");
    }
    else{
        res.redirect("/login");
    }
})



app.post("/courseUpload",function(req,res){
    courseID_count+=1;
    var course= new Course({
        courseName: req.body.courseName,
        courseStream: req.body.courseStream,
        topic: req.body.courseTopic,
        subject: req.body.subject,
        chapter: req.body.chapter,
        courseID:req.user.email+req.body.courseName+courseID_count,
        tecEmail:req.user.email,
        validity:"no",
    });
    upChapter=req.body.chapter;
    upCourseID=course.courseID;
    course.save();
    res.render("courseVideoUpload",{user:req.user,course:course,chapterName:req.body.chapter});
})


// app.get("/courseVideoUpload",function(req,res){
//     if(req.isAuthenticated()){
//         res.render("courseVideoUpload");        
//     }
//     else{
//         console.log(" not Authenticated");
//         res.redirect("/");
//     }
// })

app.post("/courseVideoUpload",uploadVideo.single("file"),function(req,res){
    
    const uploadVideo =multer({storage:storageVideo});
    if(req.files){
        console.log(req.files);
    }
    var chapter = new Chapter({
        chapterID:"/video/"+req.user.email + req.body.chapter + req.body.courseID+".MP4",
        chapterName:req.body.chapter,
        videoPath:"/video/"+req.user.email + req.body.chapter + req.body.courseID+".MP4",
        videoTitle:req.body.videoTitle,
        tecEmail:req.user.email,
        courseID:req.body.courseID,

    })
    upChapter="";
    upCourseID="";
    chapter.save();
    res.redirect("/");
}) 

app.get("/teccontent",function(req,res){
        if(!req.isAuthenticated()){
            res.redirect("/login");
        }
        else if(req.isAuthenticated() && req.user.role=='teacher'){
            Course.find({tecEmail:req.user.username},function(err,data){
                // console.log(data);
                res.render("teccontent",{user:req.user,data:data});
            })
        }
        else if(req.user.role=='student'){
            res.redirect("/home");
        }
        else{
            res.redirect("/login");
        }
    
})

app.post("/teccontent",function(req,res){
    if(!req.isAuthenticated()){
        res.redirect("/login");
    }
    else if(req.isAuthenticated() && req.user.role=='teacher'){
        Course.find({courseID:req.body.userID},function(err,data){
            console.log(data);
            res.render("chapterAdd",{user:req.user,data:data,courseID:req.body.courseID});
        })
    }
    else if(req.user.role=='student'){
        res.redirect("/home");
    }
    else{
        res.redirect("/login");
    }
})

app.post("/addchapter",function(req,res){
    let tempChapter=[]
    Course.find({courseID:req.body.courseID},function(err,data){
        tempChapter=data[0].chapter;
        tempChapter.push(req.body.chapterName);
        Course.findOneAndUpdate({courseID:req.body.courseID},{chapter:tempChapter},function(err){
            if(err){
                console.log(err);
            }else{
                let course=data[0];
                // console.log(course);
                upChapter=req.body.chapterName;
                upCourseID=course.courseID;
                res.render("courseVideoUpload",{user:req.user,course:course,chapterName:req.body.chapterName});
            }
        })
    })
})



app.listen(process.env.PORT || 3000,function(){
    console.log("Server is running on port 3000");
});