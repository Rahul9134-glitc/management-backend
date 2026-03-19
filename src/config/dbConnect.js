import mongoose from "mongoose";

export function connectMongo(){
  try{
    mongoose.connect(process.env.MONGO_URI,{
        dbName : "Management"
    }).then(()=>{
        console.log("Mongo is connected Successfully");
    })
  }catch(error){
    console.log(error)
  }
}