const express = require('express') 
const path = require('path')
const app = express();
const User = require("./models/userModels");
const Post = require("./models/postModel")
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render("index")
})

app.get('/login',(req, res) => {
    res.render("login")
})

app.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).populate('posts');
        res.render("profile", { user });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

app.post('/post', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        const { content } = req.body;

        const post = await Post.create({
            content,
            user: user._id
        });

        user.posts.push(post._id);
        await user.save();

        res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
});



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
               name,
               username,
               password:hash,
               age,email
            });
        let token =  jwt.sign({email,userid : user._id},"hello");

        res.cookie("jwt",token);

        res.status(200).redirect("/profile");
        })
        
    })

    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
    
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return res.status(400).send("User does not exist");
        }

        console.log('User found, hashed password:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);

        console.log('Password match result:', isMatch);

        if (isMatch) {
            const token = jwt.sign({ email, userid: user._id }, "hello");

            console.log('Generated JWT token:', token);

            // Set the cookie with the token
            res.cookie("jwt", token);
            res.status(200).redirect("/profile");
        } else {
            res.status(400).send("Incorrect password");
        }
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
    const token = req.cookies.jwt; // Corrected token name

    console.log("Token from cookies:", token); // Log the token to check if it's correct

    if (!token) {
        console.log("No token found or token is empty");
        return res.status(401).send('You must be logged in first'); // Sending appropriate HTTP status code
    }

    jwt.verify(token, 'hello', (err, decoded) => {
        if (err) {
            console.log("Token verification failed:", err.message);
            return res.status(401).send('You must be logged in first'); // Sending appropriate HTTP status code
        }
        req.user = decoded;
        next();
    });
}


app.get('/like/:id', isLoggedIn, async (req, res) => {
    let post = await Post.findOne({_id:req.params.id}).populate("user");

    if(post.like.indexOf(req.user.userid) === -1){
        post.like.push(req.user.userid);
    }
    else{
        post.like.splice(post.like.indexOf(req.user.userid) ,1);
    }

    await post.save();

    res.redirect("/profile");
});


app.get('/edit/:id', isLoggedIn, async (req, res) => {

    let post = await Post.findOne({_id:req.params.id}).populate("user");
    res.render("edit",{post});
});

// app.post('/update/:id',isLoggedIn,async(res,req)=>{
//     let post = await Post.findOneAndUpdate({_id:req.params.id},{content:req.body.content})

//     res.redirect("/profile");
// })

app.post('/update/:id', isLoggedIn, async (req, res) => {

    let post = await Post.findOneAndUpdate({_id:req.params.id},{content:req.body.content});
    res.redirect("/profile");
});


app.post('/post/:id/delete', isLoggedIn, async (req, res) => {

    let post = await Post.findOneAndUpdate({_id:req.params.id},{content:req.body.content});
    res.redirect("/profile");
});

app.listen(3000, () => console.log('listening on port 3000!')) 