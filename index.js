const express = require('express') 
const path = require('path')
const app = express();
const User = require("./models/userModels");
const Post = require("./models/postModel")
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { log } = require('console');

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render("index")
})

app.get('/login',(req, res) => {

    res.render("login")
})

app.get('/profile',isLoggedIn,async (req, res) => {
    const user = await User.findOne(req.user.email)
    res.render("profile",{user})
})

app.post('/register',async (req,res)=>{
    try {

    let {name,username,password,age,email} = req.body;

    let user = await User.findOne({email});

    if(user){
        return res.status(400).send("User already exists");
    }
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt, async(err,hash)=>{
            
            user = await User.create({
               name,username,password:hash,age,email
            });
        let token =  jwt.sign({email,userid : user._id},"shhh");

        res.cookie("jwt",token);

        res.status(200).send("User created successfully");
        })
        
    })

    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
    
})

app.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send("User does not exist");
        }

        let isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send("Incorrect password");
        }

        let token = jwt.sign({ email, userid: user._id }, "hello");
        res.cookie("jwt", token);

        res.status(200).redirect('/profile')

    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
});

app.get('/logout',async (req,res)=>{
    res.cookie("token","");
    res.redirect("login");
})

//for protected routed(like:profile route you must be logged in)
function isLoggedIn(req, res, next) {
    console.log("Token from cookies:", req.cookies.token); // Log the token to check if it's correct

    if (!req.cookies.token || req.cookies.token === "") {
        console.log("No token found or token is empty");
        return res.send('You must be logged in first');
    }

    jwt.verify(req.cookies.token, 'hello', (err, result) => {
        if (err) {
            console.log("Token verification failed:", err.message);
            return res.send('You must be logged in first');
        }
        req.user = result;
        console.log("Token verified. User:", result);
        next();
    });
}


app.listen(3000, () => console.log('listening on port 3000!'))