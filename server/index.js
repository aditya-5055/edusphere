 // Importing necessary modules and packages
const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const courseRoutes = require("./routes/Courses");
const liveLectureRoutes = require("./routes/liveLecture");
const mediaRoutes = require("./routes/media");
const { registerLiveLectureSocket } = require("./socket/liveLectureSocket");
// babbar write this below
// const courseRoutes = require("./routes/Course");

const paymentRoutes = require("./routes/Payments");
const contactUsRoute = require("./routes/Contacts");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const dotenv = require("dotenv");

// Setting up port number
const PORT = process.env.PORT || 4000;

// Loading environment variables from .env file
dotenv.config();

const allowedOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
	: ["*"]

const corsOrigin = allowedOrigins.length === 1 && allowedOrigins[0] === "*"
	? "*"
	: allowedOrigins

// Connecting to database
database.connect();
 
// Middlewares
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf
    },
  })
);
app.use(cookieParser());
app.use(
	cors({
		origin: corsOrigin,
		credentials: false,
	})
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connecting to cloudinary
cloudinaryConnect();

// Setting up routes
 
app.use("/api/v1/auth", userRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/course", courseRoutes)
app.use("/api/v1/payment", paymentRoutes)
app.use("/api/v1/reach", contactUsRoute)
app.use("/api/v1/media", mediaRoutes)
app.use("/api/live-lectures", liveLectureRoutes)



app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: corsOrigin,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: false,
	},
	pingInterval: 10000,
	pingTimeout: 20000,
});

app.set("io", io)

registerLiveLectureSocket(io);

// Listening to the server
server.listen(PORT, () => {
	console.log(`App is listening at ${PORT}`);
});

// End of code.