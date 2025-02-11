import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { Content, Link, User } from "./db";
const app = express();
const port = 3000;
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { auth } from "./middleware";
import { random } from './utils';
import cors from "cors"
import { CustomRequest } from './types/custom-request';

const JWT_SECRET = process.env.JWT_SECRET as string;
const MONGO_URL = process.env.MONGO_URL as string;


app.use(express.json());
app.use(cors());

main()
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);

}

app.post("/signup", async (req, res) => {
    const username : string = req.body.username;
    const email : string = req.body.email;
    const password : string = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 3);
    try { 
        let user = await User.create({
            username,
            email,
            password : hashedPassword
        });
        const token = jwt.sign({
            id : user._id,
        }, JWT_SECRET);
        res.status(200).json({
            msg : "Successfully signed-up",
            token
        })
    }catch(e) {
        res.status(411).json({
            msg : "User already exists with this username"
        })
    }
})

app.post("/signin", async (req, res) => {
    const email : string = req.body.email;
    const password : string = req.body.password;
    const foundUser = await User.findOne({
        email
    });
    if(foundUser) {
        const user = await bcrypt.compare(password, foundUser.password);
        if(user) {
            const token = jwt.sign({
                id : foundUser._id
            }, JWT_SECRET);
            res.status(200).json({
                msg : "You are successfully signed-in",
                token
            })
        }else{
            res.status(403).json({
                msg : "Incorrect password"
            })
        }
    }else{
        res.status(403).json({
            msg : "Incorrect e-mail"
        })
    }
})

app.post("/content", auth, async (req: CustomRequest, res: Response) => { // Create route
    const link = req.body.link;
    const type = req.body.type;
    const title = req.body.title;
    const description = req.body.description;
    const userId = req.userId;
    await Content.create({
        link,
        type,
        title,
        description,
        userId
    });
    res.status(200).json({
        msg : "Content added"
    })
});

app.get("/content", auth, async(req : CustomRequest, res) => { // Read route
    const userId = req.userId;
    const contents = await Content.find({
        userId
    }).populate('userId', 'username');
    res.status(200).json({
        contents
    })
});

app.put("/content/:id", auth, async(req : CustomRequest, res) => { // Update Route
    const contentId = req.params.id;
    
    const userId = req.userId;
    try{
        const content = await Content.findById(contentId);
        if(content) {
            if(userId == content.userId) {
                await Content.findByIdAndUpdate(contentId, req.body);
                res.json({
                    msg : "Content updated successfully"
                })
            }else{
                res.json({
                    msg : "You don't have access to this"
                })
            }
        }
    }
    catch(e){
        res.json({
            msg : "Invalid content id"
        })
    }
});

app.delete("/content/:id", auth, async(req : CustomRequest, res) => { // Delete Route
    const contentId = req.params.id;
    
    const userId = req.userId;
    try{
        const content = await Content.findById(contentId);
        if(content) {
            if(content.userId == userId) {
                await Content.deleteOne({
                    _id : contentId
                });
                res.json({
                    msg : "Content deleted successfully"
                })
            }else{
                res.json({
                    msg : "You don't have access to this"
                })
            }
        }
        
    }
    catch(e) {
        res.json({
            msg : "Incorrect content id"
        })
    }
});

// Category filtering route
app.get("/dashboard", auth, async(req: CustomRequest, res: Response) => {
    const { category } = req.query;
    const contents = await Content.find({
        type: category,
        userId: req.userId
    });
    res.json({
        contents
    })
})

app.post("/share", auth, async(req : CustomRequest, res) => {
    const share = req.body.share;
    if(share) {
        await Link.create({
            hash : random(10),
            userId : req.userId,
        })
    }else{
        await Link.deleteOne({
            userId : req.userId
        })
    }
});

app.get("/share/:shareLink", async(req, res) => {

})


app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
})