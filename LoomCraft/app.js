var createError = require('http-errors');
var express = require('express');
var dotenv = require('dotenv')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var mongoose = require('mongoose')
var db = require('./config/mongoDb')
const { v4: uuid4 } = require('uuid');
const session = require('express-session')
const nocache = require('nocache')

//PORTSETUP
dotenv.config({path:'.env'})
var PORT = process.env.PORT||3000;

var app = express();
app.use(
  session({
    secret: uuid4(),
    resave: false,
    saveUninitialized: true,
  })
);
// SESSION SETTING
app.use(cookieParser());
const key = process.env.KEY;
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: key,
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: true 
}));

app.use(function(req, res, next) {
  if (!req.user)
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});

// mongoose.connect("mongodb://127.0.0.1:27017/ecommerce")
// .then(()=>{
//   console.log("Mongodb Connected");
// }).catch(()=>{
//   console.log("Connection Failed");
// })
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/productimages', express.static(path.resolve(__dirname, 'productimages')));
app.use(express.static(path.join(__dirname, '/public')));

var userRouter = require('./routes/userRouter');
var adminRouter = require('./routes/adminRouter'); 
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT,()=>{
  console.log(`server started on http://localhost:${PORT}`);
})