import mongoose from "mongoose";

export async function connectMongoDB() {
  await mongoose.connect(process.env.MONGO_URI!);
  // mongoose.set("debug", true);

  console.log("MongoDB connected");
}
