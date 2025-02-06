import dotenv from "dotenv";
import express from 'express';
const app = express();
import connectDB from "./config/db.config.js";
import cors from "cors";
import cookieParser from "cookie-parser";



dotenv.config({
  path:'.env'
});

app.use(cors({
  origin:['http://localhost:5174','http://localhost:5173'],
  credentials:true,
  methods:['GET','POST','DELETE','PUT','PATCH']
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,
  limit:"16kb"
}));
app.use(express.static("public"));
app.use(cookieParser())


// import { userRouter } from "./routes/user.route.js";
import { authRouter } from "./routes/auth.route.js";
import { fileRouter } from "./routes/file.route.js";


app.use("/api/v1/auth",authRouter)
app.use("/api/v1/file",fileRouter)
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body);
//   console.log('Cookies:', req.cookies); 
//   next();
// });


const port = process.env.PORT||3005;

connectDB().then((res)=>
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  })
).catch(()=>{
//error handling start
console.log("Error connecting to database !!")
//error handling end
});

app.get('/', (req, res) => {
  res.send('Welcome to FILER, on this line you are taking to FILER server !!');
});
