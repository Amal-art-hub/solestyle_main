import User from "../../models/user.js";
import statusCode from "../../utils/statusCodes.js";

export const checkUserStatus = async (req, res, next) => {
  try {
    if (req.session.user) {
      const user = await User.findById(req.session.user._id);

      if (user && user.isBlock) {
        req.session.destroy((err) => {
          if (err) {
            console.log("Error destroyed session:", err);
            return res.status(statusCode.FORBIDDEN).json({
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
    res.status(statusCode.INTERNAL_SERVER_ERROR).send("Internal server error");
  }
};


export const isAuth = (req, res, next) => {

  console.log("isaUTH IS WORKING");
  if (req.session.user) {
    //  console.log("do have session")
    next();
  } else {
    console.log("dont have session");
    const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes("json"));
    if (isAjax) {
      // 2. Send 401 (Unauthorized) status - Axios will see this as an ERROR
      return res.status(statusCode.UNAUTHORIZED).json({ success: false, message: "Please login" });
    }
    // 3. Normal redirect for regular browser requests (like clicking a link)
    res.redirect("/login");
  }
};