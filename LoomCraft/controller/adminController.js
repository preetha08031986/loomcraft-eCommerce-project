
const adminCollection = require('../models/adminDetails');
const userCollection= require('../models/userDetails');
const categoryCollection = require('../models/categoryDetails');
const productCollection = require('../models/productDetails');
const orderCollection = require('../models/orders')
const couponCollection = require('../models/coupon')
const offerCollection = require('../models/offers')
const graphflow =require('chart.js')
const multer = require('multer')
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const Sharp = require('sharp')




// load admin login page
const loadLogin = (req,res) => {
    try{

        res.render('admin/login')
    }
    catch(err){
        console.log(err.message)
    }
}



const verifyLogin = async (req,res) => {
    try{
    const check = await adminCollection.findOne({username: req.body.username });
    
    if(check.password == req.body.password){
      req.session.admin = check.username;
        res.redirect("/admin/dashboard");
    } else {
        res.render("admin/login", { message: "Invalid password" });
        }
    } catch (err) {
        console.log(err)        }
    }

    const loadSignup = (req,res) => {
        try{
    //console.log("hello");
            res.render('admin/signup')
        }
        catch(err){
            console.log(err.message)
        }
    }

    const verifysignup= async (req,res)=>{
        try{
          let flag=false
          const checkname = await adminCollection.findOne({$or : [{ name: req.body.name},{email : req.body.email}]});
              if(checkname !== null) flag = true;
              if(!flag){
              const data = {
                  name: req.body.name,
                  username: req.body.username,
                  email: req.body.email,
                  mobile: req.body.mobile,
                  password: req.body.password,
              };
              await adminCollection.insertMany([data]);
              res.redirect('/admin/homepage')
              }
              else{
              res.render('admin/homepage', {message: "Username or Email already exists"});  
              }
              }
          catch(err){
              console.log(err.message);
          }
      }
    
const loadHomepage = (req,res) => {
    try{
        if(req.session.admin){
            res.render('admin/homepage')
        }else{
            res.render('admin/login',{mesage:'Invalid'})
        }
    } catch(error){
        console.log(error.message);
    }
}  

