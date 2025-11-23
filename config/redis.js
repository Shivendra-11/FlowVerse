
import { createClient } from "redis";

const redisClient = createClient({
  username: "default",
  password: "9t3kyJ5Z86OwZ5WCUt0IcmYITQ9mFL8O",
  socket: {
    host: "redis-19597.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 19597
  }
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error:", err);
});

export default redisClient;
