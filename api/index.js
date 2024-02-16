const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleWare = multer({dest:'uploads/'});
const fs = require('fs'); 

const app = express();

const salt = bcrypt.genSaltSync(10);
const secret = 'dfgd5earfzdf2dfadf8DFdfsgh54sf7'

app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));

mongoose.connect('mongodb+srv://peerhammad2022:x9HWJhRl46zeyQZB@cluster0.ygwdqwa.mongodb.net/?retryWrites=true&w=majority')

app.post('/register', async (req, res) => {
    const {userName, password} = req.body;
    try {
        const userDoc = await User.create({
            userName, 
            password:bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }
});

app.post('/login', async (req, res) => {
    const {userName, password} = req.body;
    try {
        const userDoc = await User.findOne({ userName });

        if (!userDoc) {
            // User not found, return an error response
            return res.status(400).json('User not found');
        }

        const passOk = bcrypt.compareSync(password, userDoc.password);

        if (passOk) {
            // User found and password matches
            jwt.sign({ userName, id: userDoc._id }, secret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json({
                    id: userDoc._id,
                    userName,
                });
            });
        } else {
            // Password does not match, return an error response
            res.status(400).json('Wrong credentials');
        }
    } catch (error) {
        console.error('Error during login:', error);
        // Handle other errors appropriately, e.g., return a generic error response
        res.status(500).json('Internal server error');
    }
});

app.get('/profile', (req, res) => {
    // res.json(req.cookies);
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if(err) throw err;
        res.json(info);
    });
    
}); 

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleWare.single('file'), async (req, res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length-1];
    const newPath = path+'.'+ext;
    fs.renameSync(path,newPath);

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if(err) throw err;
        const {title, summary, content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover:newPath,
            author: info.id, 
        });

        res.json(postDoc);
    });
});

app.get('/post', async (req, res) => {
    res.json(
        await Post
        .find()
        .populate('author', ['userName'])
        .sort({createdAt: -1})
        .limit(20)
    );
});

app.get('/post/:id', async (req, res) => {
    
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author');
    res.json(postDoc);
})

app.listen(4000);

//mongodb+srv://peerhammad2022:<password>@cluster0.ygwdqwa.mongodb.net/?retryWrites=true&w=majority

//x9HWJhRl46zeyQZB