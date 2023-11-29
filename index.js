const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const { render } = require("ejs");
require("dotenv").config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database connected succesfully");
  })
  .catch((err) => {
    console.log("Error occured while Database connection", err);
  })


const blogSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageURL: String
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const Blog = new mongoose.model("Blog", blogSchema);

const User = new mongoose.model("User", userSchema);

app.get('/', (req, res) => {

  Blog.find({})
    .then((posts) => {
      res.render("index", { blogPosts: posts })
    })
    .catch((err) => {
      console.log("Error getting data", err);
      res.redirect("/");
    });
});


app.get('/compose', (req, res) => {
  res.render('compose')
})

app.post('/compose', (req, res) => {
  const title = req.body.title;
  const image = req.body.imageUrl;
  const description = req.body.description;

  const newBlog = new Blog({
    imageURL: image,
    title: title,
    description: description,
  })

  newBlog.save()
    .then(() => {
      console.log("New Blog Posted");
    })
    .catch((err) => {
      console.log("Error posting New Blog");
    });

  res.redirect('/');
})

app.get('/post/:id', (req, res) => {

  const reqID = req.params.id;
  console.log(reqID);

  Blog.findOne({ _id: reqID })
  .then((posts) => {
    res.render("post", { blogPosts: posts })
  })
  .catch((err) => {
    console.log("Post Not Found"); 
  });

  res.redirect("/");
})


// Using Dynamic routing concept
// Hint: Send blog _id to be deleted in req.params from frontend delete button

app.post('/post/delete/:id', async (req, res) => {
  try {
    const idToDelete = req.params.id;
  console.log(idToDelete);

    // Use mongoose's findByIdAndDelete to delete the blog post
    const deletedPost = await Blog.findByIdAndDelete(idToDelete);

    if (!deletedPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    console.log('Blog post deleted:', deletedPost);
    res.redirect("/");
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// TODO: Task 3 to implement login and sign up.

app.get("/signup", (req, res) => {
  res.render("signup");
});


app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  
  const newUser = new User({
    email: email,
    password: password,
  });

  newUser.save()
  .then(() => {
    console.log("New User Created");
    })
    .catch((err) => {
      console.log("Error Creating New User");
      });

      res.redirect("/");

});

// login routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {

  
  const reqEmail = email;
  const reqPassword = password;
  
  User.findOne({ email: reqEmail })
  .then((user) => {
    if (user.password == reqPassword) {
      console.log("Login Successful");
      res.redirect("/");
    }else{
      console.log("Login Failed");
      res.redirect("/");
    }
  })
  .catch((err) => {
    console.log("User Not Found");
    res.redirect("/");
  });
});



app.get('/about', (req, res) => {
  res.render('about');
})

app.get('/contact', (req, res) => {
  res.render('contact');
})


// port 3000 or deployment port provided by Render.com
const port = 3000 || process.env.PORT;

app.listen(port, () => {
  console.log("Server Listening on port " + port);
});