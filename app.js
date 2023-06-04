//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-pradeep:R%40ju2108@atlascluster.vskmyqo.mongodb.net/todolistDB").then(
  app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000");
  })
);

const itemsSchema={
  name:String,
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to todolist",
});
const item2=new Item({
  name:"Hit the + button to add a item",
});
const item3=new Item({
  name:"<--- hit this to delete an item",
});

const defaultitems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List=mongoose.model("List",listSchema);



/*Item.insertMany(defaultitems).then(function(){
  console.log("Inserted sucessfully");
}).catch(function(err){
console.log(err);
});*/
app.get("/", function (req, res) {
  
  Item.find({})
    .then(foundItem => {
      if (foundItem.length === 0) {
        return Item.insertMany(defaultitems);
      } else {
        return foundItem;
      }
    })
    .then(savedItem => {
      res.render("list", {
        listTitle: "Today",
        newListItems: savedItem
      });
    })
    .catch(err => console.log(err));
 
});

app.get("/:customListName", function(req, res) {
  const customListName =_.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then(foundList => {
       if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultitems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  );
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
  item.save();
  res.redirect("/");
  }else{
    List.findOne({name:listName}).then(foundList=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete",function(req,res){
  const checkedItemid=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemid).then(function(foundItem){Item.deleteOne({_id: checkedItemid})})
 
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemid}}}).then(function (foundList)
      {
        res.redirect("/" + listName);
      });
  }
  
})


