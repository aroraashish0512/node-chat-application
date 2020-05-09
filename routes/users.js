var express = require('express');
var router = express.Router();

const userModel = require('../model/User');
const passwordHash = require('password-hash');

/* GET users listing. */
router.get('/', function (req, res) {
  res.send('Unathorized Access');
});

router.get('/login', function (req, res) {
  if (!req.cookies.cookieid) {
    res.render('users/userlogin', { layout: 'frontlayout', errors: '', title: "Login" });
  } else {
    res.redirect("/users/dashboard");
  }
});

router.post('/login', function (req, res) {
  userModel.find({ email: req.body.email }, function (err, data) {
    if (data[0]) {
      userData = data[0];
      if (passwordHash.verify(req.body.password, userData.password)) {
        res.cookie("cookieid", userData._id);
        res.cookie("email", userData.email);
        res.cookie("firstname", userData.fname);
        res.cookie("lastname", userData.lname);
        res.redirect('/users/dashboard');
      } else {
        req.flash('info', 'Record does not exist, Please try another one.');
        res.redirect('/users/login');
      }
    } else {
      req.flash('info', 'Record does not exist, Please try another one.');
      res.redirect('/users/login');
    }
  });
});

router.get('/register', function (req, res) {
  if (!req.cookies.cookieid) {
    res.render('users/userregister', { layout: 'frontlayout', errors: '', title: "Register" });
  } else {
    res.redirect("/users/dashboard");
  }
});

router.post('/register', function (req, res) {
  req.assert('fname', 'First Name is required').notEmpty();
  req.assert('lname', 'Last Name is required').notEmpty();
  req.assert('email', 'Email is required').notEmpty();
  req.assert('password', 'Password is required').notEmpty();
  req.assert('password-confirm', 'Password does not matching').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    res.render('users/userregister', {
      layout: 'frontlayout',
      errors: errors,
      title: "Register"
    });

  } else {
    req.body.password = passwordHash.generate(req.body.password);
    req.body.role = 2;
    const userObj = new userModel(req.body);
    userObj.save(function (err) {
      if (err) {
        req.flash('info', 'There is some issue, Please try again later.');
      } else {
        req.flash('info', 'User has been added successfully');
      }
      res.redirect('/users/register');
    });
  }
});

router.get('/address', function (req, res) {
  if (!req.cookies.cookieid) {
    res.redirect("/users/login");
  } else {
    res.render('users/addressadd', { layout: 'authenticatelayout', title: "Add Address", username: req.cookies.firstname, errors: '' });
  }
});

router.get('/addresslist', function (req, res) {
  if (!req.cookies.cookieid) {
    res.redirect("/users/login");
  } else {
    userModel.findById(req.cookies.cookieid, function (err, userdetails) {
      //res.send(userdetails);
      res.render('users/addresslist', { layout: 'authenticatelayout', title: "Address List", username: req.cookies.firstname, userdetails: userdetails });
    });
  }
});

router.post('/address', function (req, res) {
  req.assert('city', 'City is required').notEmpty();
  req.assert('state', 'State is required').notEmpty();
  req.assert('zip', 'Zip is required').notEmpty();
  req.assert('address', 'Address is required').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    res.render('users/addressadd', {
      layout: 'authenticatelayout',
      title: "Add Address",
      username: req.cookies.firstname,
      errors: errors
    });

  } else {
    userModel.findById(req.cookies.cookieid, function (err, usr) {
      usr.address.push(req.body);
      usr.save(function (err) {
        req.flash('info', 'Address has been added successfully');
        res.redirect('/users/dashboard');
      });
    })
  }
});

router.get('/dashboard', function (req, res) {
  /* res.send(req.cookies); */
  if (!req.cookies.cookieid) {
    res.redirect("/users/login");
  } else {
    userModel.find({ 'email': { $ne: req.cookies.email} }, function (err, docs) {
      res.render('users/dashboard', { layout: 'authenticatelayout', title: "User Dashboard", username: req.cookies.firstname, users: docs });
    });
    /* res.render('users/dashboard', { layout: 'authenticatelayout', title: "User Dashboard", username: req.cookies.firstname }); */
  }
});

router.get('/logout', function (req, res) {
  res.clearCookie("cookieid");
  res.clearCookie("email");
  res.clearCookie("firstname");
  res.clearCookie("lastname");
  res.redirect('/users/login');
  /* res.send(req.cookies);
  req.cookies.destroy(function (err) {
        res.redirect('/users/login');
  }); */
});

router.get('/embeddeddoc', function (req, res) {
  userModel.findById(req.cookies.cookieid, function (err, usr) {
    usr.address.push({ address: "LIG", city: "Kanpur", state: "UP", zip: "208027" });
    usr.cuisines.push({ name: "Halwa" });
    //res.send("done");
    usr.save(function (err) {
      res.send("done");
    });
  })
});

router.get('/getcsrf', function (req, res) {
  return res.json({ data: "sjdfhakjsdfgakdjfhgsadkhsadf", status: "true" })
  /* if (!req.cookies.cookieid) {
    res.render('users/userlogin', { layout: 'frontlayout', errors: '', title: "Login" });
  } else {
    res.redirect("/users/dashboard");
  } */
});

module.exports = router;
