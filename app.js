const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const date = require(__dirname  + "/views/date.js");
const _ = require("lodash");
const PORT = process.env.PORT || 3000;
const app = express();

// const items = ["Buy Food", "Play Cricket", "Party tonight"];
// const workList = [];

mongoose.connect("mongodb+srv://shiveshkumar4120:shivesh123@cluster0.o8x2i7l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
    name : String
});

const Items = mongoose.model("Items", itemSchema);

const item1 = new Items({
    name: "Welcome to your todoList!"
});

const item2 = new Items({
    name: "Hit the + button to add an item in the list."
});


const defaultItems = [item1, item2];



app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));


// home route
app.get('/', (req, res) => {
    const day = date.getDate();

    Items.find(function(err, items) {
        if(items.length === 0) {
            Items.insertMany(defaultItems, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("Items added successfully.");
                }
            });
            res.redirect("/");
        } else {
             res.render('list', {listTitle: day,
                        title: 'TodoList',
                        newListItems: items});
        }
    });
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/:customNameList", function(req, res) {
    const customNameList = _.capitalize(req.params.customNameList);

    List.findOne({name: customNameList}, function(err, result) {
        if(!err) {
            if(!result) {
                const list = new List({
                    name: customNameList,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customNameList);
            } else {
                res.render('list', {listTitle: result.name,
                        title: 'TodoList',
                        newListItems: result.items});
            }
        }
    });


});


// catching post request made for root route. 
app.post("/", (req, res) => {
    const item = req.body.item;
    const listName = req.body.list;
    
    const newItem = new Items({
        name: item
    });

    if(listName == date.getDate()) {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, result) {
            result.items.push(newItem);
            result.save();
            res.redirect("/" + listName);
        });
    }
}); 

// delete post route
app.post("/delete", (req, res) => {
   const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName == date.getDate()) {
         Items.findByIdAndRemove(checkedItemId, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Item deleted!");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, result) {
            if(!err) {
                res.redirect("/" + listName);
            }
        });
    }
});

// work route 
app.get("/work", (req, res) => {
    res.render("list", {listTitle: "Work List",
                        title: "WorkList",
                        newListItems: workList});
});

// caught post request made for work route.
app.post("/work", (req, res) => {
    const newItem = req.body.item;
    workList.push(newItem);
    res.redirect("/work"); 
})

// about route
app.get("/about", function(req, res) {
    res.render("about", {title: "About Me"});
});

// server created
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
    console.log(`Server is running on ${PORT}`);
})