const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const app = express();
var Cookies = require( "cookies" )
const url= require("url")
const async = require("async");
app.use(express.static("public"));
app.set('view engine','pug');
app.use(bodyParser.urlencoded({ extended:true}));
//const router = require('express').Router();
//const website = require('./website');


var mysql = require('mysql');

function CreateTables()
{
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "databaseprojetweb"
      });
      
      con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = "CREATE TABLE comments (id INT AUTO_INCREMENT PRIMARY KEY, question_id VARCHAR(255), content VARCHAR(255),user_id INT, createdAt timestamp, updatedAT timestamp);";
        let sql2 = "CREATE TABLE questions (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), user_id int,resolved_at timestamp, createdAt timestamp, updatedAT timestamp);";
        let sql3 = "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), mdp VARCHAR(255),email varchar(255), bio varchar(255), role VARCHAR(255), createdAt timestamp, updatedAt timestamp);";
        
        con.query(sql, function (err, result) {
            if(err) throw err.code;
            else 
            console.log("table comments créée");

        });

        con.query(sql2, function (err, result) {
            if(err) throw err;
            else 
            console.log("table questions créée");

        });

        con.query(sql3, function (err, result) {
            if(err) throw err;
            else 
            console.log("table users créée");
        });
      });
}





async function Render(page,res,req)
{
  //  let connected= await CheckConnection(res,req)
    var cookies = new Cookies( req, res )
    //cookies.set("username","John")
    //cookies.set("password","Doe")
    if(cookies.get("username")!=undefined&&cookies.get("password")!=undefined)
    {
        const conDB = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "databaseprojetweb"
          });

        cookieUsername=cookies.get("username")
        cookiePassword=cookies.get("password")
        
        conDB.connect(function(err) {


            var sql='select mdp from users where name="'+cookieUsername+'"';
            //console.log(sql)
            conDB.query(sql, function (err, result) {
                if(err) console.log(err.code)
              /*  console.log(result[0].mdp)
                console.log(cookiePassword)*/
                check=1;
                if(result[0]==undefined)
                {console.log("pas connecté")
                res.redirect('authentif');
            }
                else if(result[0].mdp===cookiePassword)
                    {console.log("On est connecté")}
                else
                {console.log("pb")
                res.redirect('authentif');
            }

            })

        })
    }
    else
        res.redirect('authentif');

    
    
  /*  console.log("voilà: "+connected)
    if(connected)
        console.log("connected")
    else
        console.log("pas connecté")*/

    const conDB = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "databaseprojetweb"
      });
    
    if(page=="Main")
    {

        OrderedUser=[]
        OrderedQuestion=[]
        OrderedId=[]
        conDB.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            let sql="select * from users"
            tabUser=null;
            
            conDB.query(sql, function (err, result, fields) {
                if (err) throw err;
               // console.log(typeof(result));
                //console.log(result);
                //console.log(result.length);
                tabUser=result;
          });
          sql="select * from questions"
          conDB.query(sql, function (err, result, fields) {
            if (err) throw err;
            
            result.forEach(question => {
                AuthorId=parseInt(question.user_id);
                OrderedQuestion.push(question.title);
                OrderedUser.push(tabUser[AuthorId-1].name)
                OrderedId.push(question.id)
                
                
            });

          /*  console.log(OrderedQuestion)
            console.log(OrderedUser)
            console.log(OrderedId)*/
            res.render('home', {
                Subjects : OrderedQuestion,
                Users : OrderedUser,
                Ids : OrderedId
            });
        });





        })

    }
    else if(page=="page"){

        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var id = req.query.id;
      //  console.log(typeof(id))
    
        conDB.connect(function(err) {
    
            let OrderedComment=[];
            let OrderedId=[];
            let OrderedUser=[];
    
            if (err) throw err;
           // console.log("Connected!");
    
            tabUser=null;
            let sql2="select * from users";
            conDB.query(sql2, function (err, result) {
                if (err) throw err;
    
                tabUser=result;
        
          });
    
    
            let sql="select * from comments where question_id="+id
            tabComment=null;
            
            conDB.query(sql, function (err, result) {
                if (err) throw err;
           //     console.log(tabUser)
                result.forEach(comment =>{
                    OrderedComment.push(comment.content)
                    OrderedId.push(comment.id)
                    OrderedUser.push(tabUser[parseInt(comment.user_id)-1].name)
                }
                );
                sql2="select title,content from questions where id="+id
                conDB.query(sql2, function (err, result) {
                    if(err) throw err

                console.log(OrderedComment)

                res.render('pages', {
                    Comments : OrderedComment,
                    Ids : OrderedId,
                    Users : OrderedUser,
                    idpage : id,
                    contentPage : [result[0].title,result[0].content]
                });
          });
        });
          
    
    
        })

    }
    else if(page=="AddComment")
    {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var idpage = req.query.idpage;
        var content= req.query.content;

        conDB.connect(function(err) {
            if (err) throw err;
    
            let sql='select id from users where name=+"'+cookieUsername+'"'
            conDB.query(sql, function (err, result) {
              if(err) throw err;
              console.log(result[0].id)
              
              let sql2='insert into comments(question_id,content,user_id,createdAT) values('+idpage+',"'+content+'",'+result[0].id+',NOW())'
              console.log(sql2);
              conDB.query(sql2, function (err, result) {
                if (err) throw err;
                    console.log("ok")
                    res.redirect("/")

              })
            });  
          });
    }

    else if(page=="AddQuestion")
    {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var title = req.query.title;
        var content= req.query.description;

        conDB.connect(function(err) {
            if (err) throw err;


            let sql='select id from users where name=+"'+cookieUsername+'"'
            conDB.query(sql, function (err, result) {
              if(err) throw err;
              console.log(result[0].id)
              
              let sql2 = 'insert into questions(title,content,user_id, createdAT) values("'+title+'","'+content+'",'+result[0].id+', NOW())'
              conDB.query(sql2, function (err, result) {
                if (err) throw err;
                    console.log("ok")
                    res.redirect("/")

              })
            });      
        })
    }
}