const dashboard = async (req, res) => {
    try {
  
        if (req.session.admin) {
            const userData = await userCollection.find()
            const order = (await orderCollection.find()).flat();
            const orderedProduct=order.find(item=>item.products)   
            const numberOfProducts = orderedProduct.products.filter(product => product.productStatus === false).length;       
            console.log("orderedProduct>>",orderedProduct);
            console.log("numberOfProducts>>",numberOfProducts);
           // const orderPdf = await orderModel.find({}, { _id: 1, status: 1, payment: 1 })
            //console.log("orderPdf>>",orderPdf)
            const product = await productCollection.find()
            const orderDeliverd = order.filter((data) => data.status === "Delivered");
            const totalAmount = orderDeliverd.reduce((total, product) => total + parseInt(product.payment.amount), 0);
            const totalSales = orderDeliverd.length;
            const totalUser = userData.length;
            const totalOrder = order.length;
            const totalProduct = product.length;
            const orderCanceled = order.filter((data) => data.status === "Canceled");
            const canceled = numberOfProducts;
            const orderStatus = {};
            // Retrieve all unique status values from the database
            const uniqueStatusValues = [...new Set(order.map((data) => data.status))];
            // Initialize the orderStatus object with the status values
            uniqueStatusValues.forEach((status) => {
                orderStatus[status] = 0;
            });
            // Count the occurrences of each status
            order.forEach((data) => {
                orderStatus[data.status]++;
            });
  
            const cata = await categoryCollection.find();
            res.render('admin/dashboard', {
                title: "Dashboard",
                admin: req.session.admin,
                totalSales,
                totalAmount: totalAmount,
                totalUser,
                canceled,
                totalOrder,
                order,
                totalProduct,   
                cata,
                orderStatus: JSON.stringify(orderStatus),
                message: "admin dashboard"
            })
            // res.render('admin/dashboard', { title: 'Express', message: "admin dashboard" });
        }
        else {
            res.render('admin/login', { fail: "", title: "Admin Login", message: "" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };
  const graph = async (req, res) => {
    try {
      console.log("req.body",req.body);
     const { categoryname, salesRe, year, month, today } = req.body;
      
       let data 
      if(req.body.salesRe == "Yearly") {
          const targetYear = parseInt(req.body.year)
         
          data = await orderCollection.aggregate([
              {
                $match: {
                  //status: { $in: ["Delivered", "Returned", "Cancelled","Processing"] },
                  // Add your matching conditions here
                  createdAt: {
                    $gte: new Date(targetYear, 0, 1),
                    $lt: new Date(targetYear + 1, 0, 1)
                  }
                }
              },
              {
                $group: {
                  _id: "$status", // Group by status
                  count: { $sum: 1 } // Count occurrences of each status
                }
              },
              {
                $project: {
                  _id: 0, // Exclude _id field
                  label: "$_id", // Create a 'label' field with status value
                  value: "$count" // Create a 'value' field with count value
                }
              }
            ]);
            
          console.log("allOrder>>",data);
          res.json(data);
      }
      else if(req.body.salesRe ==='Monthly' )
      {
          const [targetYear, targetMonth] = month.split("-");
        
        const data = await orderCollection.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(targetYear, targetMonth - 1, 1),
                $lt: new Date(targetYear, targetMonth, 1)
              }
            }
          },
          {
            $group: {
              _id: "$status", // Group by status
              count: { $sum: 1 } // Count occurrences of each status
            }
          },
          {
            $project: {
              _id: 0, // Exclude _id field
              label: "$_id", // Create a 'label' field with status value
              value: "$count" // Create a 'value' field with count value
            }
          }
        ]);
  
        console.log("data>>", data);
        res.json(data);
      }
      else if(req.body.salesRe ==='Daily')
      {
          data = await orderCollection.aggregate([
              {
                $match: {
                  // Add your matching conditions here
                  createdAt: {
                    $gte: new Date(today), // Start of the given date
                    $lt: new Date(today + 'T23:59:59.999Z') // End of the given date
                  }
                }
              },
              {
                $group: {
                  _id: "$status", // Group by status
                  count: { $sum: 1 } // Count occurrences of each status
                }
              },
              {
                $project: {
                  _id: 0, // Exclude _id field
                  label: "$_id", // Create a 'label' field with status value
                  value: "$count" // Create a 'value' field with count value
                }
              }
            ]);
            console.log("data>>",data);
            res.json(data)
      }
     else{
      data={}
      res.json(data);
     }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  const graphcategory= async (req,res)=>{
    console.log("hai")
 const categoryName=req.body.category;
 console.log("categoryName>>",categoryName);
 try {
    // Fetch and aggregate data based on the selected category
    const data = await orderCollection.aggregate([
      { $unwind: '$products' },
      {
        $match: {
          'products.category': categoryName,
          'products.productStatus': true 
        }
      },
      {
        $group: {
          _id: '$products.p_name', // Group by product name
          totalPrice: { $sum: '$products.quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          label: '$_id', // Use product name as the label
          value: '$totalPrice'
        }
      },
      {
        $sort: { value: -1 } // Sort by total price in descending order
      }
    ]);

    console.log("data>>", data);
    res.json(data); // Send the data as a JSON response
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
};
//   const salesReport = async(req,res) =>{
//     try{
//     const order = await orderCollection.aggregate([
//         {
//             $unwind: '$products'
//         },
//         {
//             $group: {
//                 orderId:{$first:'$_id'},
//                 _id: {
//                   p_name: '$products.p_name',
//                   price: '$products.price', 
//                   category: '$products.category'
//                 },
//                 payment: {$first:'payment.method'},
//                 status: {$sum:1}
//             }
//         },
//         {
//             $project:{
//         _id:0,
//         p_name:'$_id.p_name',
//         price: '$id.price',
//         payment:1,
//         status:,
//         orderId: {$toString:'$orderId'},
//         count:1
//             }
//         }
        

//     ]);
//     console.log("order>>>",order);
//     res.render('admin/salesReport',{title:"",orders:order,admin:req.session.admin,message:""})
//     }catch(error){
//         console.log(error.message);
//         res.status(500).json({error: "Internal Server Error"})
//     }
//   }
const salesReport = async (req, res) => {
    try {
      const order = await orderCollection.aggregate([
        {
          $unwind: '$products',
        },
        {
          $group: {
            orderId: { $first: '$_id' },
            status: { $first: '$status' }, // Retrieve status from the top-level document
            _id: {
              p_name: '$products.p_name',
              price: '$products.realPrice',
              category: '$products.category',
              productStatus: '$products.productStatus', // Assuming productStatus is within products
            },
            payment: { $first: '$payment.method' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            p_name: '$_id.p_name',
            price: '$_id.price',
            payment: 1,
            status: 1, // Include status in the result
            orderId: { $toString: '$orderId' },
            count: 1,
          },
        },
      ]);
  
      console.log('order>>>', order);
      res.render('admin/salesReport', {
        title: '',
        orders: order,
        admin: req.session.admin,
        message: '',
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
const userView = async (req, res) => {
  try {
      if(req.session.admin)
      {
      const userdtls = await userCollection.find()
      res.render('admin/userView', { title: 'Express', admin: req.session.admin,message: "admin dashboard",  userdtls });
      }
      else{
          res.redirect('/admin/homepage')
      }   
  } catch (err) {
      console.log(err)
  }

};
const searchUser = async (req,res) => {
    let searchName = req.query.search;
    console.log("query",req.query.search);
    const usersearch = await userCollection.find({ username: { $regex: '^' + searchName, $options: 'i' } },
    
    );
    console.log("users<<",usersearch);
    if(usersearch == ""){
      res.render('admin/userView',{message : "Searched user doesnot exist", usersearch})
    }
    else{
      res.render('admin/userView',{title : "Admin System", users})
    }
  } 
const userBlocking = async (req, res) => {
  try {
      const userId = req.params.id
      await userCollection.findByIdAndUpdate({ _id: userId }, {
          $set: {
              status: true
          }

      })
      res.redirect('/admin/userView')
  }
  catch (err) {
      console.log(err)
  }
}
const userUnBlocking = async (req, res) => {
  try {
      const userId = req.params.id
      await userCollection.findByIdAndUpdate({ _id: userId }, {
          $set: {
              status: false
          }
      })
      res.redirect('/admin/userView')
  }
  catch (err) {
      console.log(err)
  }

}
const productView=async (req,res)=>{
  try {
      if(req.session.admin)
      {
      const products= await productCollection.find()
      res.render('admin/productView', { title: "Products",admin: req.session.admin, message: "Product DTLS",products })
      }
      else{
          res.redirect('/admin/homepage')
      }

  } catch (error) {
      console.log(error);
  }
}
const addProduct= async (req,res)=>{
  try {
      const category=await categoryCollection.find({},{categoryName:1})
      res.render('admin/productAdding', { title: "Add Products", admin: req.session.admin, message: "Add Products" ,category})
  } catch (error) {
      console.log(error)
  }
}
const addProductPost=async (req,res)=>{
  try {
      
      const { p_name,price, originalprice,productStock,productOffer,category,color, description,addedby,availability } = req.body;
      const files = req.files;
      const filename = files.map(file => file.filename)
      if (!req.files) return next();

        req.body.images = [];
        await Promise.all(
            req.files.map(async file => {
                const newFilename = filename

      await Sharp({
        create: {
            width: 48,
            height: 48,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 0.5 }
        }
    })
        .png()
        .toBuffer()

    req.body.images.push(newFilename);
  })
        )
    //console.log("req.body.images>>",req.body.images);  
           
      const productExist = await productCollection.find({ p_name: p_name })
      if (productExist.length===0) {

      const product = {
          p_name:req.body.p_name,
          price: Math.floor(req.body.originalprice * (1 - req.body.productOffer / 100)),
          originalprice:req.body.originalprice,
          productStock:req.body.productStock,

          category:req.body.category,
          productOffer:req.body.productOffer,
          disc_Amount:Math.floor(req.body.originalprice - Math.floor(req.body.originalprice * (1 - req.body.productOffer / 100))),
        
          color:req.body.color,
          description:req.body.description,
        
          addedby:req.body.addedby,
          // availability:req.body.availability,
          images: files.map(file => file.filename)
      };
      // Save the product to the database
      console.log(product);
      await productCollection.insertMany([product]);

      res.redirect('/admin/productView');
    }
            
    else {

        const msg = "Product with the same name already exists.";
        const category = await categoryModel.find({ isAvailable: true }, { categoryName: 1 })
        res.render('admin/productAdding', { title: "", admin: req.session.admin, message: msg, category })

    }
   }catch (error) {
      // Handle any errors that occurred during the process
      console.log(error);
      res.redirect('/admin/productView'); // Redirect to an appropriate error page or display an error message
  }
}
const editProduct=async(req,res,next)=>{
  try {
      const id=req.params.id
      // let images=req.body.images;
      // console.log("images",images);
      const products= await productCollection.findById({_id:id})
    //   await Sharp({
    //     create: {
    //         width: 48,
    //         height: 48,
    //         channels: 4,
    //         background: { r: 255, g: 0, b: 0, alpha: 0.5 }
    //     }
    // })
    //     .png()
    //     .toBuffer()

    //     images.push(newFilename);
    //console.log("req.body.images>>",req.body.images);  

      const categorydata = await categoryCollection.find({},{categoryName:1});
      res.render('admin/productEdit',{ title: "Edit Product", admin: req.session.admin, message: "" ,products,categorydata})
  } catch (error) {
      console.log(error)  
  } 
}  
const editProductPost=async (req,res)=>{
  try {  
      const files = req.files;
      console.log(files);
      // const product = {
      //     p_name:req.body.p_name,        
      //     price:req.body.price, 
      //     category:req.body.category,
      //     color:req.body.color,
      //     description:req.body.description,
      //     quantity:req.body.quantity,
      //     addedby:req.body.addedby,
      //     // availability:req.body.availability,
      //     images: files.map(file => file.filename)
      // };
      await productCollection.updateOne({_id:req.body._id},{  $set: {
          p_name:req.body.p_name,        
          price:req.body.price, 
          originalprice:req.body.originalprice,
          productStock:req.body.productStock,
          productOffer:req.body.productOffer,
          disc_Amount:Math.floor(req.body.originalprice - Math.floor(req.body.originalprice * (1 - req.body.productOffer / 100))),

          category:req.body.category,
          color:req.body.color,
          description:req.body.description,
         
          addedby:req.body.addedby,
           availability:req.body.availability,
          images: files.map(file => file.filename)
      }})           
      res.redirect('/admin/productView')
  } catch (error) {
      console.log(error)  
  }
}
const prodUnlist = async (req, res) => {
    try {
        console.log('i am the unlist');
        const prod_Id = req.params.id
        console.log(prod_Id);
        await productCollection.findByIdAndUpdate({ _id: prod_Id }, {
            $set: {
                availability: false
            }
        })
        res.redirect('/admin/productView')
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const prodlist = async (req, res) => {
    try {
        const prod_Id = req.params.id
        await productCollection.findByIdAndUpdate({ _id: prod_Id }, {
            $set: {
                availability: true
            }
        })
        res.redirect('/admin/productView')
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


  const searchProduct = async (req,res) => {
    let searchName = req.query.search;
    console.log("query",req.query.search);
    const products = await productCollection.find({ p_name: { $regex: '^' + searchName, $options: 'i' } },
    
    );
    console.log(products);
    if(products == ""){
      res.render('admin/productView',{message : "Searched product doesnot exist", products})
    }
    else{
      res.render('admin/productView',{title : "Admin System", products})
    }
  } 




  



const categoryDetails=async (req,res,next)=>{
  try {
      if(req.session.admin)
      {    
      const categoryDtl= await categoryCollection.find()

      res.render('admin/category', { title: "Category", admin: req.session.admin, message: "CATEGORY DTLS",data:categoryDtl })
      }
      else{
          res.redirect('/admin/login')
      }   

  } catch (error) {
      console.log(error);
  }   
 
}
const createCategory=async (req,res)=>{
  try {
      res.render('admin/createCategory',{ title: "Add Category", admin: req.session.admin, message: "" })
  } catch (error) {
      console.log(error)
  }

}
const createCategoryPost=async (req,res)=>{

  try {
      const data={
          categoryName:req.body.categoryName,
          description:req.body.description,
          isAvailable:req.body.isAvailable
      }
      await categoryCollection.insertMany([data])
      res.redirect('/admin/category')
  } catch (error) {
      console.log(error) 
  }
}
const unlistCategory = async (req, res) => {
    try {
        const categoryId = req.params.id
        await categoryCollection.findByIdAndUpdate({ _id: categoryId },
            {
                $set: { isAvailable: false }
            })
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }

}
const listCategory = async (req, res) => {
    try {
        const categoryId = req.params.id
        await categoryCollection.findByIdAndUpdate({ _id: categoryId },
            {
                $set: { isAvailable: true }
            })
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }

}
const editCategory=async (req,res)=>{
  try {
      const id=req.params.id
      const category= await categoryCollection.findById({_id:id})
      res.render('admin/categoryEdit',{ title: "Edit Category", admin: req.session.admin, message: "" ,category})
  } catch (error) {
      console.log(error)  
  }   
}
const categoryEditPost=async (req,res)=>{
  try {
      console.log(req.body )
      const data={            
              categoryName:req.body.categoryName,
              description:req.body.description,
              isAvailable:req.body.isAvailable            
      }
      await categoryCollection.findByIdAndUpdate({_id:req.body._id},{  $set: {
              categoryName:req.body.categoryName,
              description:req.body.description,
              isAvailable:req.body.isAvailable  
      }})
      res.redirect('/admin/category')
  } catch (error) {
      console.log(error)  
  }
}

const orderList = async (req, res) => {
  try {
      const admin = req.session.admin;
      const orderList = await orderCollection.find();
      const user = orderList.map(item => item.userId);
      
      const userData = await userCollection.find({ _id: { $in: user } });
      const ordersWithData = orderList.map(order => {
          const user = userData.find(user => user._id.toString() === order.userId.toString());
          return {
              ...order.toObject(),
              user: user
          };
      });
      const ordersWithDataSorted = ordersWithData.sort((a, b) => b.createdAt - a.createdAt);
      res.render('admin/orderManagement', { admin, orderList: ordersWithDataSorted })
      // console.log(ordersWithDataSorted);
  } catch (error) {
      console.log(error)
  }
}

const changeorderstatus = async (req, res) => {
    try {
        const id = req.query.id
        console.log(req.body);
        await orderCollection.findByIdAndUpdate({ _id: id }, {
            $set: {
                status: req.body.status
            }
        })

        const orders = await orderCollection.find({ _id: id })
        res.render('admin/orderDetails', { title: "Order management", admin: req.session.admin, message: "", orders })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const changedate = async (req, res) => {
    try {
        const id = req.query.id
        console.log(req.body);
        await orderCollection.findByIdAndUpdate({ _id: id }, {
            $set: {
                expectedDelivery: req.body.deliverydate
            }
        })
        const orders = await orderCollection.find({ _id: id })
        res.render('admin/orderDetails', { title: "Order management", admin: req.session.admin, message: "", orders })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const orderDetails = async (req, res) => {
    try {
        console.log("hai");
        const admin = req.session.admin;
        console.log("id>>", req.params.id);
        const orderId = req.params.id;
        const orders = await orderCollection.find({ _id: orderId });
        console.log("order>>",orders);  
        const userId = orders[0].userId;

        // let newAmount =0;
        console.log("userId>>",userId);
        const foundUser = await userCollection.findOne({_id:userId})
        const WalletBalance=foundUser.walletBalance;
        console.log("foundUser>>C",foundUser);
        const newAmount = foundUser.totalPrice;
         console.log("newAmount>>",newAmount);

        console.log("amount>>",newAmount);
        if (orders[0].status === 'Canceled') {
          foundUser.wallethistory.push({
            process: "Refund",
            amount: foundUser.totalPrice, // Use foundUser.totalPrice here
          });
          foundUser.walletBalance = WalletBalance + foundUser.totalPrice; // Use foundUser.totalPrice here
          foundUser.cart = [];
          await foundUser.save();
        }
        
        
        // for (const product of orders.products) {
        //     const realPrice = product.realPrice;
        //     console.log("Real Price:", realPrice);
        //   }
        //  const productDt=await productCollection.findOne({_id:new ObjectId(id)});
        //  console.log("<<<",productDt);
  const products =orders.map(item=>item.products)
  const  subTotal=products.map(item=>item.realPrice)
  console.log(products);  
       // console.log("subtotal<<",subTotal);
         //const userDetails=await userCollection.find()
        res.render('admin/orderDetails', { title: "Order management", admin: req.session.admin, orders,subTotal, message: "Product amount Added to the Wallet" })
    } catch (error) {
        console.log(error + "orderdetailing error")
        res.status(500).json({ error: 'Internal server error' });
    }
}

const couponList=async(req,res)=>{
    try{
        const coupons=await couponCollection.find()
        res.render('admin/coupon',{title:"", admin:req.session.admin, message:"", coupons})
    } catch(error){
        console.log(error);
        res.send(500).json({error:'Internal Server Error'})
    }
}
const addCoupon = async(req,res)=>{
    try{
        res.render('admin/couponAdding',{title:" ", admin: req.session.admin,message:""})
    } catch (error){
        res.status(500).json({error: 'Internal Server Error'})

    }
}
const addCouponPost = async(req,res)=>{
    console.log("parameters>>",req.body);
    try{
       const data = {
        couponName : req.body.couponName,
        percentage : req.body.percentage,
        minValue : req.body.minValue,
        expiryDate : req.body.expiryDate
       } 
       await couponCollection.insertMany(data)
       res.redirect('/admin/coupon')
    }catch(error){
     console.log(error)
     res.status(500).json({error:'Internal Server Error'})
    }
}
const couponRemove = async(req,res)=>{
   try {
    await couponCollection .findByIdAndDelete(req.params.id)
   res.redirect('/admin/coupon')
} catch(error){
   console.log(error)
   res.status(500).json({error: 'Internal Server Error'}) 
}
}
const offerList = async(req,res)=>{
    try{
     const offers= await offerCollection.find()
     res.render('admin/offer',{title :"",admin:req.session.admin,message : "",offers})
    }catch(error){
        console.log(error.message);
    }
}
const addOffer = async(req,res)=>{
    try{
        const category = await categoryCollection.find()

        res.render('admin/offeradding',{title:"",admin:req.session.admin,message:"",category})

    }catch(error){
        console.log(error.message);
    }
}
const addOfferpost = async(req,res)=>{
    try{
        console.log("body",req.body.offerCategory);
        const categoryname = req.body.offerCategory
        const category = await categoryCollection.findOne({categoryName:categoryname})
        console.log("category",category._id);
     const data = {
        categoryOfferID : uuidv4(),
        
        categoryID : category._id,
        offerTitle : req.body.offerTitle,
        offerCategory : req.body.offerCategory,
        expiryDate : req.body.expiryDate,
        percentage : req.body.percentage,
        minValue : req.body.minValue,
        availability:true
     }
     await offerCollection.insertMany(data);
     res.redirect('/admin/offer')
    }catch(error){
     console.log(error.message);
    }
}
    const offerRemove = async(req,res)=>{
    try{
        console.log("req.params.id",req.params.id);
     await offerCollection.findByIdAndDelete(req.params.id)
     res.redirect('/admin/offer')
    }catch(error){
     console.log(error.message);
     res.status(500).json({error: 'Internal Server Error'}) 

    }
}
const Logout = (req,res)=>{
  try{
      req.session.destroy(function (err) {
      if(err)
      res.send("error")
      else
      res.redirect('/admin/login')
        })
      }
  catch(err){
  console.log(err);
}
}

  
module.exports ={
    loadLogin,
    verifyLogin,
    loadHomepage,
    dashboard,
    graph,
    graphcategory,
    salesReport,
    userView,
    searchUser,
    userBlocking,
    userUnBlocking,
    productView,
    addProduct,
    addProductPost,
    editProduct,
    editProductPost,
    prodUnlist,
    prodlist,
    loadSignup,
    verifysignup,
    searchProduct,
    categoryDetails,
    createCategory,
    createCategoryPost,
    listCategory,
    unlistCategory,
    editCategory,
    categoryEditPost,
    orderList,
    Logout,
    changeorderstatus,
    changedate,
    orderDetails,
    couponList,
    addCoupon,
    addCouponPost,
    couponRemove,
    offerList,
    addOffer,
    addOfferpost,
    offerRemove,
}
