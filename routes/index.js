// @ts-nocheck
var express = require('express');
var router = express.Router();
const userModel = require("./users")
const postModel = require("./posts");
const passport = require('passport');
const localStrategy = require("passport-local")
const upload = require('./multer')
router.get('/login/google', passport.authenticate('google'));
router.get('/oauth2/redirect/google',
  // @ts-ignore
  passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('/');
  });
passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload',upload.single('file'),isLoggedIn, async function(req, res, next) {
  if (!req.file){
    return res.status(400).send('no files were uploaded')
  }
  const user = await userModel.findOne({username: req.session.passport.user})
const post = await  postModel.create({
    image: req.file.filename, 
    imageText: req.body.filecaption,
    imagetitle: req.body.title,
    user: user._id
  })

user.posts.push(post._id)
 await user.save()
  res.send('done')
});
router.get('/login', function(req, res, next) {
  res.render('new',{error: req.flash('error')});
});
router.get('/feed', function(req, res, next) {
  res.render('feed');
});
router.get('/profile',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate('posts')
  console.log(user);
  res.render("profile",{user})
});
router.post("/register", function(req,res){
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });
  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile")
    })
  })
  });
  router.post("/login", passport.authenticate("local", {
    successRedirect:"/profile",
    failureRedirect: "/login",
    failureFlash: true
  }), function(req,res){
  });
  router.get("/logout", function(req,res,next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  })
  function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect("/login");
  }
module.exports = router;
  