const express = require("express");
const app = express();
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const userModel = require('./models/users');

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

app.get('/',(req,res)=>{
    res.send("working");
})
app.get('/create',(req,res)=>{
    res.render("index");
    
})
// Signup route
app.get('/signup', (req, res) => {
    res.render("signup");
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if all required fields are present
    if (!name || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    // Check if user already exists
    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user with the hashed password
    let newUser = new userModel({
        name,
        email,
        password: hashedPassword  // Store the hashed password
    });

    await newUser.save();

    res.redirect('/login');  // Redirect to login page after signup
});


// Login route
app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    // Find the user by email
    let user = await userModel.findOne({ email });

    if (!user) {
        return res.status(404).send('User not found');
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).send('Invalid credentials');
    }

    // Store user ID in session
    req.session.userId = user._id;

    res.redirect('/read');  // Redirect to the read page after successful login
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/delete/:id', async (req,res)=>{
    let users =await userModel.findOneAndDelete({_id:req.params.id});
    res.redirect("/read");
})
app.post('/create', async(req,res)=>{
    let {name, email}=req.body;
    let user = await userModel.create({
        name, email
    })
    res.send(user,{users: alluser});
})
app.get('/update/:id', async (req, res) => {
    let user = await userModel.findById(req.params.id);
    res.render("edit", { user });  // Render the edit page with user data
});
app.post('/update/:id', async (req, res) => {
    const { name, email } = req.body;  // Get updated data from form
    let userUpdate = await userModel.findByIdAndUpdate(req.params.id, { name, email }, { new: true });
    res.redirect("/read");  // Redirect to the list after update
});

app.get('/read',async (req,res)=>{
    let alluser = await userModel.find();
    res.render("read",{users: alluser});
})


app.listen(3000);
