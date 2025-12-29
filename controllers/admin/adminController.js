const path = require('path');
const Admin = require(path.join(__dirname, '../../models/admin'));
const bcrypt = require("bcrypt");
const { loginAdmin } = require("../../services/adminSer/adminServices"); // if you have service
const statusCode = require("../../utils/statusCodes.js");


const loadLogin = (req, res) => {
  try {
    if (req.session.admin) {
      return res.redirect("/admin/dashboard");
    }
    return res.render("adminlogin", { message: null });
  } catch (error) {
    console.error("Admin login page load error:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server error");
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginAdmin(email, password);

    if (!result.success) {
      return res.status(statusCode.BAD_REQUEST).json({
        success: false,
        message: result.message
      });
    }

    console.log("Admin authenticated, creating session");

    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Session error. Please try again."
        });
      }

      // Store admin inside new session
      req.session.admin = {
        _id: result.admin._id,
        email: result.admin.email,
        name: result.admin.name
      };

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to save session"
          });
        }

        console.log("Login successful");
        return res.status(statusCode.OK).json({
          success: true,
          message: "Login successful",
          redirectUrl: "/admin/dashboard"
        });
      });
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "An unexpected error occurred"
    });
  }
};


const loadDashboard = (req, res) => {

  try {
    res.render("dashboard")
  } catch (error) {
    console.error("Error rendering admin  dashboard:", error);
    return res.redirect("/page-404")
  }

}


const logout = (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) {
        console.log("Error destroying session", err);
        return res.redirect("/pageerror")
      }
      res.redirect("adminlogin")
    })
  } catch (error) {
    console.log(("unexpected error during logout", error));
    res.redirect("page-404")
  }
}





module.exports = {
  loadLogin,
  login,
  loadDashboard,
  logout,

};
