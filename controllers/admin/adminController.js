import path from "path";
import { fileURLToPath } from "url";
import Admin from "../../models/admin.js";
import bcrypt from "bcrypt";
import { loginAdmin } from "../../services/adminSer/adminServices.js";
import statusCode from "../../utils/statusCodes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadLogin = (req, res) => {
  try {
    if (req.session.admin) {
      return res.redirect("/admin/dashboard");
    }
    return res.status(statusCode.OK).render("adminlogin", { message: null });
  } catch (error) {
    console.error("Admin login page load error:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server error");
  }
};

export const login = async (req, res) => {
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

export const logout = (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) {
        console.log("Error destroying session", err);
        return res.redirect("/pageerror");
      }
      res.redirect("adminlogin");
    });
  } catch (error) {
    console.log(("unexpected error during logout", error));
    res.redirect("page-404");
  }
};
