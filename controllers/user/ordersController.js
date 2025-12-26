
const{
  OrdersListService
} = require("../../services/userSer/ordersService");

const pdf=require("html-pdf");
const ejs=require("ejs");
const path=require("path");
const user = require("../../models/user");




const listOrder=async(req,res)=>{
      try {
        const userId=req.session.user;
        const page=parseInt(req.query.page) ||1;
        const limit=5;
        const searchQuery=req.query.search||"";
        const result=await OrdersListService(userId,page,limit,searchQuery);

        res.render("orders",{
          orders:result.orders,
          currentPage:page,
          totalPages:result.totalPages,
          searchQuery,
          user
        })
      } catch (error) {
        console.error(error);
        res.status(500).render(page-404);
      }
}


const cancelOrderItem=async(req,res)=>{

}

module.exports={
  listOrder
}