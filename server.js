require('dotenv').config();
const express = require('express');
const parser = require('body-parser');
const layouts = require('express-ejs-layouts');
const adminRoutes = require('./controllers/admin');
const coffeeRoutes = require('./controllers/coffees');
const Coffee = require('./models/coffee');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cartitem');
const Order = require('./models/order');
const OrderItem = require('./models/orderitem');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');

const SECRET_SESSION = process.env.SECRET_SESSION;
console.log(`Shhhhh:`, SECRET_SESSION);

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);
app.use(session({
  secret: SECRET_SESSION,    // What we actually will be giving the user on our site as a session cookie
  resave: false,             // Save the session even if it's modified, make this false
  saveUninitialized: true    // If we have a new session, we save it, therefore making that true
}));
app.use(flash());            // flash middleware

app.use(passport.initialize());      // Initialize passport
app.use(passport.session());         // Add a session

app.use((req, res, next) => {
  console.log(`res locals >>>>`, res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();//whenever you get this information do whatever the next thing is (go to a route or a page)
});

app.get('/', (req, res) => {
  res.render('index');
});

// Add this above /auth controllers
app.get('/profile', isLoggedIn, (req, res) => {
  const { name, email } = req.user.get(); 
  const { coffeeId } = req.order.get();
  const { coffeeName } = req.coffee.get();
  //need to understand how linking databases works to retrieve the coffeeName and imageUrl from coffees via
  //latest order for customer

  res.render('profile', { name, email, coffeeName });
});

//access to all of our auth routes GET /auth/login, GET /auth/signip POST routes
app.use('/admin', require('./controllers/admin'));
app.use('/auth', require('./controllers/auth'));
app.use('/books', require('./controllers/books'));
app.use('/coffees', require('./controllers/coffees'));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
