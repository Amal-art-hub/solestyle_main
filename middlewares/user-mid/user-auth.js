const User = require("../../models/user");

const checkUserStatus = async (req, res, next) => {
  try {
    if (req.session.user) {
      const user = await User.findById(req.session._id);

      if (user && user.isBlock) {
        req.session.destroy((err) => {
          if (err) {
            console.log("Error destroyed session:", err);
            return res.json({
              success: false,
              status: "blocked",
              message: "You have been blocked, please contact support.",
            });
          }
          return res.redirect("/login");
        });
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    console.log("error in user auth middleware:", error);
    res.status(500).send("Internal server error");
  }
};


module.exports={checkUserStatus};