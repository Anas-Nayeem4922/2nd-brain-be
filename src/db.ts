import { model, Schema, Types } from "mongoose";


const userSchema = new Schema({
    username : {type : String, unique : true, required : true},
    email : {type : String, unique : true, required : true},
    password : {type : String, required : true},
})

export const User = model("User", userSchema);

const contentTypes = ["article", "video", "tweet", "image"];

const contentSchema = new Schema({
    link : {type : String, required : true},
    type : {type : String, enum : contentTypes, required : true},
    title : {type : String, required : true},
    description: {type: String},
    userId : {type : Types.ObjectId, ref : 'User', required : true}
});

export const Content = model("Content", contentSchema);

const linkSchema = new Schema({
    hash : {type : String, required : true},
    userId : {type : Types.ObjectId, ref : 'User', required : true, unique : true}
})

export const Link = model("Link", linkSchema);