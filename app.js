const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();



app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});


const ItemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', ItemsSchema);

const item1 = new Item(
  { name: 'welcom to our to do list' }
);
const item2 = new Item(
  { name: 'write your new item' }
);
const item3 = new Item(
  { name: 'hit the + button to add' }
);

const ListSchema = new mongoose.Schema({
  name: String,
 items: [ItemsSchema],
});
const List = mongoose.model('List', ListSchema);


const defaultItems= [item1,item2,item3];

app.get("/", function(req, res) {

  Item.find(function(error,items){
    if (items.length===0) {
      Item.insertMany(defaultItems,function (error) {
          if(error){
            console.log("error");
          }else {
            console.log("sucess saved");
          }
        }
      );
      res.redirect("/");
    }else {
      res.render("list", {listTitle: "Today",newlistitems: items});

    }
  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newitem;
  const listname=req.body.list;

  const item= new Item(
    {name:itemName}
  );

  if (listname==="Today") {
    item.save();
    res.redirect("/")
  }else {
    List.findOne({name:listname},function(err,foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    })
  }



});

app.post("/delete",function(req,res) {
const checkboxId=req.body.checkbox;
const listName=req.body.listname;
if (listName==="Today") {
  Item.findByIdAndDelete(checkboxId,function(error) {
    if (!error) {
      console.log("success remove");
        res.redirect("/");
      }
    });

  }else {
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxId}}},function(err,foundlist) {
        if(!err){
          res.redirect("/"+listName)
        }
      });
    }
  });









app.get("/:listName",function (req,res) {
  const storedlistname=req.params.listName


  List.findOne({name:storedlistname},function(err,foundlist) {
    if (!err){
      if(!foundlist){
        const list = new List(
          { name:storedlistname  ,
          items:defaultItems}
        );
        list.save();
        res.redirect("/"+storedlistname);
      }else {
        res.render("list",{listTitle:foundlist.name, newlistitems: foundlist.items});
      }
    }
  });

});


app.listen(300, function() {
  console.log("Server started at port 300");
});