app.get('/', (req, res ) => {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: ""
      });
      
      con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
          let sql="CREATE DATABASE databaseprojetweb"
        con.query(sql, function (err, result) {
          if (err!=null&&err.code=="ER_DB_CREATE_EXISTS") console.log("database déjà créée");
          else if(err) throw err;
          else
          CreateTables()
          Render("Main",res,req)
        });
        
      });
});


app.get('/authentif', (req, res ) => {

    res.render('authentification', {
    });
  //  res.send("Page d'authentification")


      //Render("page",res,req)
});




app.get('/pages', (req, res ) => {

    /*console.log("je suis sur une page")
    console.log(req.body)*/
    const conDB = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "databaseprojetweb"
      });



      Render("page",res,req)


    

});


app.get('/api/comment', (req, res ) => {

    Render("AddComment",res,req)
});

app.get('/api/question', (req, res ) => {

    Render("AddQuestion",res,req)
});

app.get('/testCo', (req, res ) => {

    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var password = req.query.password;
    var pseudo = req.query.pseudo;

    var conDB = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "databaseprojetweb"
      });

      conDB.connect(function(err) {
          sql = "select id from users where (name='"+pseudo+"' and mdp ='"+password+"')";
          console.log(sql)
    conDB.query(sql, function (err, result) {
        if(err) throw err

        if(result[0]==undefined)
            console.log("c'est vide!")
        else
        {
            var cookies = new Cookies( req, res )

            console.log("Result: "+result[0].id)
            cookies.set("username",pseudo)
            cookies.set("password",password)
            setTimeout(function(){
                console.log("redirection")
                res.redirect("/");
            },1000)
          //  res.send("vous allez être rediriger")

        }
            

    });
});


});



/*
// creation de la base de donnée
const db = new Sequelize('databaseprojetweb','root','', {
    host: 'localhost',
    dialect:'mysql'
});

//creation de la table user
const User = db.define('user', {
    name:{
        type:Sequelize.STRING
    },
    mdp:{
        type:Sequelize.STRING
    },
    email:{
        type:Sequelize.STRING
    },
    bio:{
        type:Sequelize.STRING
    },
    role:{
        type:Sequelize.STRING
    }
});


// creation de l'utilisateur john doe

    .sync()
    .then(()=>{
        User.create({
            name:"John",
            mdp:"Doe",
            email:"john@doe.fr",
            bio:"un gars",
            role:"gerant",
        })
    });
app.get('/api/user', (req,res) => {
    const name = req.body.name;
    const mdp = req.body.mdp;
    const email = req.body.email;
    const bio = req.body.bio;
    const role = req.body.role;
    user
        .create({name, mdp, email, bio, role})
        .then(() => {
            res.redirect('/')
        })
});

// creation de la table question
const Question = db.define('question', {
    title:{
        type:Sequelize.STRING
    },
    description:{
        type:Sequelize.STRING
    },
    user_id:{
        type:Sequelize.STRING
    },
    resolved_at:{
        type:Sequelize.STRING
    },
});
// creation d'une premiere question
Question
    .sync()
    .then(()=>{
        User.create({
            title:"j'ai une question ?",
            description:"pouvez vous repondre ?",
            user_id:"jeremie.vancutsem@gmail.com",
            resolved_at:"pose ta question d'abord"
        })
    });



app.get('/api/question', (req,res) => {
    const title = req.body.title;
    const description = req.body.description;
    const user_id = req.body.user_id;
    const resolve_at = req.body.resolved_at;
    Question
        .create({title, description, user_id, resolve_at})
        .then(() => {
            res.redirect('/')
        })
});

//creation de la table commentaire
const comment = db.define('comment', {
    question_id:{
        type:Sequelize.STRING
    },
    content:{
        type:Sequelize.STRING
    },
    user_id:{
        type:Sequelize.STRING
    },
});
// creation d'un premier commentaire
comment
    .sync()
    .then(()=>{
        User.create({
            question_id:"j'ai une commentaire",
            content:"je suis pas d'accord",
            user_id:"jeremie.vancutsem@gmail.com",
        })
    });



app.get('/api/comment', (req,res) => {
    const question_id = req.body.question_id;
    const content = req.body.content;
    const user_id = req.body.user_id;
    Comment
        .create({question_id, content, user_id})
        .then(() => {
            res.redirect('/')
        })
});




// authentification des users
    if (loggedIn)
    {
        console.log("Success!");
        res.redirect('/UserHomePage');
    }
    else
    {
        console.log("Error!");
    }


*/
app.listen(3000, () => {
    console.log('listening on port 3000');
});
