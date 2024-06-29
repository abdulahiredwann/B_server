const express = require("express");
const router = express.Router();
const { User, validate } = require("../model/User");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { auth } = require("../middleware/Auth");
// To get user information by user id in token payload
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).send("User not found.");

    res.send(_.pick(user, ["_id", "name", "email", "profilePicture"]));
  } catch (error) {
    res.status(500).send("Something went wrong.");
  }
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User alredy registerd");

  user = new User(
    _.pick(req.body, ["name", "email", "password", "profilePicture"])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  user = await user.save();
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["name", "email", "profilePicture"]));
});

module.exports = router;
