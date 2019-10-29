var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);
var PORT = process.env.PORT || 3000;

var db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error"));
db.once("open", function () {
    //connected
    console.log("connected to mongodb database");
});

//defining schema
var postSchema = new mongoose.Schema({
    title: String,
    link: String,
    saved: Boolean,
    note: String
});
//defining model
var post = mongoose.model("post", postSchema);


//ROUTING
//returns index html file
app.get("/", function (req, res) {
    res.sendFile("./public/index.html");
});
//returns saved html file
app.get("/saved", function (req, res) {
    res.sendFile("./public/saved.html", { root: __dirname });
});
//preforms scrape action and sends to db
app.get("/scrape", function (req, res) {
    axios.get("https://old.reddit.com/r/2007scape/").then(function (response) {
        var $ = cheerio.load(response.data);
        var results = [];
        $("p.title").each(function (i, element) {

            var newtitle = $(element).text();
            var newlink = $(element).children().attr("href");

            var newPost = new post({ title: newtitle, link: newlink, saved: false, note: "" });
            console.log(newPost);
            newPost.save(function (err, newPost) {
                if (err) return console.error(err);
            })
        });
    }).then(function (data) {
        post.find(function (err, posts) {
            if (err) return console.error(err);
            res.send(posts);
        });
    })

});
//route for posting note to article
app.post("/api/note/:articleid", function (req, res) {
    post.findById(req.params.articleid, function (err, result) {
        if (err) {
            console.error(err);
        }
        result.note = JSON.stringify(req.body.note);
        console.log("posting note for article id: " + req.params.articleid)
        console.log(result)
        result.save();
        res.json(result);
    });
});
//gets all articles
app.get("/api/all", function (req, res) {
    post.find(function (err, data) {
        if (err) {
            console.log(err);
        }
        res.send(data);
    })
});
//returns saved articles
app.get("/api/saved", function (req, res) {
    post.find({ saved: true }, function (err, data) {
        if (err) {
            console.log(err);
        }
        res.send(data);
    })
});
//route for deleting notes
app.delete("/api/note/delete/:id", function (req, res) {
    console.log(req.params.id);
    post.findById(req.params.id, function (err, result) {
        if (err) {
            console.error(err);
        }
        result.note = null;
        result.save();
        res.send("done!");
    });
});
//route for saving articles
app.post("/api/:articleid", function (req, res) {
    console.log(req.params.articleid);
    post.findById(req.params.articleid, function (err, result) {
        if (err) {
            console.error(err);
        }
        result.saved = true;
        result.save();
    });
});
//route for unsaving articles
app.post("/api/unsave/:articleid", function (req, res) {
    console.log(req.params.articleid);
    post.findById(req.params.articleid, function (err, result) {
        if (err) {
            console.error(err);
        }
        result.saved = false;
        result.save();
    });
});
//route for retrieving an article's note
app.get("/api/note/:id", function (req, res) {
    post.findById(req.params.id, function (err, result) {
        if (err) {
            console.error(err);
        }
        res.json(result);
    });
});


app.listen(PORT, function () {
    console.log(
        "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
        PORT,
        PORT
    );
});
