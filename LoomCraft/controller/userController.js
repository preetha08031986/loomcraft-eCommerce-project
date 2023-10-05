const categoryData = require('../models/categoryDetails')
const userCollection = require('../models/userDetails')
const productCollection = require('../models/productDetails')
const { CallPage } = require('twilio/lib/rest/api/v2010/account/call')
const orderCollection =require('../models/orders')
const couponCollection = require('../models/coupon')
const offerCollection = require('../models/offers')
//require("dotenv").config();
 const accountSID=process.env.Twilio_accountSID
 const authToken = process.env.Twilio_authToken
// const accountSID='AC707b507cb445b57943c981c34ab6bd96'
// const authToken = 'aa3b7b406ead509062a91eb259617094'
const client = require('twilio')(accountSID,authToken)
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay')
const easyinvoice = require('easyinvoice')


const pwdEncription = (password) => {
  const hashedPWD = bcrypt.hash(password, 10)
  return hashedPWD
}

const fetchProductsByCategory = async (categoryName) => {
  try {
    // Use the categoryName parameter to filter products
    //const products = await categoryData.find({ categoryName:{$eq:categoryName});
    const products = await productCollection.find({ category: { $in: categoryName } });

    console.log("products>>",products);
    return products;
  } catch (error) {
    // Handle errors appropriately
    throw error;
  }
};
const homefilter = async(req,res)=>{
  try{
    const selectedCategory = req.query.selectcategory;//req.query.category; 
    console.log("selectedCategory>>",selectedCategory);
    // Get the selected category from the query string
    const filteredProducts = await fetchProductsByCategory(selectedCategory); // Use the function to fetch products by category
     console.log("filteredProducts>>",filteredProducts);
    // Implement this function to fetch products by category
    const products = await productCollection.find().limit(20)
    const product = await productCollection.find().skip(20).limit(10)
    const Girls = await productCollection.find({availability:true})
    const Men = await productCollection.find({ category: 'Bluetooth Speaker' }, {})
    const Kids = await productCollection.find({ category: 'Smart Watch' }, {})
    const Air_Buds = await productCollection.find({ category: 'Head Phones' }, {})
    const Leather = await productCollection.find({ category:"Leather"})
    const categorydata=await categoryData.find()

    if(req.session.user){
        const useremail = req.session.user
        console.log("useremail>>>",useremail);
        const userdetials = await userCollection.findOne({email:useremail})
        const name = userdetials.name;
        const cart = userdetials.cart
        const cartCount =cart.length
        user = true;
  const categorydata=await categoryData.find()
  res.render('user/homePage', { products:filteredProducts, product,user,cartCount, Girls,Men,Kids,name,categorydata})
    } else{
        console.log('this is home else condition')
        user = false;
        res.render('user/homePage',{user, products:filteredProducts,product,Girls,Men,Kids,Leather,categorydata});
    }

    //const mobiles = await productCollection.find({ category: 'Smart Watch' }, {})
    // const headphones = await productCollection.find({category:'Head Phones'},{})
    // const smartwatche = await productCollection.find({category:'Smart Watch'},{})
    // const bluetooth = await productCollection.find({category:'Bluetooth Speaker'},{})


} catch (error) {
    console.log(error.message);
    res.status(500).send("internal error");
}
}
const home = async (req, res) => {
  try {
    
      const products = await productCollection.find().limit(20)
      const product = await productCollection.find().skip(20).limit(10)
      const Girls = await productCollection.find({availability:true})
      const categorydata=await categoryData.find()

      if(req.session.user){
          const useremail = req.session.user
          const userdetials = await userCollection.findOne({email:useremail})
          const name = userdetials.name;
          const cart = userdetials.cart
          const cartCount =cart.length
          user = true;
    const categorydata=await categoryData.find()
    res.render('user/homePage', { products, product,user,cartCount, Girls,name,categorydata})
      } else{
          console.log('this is home else condition')
          user = false;
          res.render('user/homePage',{user,products,product,Girls,categorydata});
      }

      //const mobiles = await productCollection.find({ category: 'Smart Watch' }, {})
      // const headphones = await productCollection.find({category:'Head Phones'},{})
      // const smartwatche = await productCollection.find({category:'Smart Watch'},{})
      // const bluetooth = await productCollection.find({category:'Bluetooth Speaker'},{})


  } catch (error) {
      console.log(error.message);
      res.status(500).send("internal error");
  }
}

const loadRegister=(req,res,next)=>{
    try{
        res.render('user/register',{message:""} )
    } 
    catch(err){
        console.log(err.message);
    }
}

const showSample=(req,res,next)=>{
  try{
      res.render('sample')
  } 
  catch(err){
      console.log(err.message);
  }
}

function generateReferralCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let referralCode = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters.charAt(randomIndex);
  }

  return referralCode;
}

// Generate a 6-character referral code
const referralCode = generateReferralCode(4);
console.log('Referral Code:', referralCode);


const verifyRegister= async (req,res)=>{
  try{
    const currentDate = new Date()
    const encryptPassword = await pwdEncription(req.body.password);
    const newreferralCode = "REF"+generateReferralCode(4)
    const referedCode = req.body.referralCode
    let flag=false
    
    if(!req.session.email){
      
    const checkname = await userCollection.findOne({$or : [{ username: req.body.name},{email : req.body.email}]});
    
        if(!checkname){
        const data = {
            // username: req.body.name,
            referralCode : newreferralCode,
            referedBy : referedCode,
            username: req.body.firstName+" "+req.body.lastName ,
            email: req.body.email,
            phone: req.body.phone,
            password: encryptPassword,
            created_at: currentDate
        };
        await userCollection.insertMany([data]);
        let amnt =10;
        let Amount = 50;
        if(referedCode){
         let founduser = await userCollection.findOne({email:req.body.email})
         let WalletBalance = founduser.walletBalance
         founduser.wallethistory.push({
          process: "Referral Offer",
          amount: amnt,
        });
        founduser.walletBalance=WalletBalance+amnt;
        founduser.cart = [];
        await founduser.save();

        let foundUser = await userCollection.findOne({referralCode:referedCode})
        console.log("refuser>>",foundUser);
        let newWalletBalance = foundUser.walletBalance
        foundUser.wallethistory.push({
         process: "Referral Offer",
         amount: Amount,
       });
       foundUser.walletBalance=newWalletBalance+Amount;
        
        await foundUser.save();

        }
        res.redirect('/login')
        }
      
        else{
          
        res.render('user/register', {message: " Email Id already exists"});  
        }
        }
      }
    catch(err){
        console.log(err.message);
    }
}

const logout = (req,res)=>{
    try{
      if(req.session)
        req.session.destroy(function (err) {
        if(err)
        res.send("error")
        else
       
        res.redirect('/')
          })
        }
    catch(err){
    console.log(err);
    res.redirect('/')

}
}
 let otp = [];
const loadOtp = (req,res) => {
    try{
        otp = generateOTP(6);
        sendTextMessage(otp);
        res.render('user/otp');
    }
    catch(err){
        console.log(err.message);
    }
}
  

const verifyOtp = (req,res) => {
    try{
        let {first,second,third,fourth,fifth,sixth} = req.body;
        let [first1,second1,third1,fourth1,fifth1,sixth1] = otp;
        if(first == first1 && second == second1 && third == third1 && fourth == fourth1 && fifth == fifth1 && sixth == sixth1){
            // req.session.id = req.body.mobile;
            // req.session.user = req.body.username;
            // req.session.user1 = true
        res.redirect('/');
        }
        else{
        res.render('user/otp',{message: "Otp verification failed"})
        }
    }
    catch(err){
        console.log(err.message)
    }
}


function generateOTP(length) {
    var otp = '';
    for (var i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
      
    }
    console.log(otp)
    return otp;
  }

  function sendTextMessage(otp){
    console.log(otp);
    console.log("auth",process.env.Twilio_accountSID);
    console.log("tok",process.env.Twilio_authToken);
    console.log("ph",process.env.Twilio_phonenumber);
    client.messages.create({
    body: `<#> ${otp} is your Mybuzz verification code. Enjoy shopping!`,
    to: '+919061856177', // Text your number
    from: process.env.Twilio_phonenumber//'+15392346321', // From a valid Twilio number
  })
  .then((message) => console.log(message))      
  .catch(err => console.log(err));
}


const loadHomepage = async (req,res) => {
    try{

const product=await productCollection.find()
        if(req.session.user){
        const categorydetails = await categoryData.find({});
        res.render('user/homePage',{categorydetails,product,user:req.session.user});
        }
        else{
          res.render('user/homepage',{product})
        }
    }
    catch(err){
        console.log(err.message);
    }
}

const loadLoginpage = (req,res) =>{
    try{
       res.render('user/login')
    }
    catch(err){
       console.log("err.message");
    }
}

const verifyLoginpage = async(req,res) =>{
    try{
        const check =await userCollection.findOne({email:req.body.email});
        
       
        const password=req.body.password;
        if(check.isblocked === true){
            res.render('user/login',{message : "User is blocked"})
        }
        
         if(check == null){
            res.render("user/login",{message: "Invalid Login credentials"});
        }
        
        else{
          if(check.status==false){
            if(check){
              const VPWD = await bcrypt.compare(password, check.password);
              if (VPWD) {
                req.session.user = check.email;
                res.redirect("/otp")
            }
          }
          else{
          res.render('user/login',{message:'user blocked'})
          }
          }else{
                res.render('user/login',{message:'check your email or password'})
            }
           
        }
       
    }
    catch (error){
        res.render("user/login", {message : "Invalid Email Adress"})
        }
}

const forgotPassword=async (req,res)=>{
  try {
    res.render("user/forgotPassword", { user: req.session.user ,message:" ",title:"e-Commerce" })
  } catch (error) {
    console.log(error);
  }
}
const numberValidation = async (req, res) => {
  try {
      const number = req.body.number;

      req.session.userNumber = number;
      const userExist = await userCollection.findOne({mobile: number });
      if (userExist) {
        res.redirect("/otp")
      } else {
          const msg = "Please Enter The Currect Number";
          res.render("user/forgotPassword", { user: req.session.user ,message:msg,title:"e-Commerce" })
      }
  } catch (error) {
      const msg = "Server Error Wait for the Admin Response";
      let cartCount;
      console.log("error At the number validation inreset place" + error);
      res.status(500).render("user/forgotPassword", { user: req.session.user ,message:msg,title:"e-Commerce" })
  }
}

const productView = async (req, res) => {
    try {
        // const userData = await UserModel.findOne({ email: req.session.email });
        const id = req.query.id;
        const data = await productCollection.findOne({ _id: id });
        
        res.render('user/product-view', { data ,user: req.session.user})
    } catch (error) {
        console.log("detaild page error" + error)
    }
}


const loadCart = async (req, res) => {
  try {
    const user = req.session.user
    const userEmail = req.session.user
    console.log(userEmail);
    const userDetails = await userCollection.findOne({ email: userEmail })
    const cartItems = userDetails.cart
    const cartCount = cartItems.length
    const cartProductIds = cartItems.map(item => item.productId);
    const cartProducts = await productCollection.find({ _id: { $in: cartProductIds } });
    const productsPrice = cartItems.reduce((total, item) => total + parseFloat(item.price), 0);
    const totalPrice = cartItems.reduce((total, item) => total + parseFloat(item.originalprice), 0);
    const coupon = await couponCollection.find ({},{couponName:1,percentage:1})
    
   
    const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    //let totalPrice 
    for (const item of cartItems) {
      const product = cartProducts.find(prod => prod._id.toString() === item.productId.toString());
      console.log("product",product);
      if (product) {

      } else {
        console.log(`Product not found for item: ${item.productId}`);
      }
    }
    const discount = Math.abs(totalPrice-productsPrice)
    res.render('user/cart', { title: 'e-Commerce', message: "", user: req.session.user, cartCount, cartItems, cartProducts, productsPrice, totalQuantity, totalPrice, discount,coupon})
  } catch (error) {
    console.log(error.message)
   // res.status(500).send("Internal error from cart side");
   res.render('user/login')
  }

}


  
const addtoCart=async(req,res)=>{
  
    const email=req.session.user
    const productId = req.params.id
    console.log("email<<<<<",email);
console.log("productId",productId);
    const userDtl=await userCollection.find({email:email})
    console.log("userDtl<<",userDtl);
    const productDtl= await productCollection.findOne({_id:req.params.id})
    const cartItems = userDtl[0].cart
    console.log("cartItems",cartItems);

//     const cartProductIds = cartItems.map(item => item.productId);
//     const cartProducts = await productCollection.find({ _id: { $in: cartProductIds } });
// console.log("cartProducts<<",cartProducts);
    const existingProduct = cartItems.find(prod => prod.productId.toString() === productId);
    console.log("existingProduct<<",existingProduct);
    if(existingProduct){
      res.send(JSON.stringify('Product already Exist'))
    }
    else{   
    const newCartItem={
         
          productId:req.params.id,
          quantity:1,   
          price:productDtl.price,
          originalprice:productDtl.originalprice, 
        }
        await userCollection.updateOne({email:email},{$push:{cart :newCartItem }})
        // const popupmessage="One product added to cart";
        // res.send({ message: popupmessage });
        res.send(JSON.stringify("Product Successfully Added to Your Cart"));

      } 
        
    
      
  }      
  
  // const cartQuantityUpdate = async (req, res) => {
  //   try {
  //       const cartId = req.params.id;
  //       const data = Number(req.body.quantity);
  //       const user = req.session.user;
  //       const userDetails = await userCollection.findOne({ email: user });
  
  //       const cartItems =   userDetails.cart.find(item => item._id.toString() === cartId.toString());
  //       // const CartProductIds = cartItems.map((items) => items.productId);
        
        
       
  //       const cartQuantityPre = cartItems.quantity;
  //       const CartQuantity = cartItems.quantity = data;
  //       const product = await productCollection.findById(cartItems.productId);
  //       const ProQuantity = +product.quantity;
  
  //       const count = CartQuantity - cartQuantityPre;
  //       product.quantity -= count;
  //       const cartPrice = cartItems.price = product.price * CartQuantity;
  //       cartItems.realPrice = product.price * CartQuantity;
  //       await product.save();    
  //       await userDetails.save();
  
  //       let grantTotal = userDetails.cart.reduce((total, item) => total + item.price, 0);
  //       const total = userDetails.cart.reduce((total, item) => total + item.price, 0);
        
  
  //       //const discount = grantTotal - total;
  
  //       res.json({ cartPrice, grantTotal, total, discount:0, ProQuantity });
  //   } catch (error) {
  //       console.log(error);
  //       res.status(500).json({ error: 'An error occurred while updating the quantity.' });
  //   }
  // };
  const cartQuantityUpdate = async (req, res) => {
    try {
      const cartId = req.params.id;
      console.log("cartId>>", cartId);
      const data = Number(req.body.quantity);
      //console.log("data>>", data);
      const user = req.session.user;
      const userDetails = await userCollection.findOne({ email: user });
      
      const cartItems = userDetails.cart.find(item => item._id.toString() === cartId.toString());
      const CartProductIds = cartItems.productId.toString();
      //console.log("CartProductIds>>", CartProductIds);
  
      const product = await productCollection.find({ _id: { $in: CartProductIds } });
       console.log("product>>", product);
  
      const ProQuantity = product.map(item => item.productStock-data);
      const productPrice = product.map(item => item.price);
      const originalPrice =product.map(item => item.originalprice)
      console.log("ProQuantity>>", ProQuantity[0]);
      const cartQuantityPre = data
      const CartQuantity = ProQuantity[0]
      const count = CartQuantity - cartQuantityPre;
      if (product.quantity >= count) {
        product.quantity -= count;
        await product.save();
      }
      const cartPrice = productPrice[0] * cartQuantityPre;
      const orglPrice = originalPrice[0] * cartQuantityPre
      cartItems.price = cartPrice
      cartItems.originalprice = orglPrice
      cartItems.quantity = data

      await userDetails.save();
      let grantTotal = userDetails.cart.reduce((total, item) => total + item.originalprice, 0);
      console.log("grantTotal",grantTotal);
      const total = userDetails.cart.reduce((total, item) => total + item.price, 0);
    console.log("total>>",total)
      
      const discount = grantTotal - total;
  
      res.json({ cartPrice, grantTotal, total, discount, orglPrice,ProQuantity });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'An error occurred while updating the quantity.' });
    }
  };
  const deleteFromCart=async(req,res)=>{
  try {
    const user=req.session.user
    const id=req.params.id
    const cartProduct=await userCollection.updateOne({email:user},{$pull:{cart:{_id:id}}})
    res.redirect('/cart')
  } catch (error) {
    console.log(error)
  }  
  }

//   const shop=async (req, res, next)=> {
//     const products=await productCollection.find()
    
//     res.render('./user/shop', { title: 'e-Commerce',message:"ADMIN LOGIN PAGE" ,products,user: req.session.user});
//   };
// const signup=(req, res, next)=> {   
//     res.render('./user/register', { title: 'e-Commerce', message:"",user: req.session.user });
//   };    
const shop = async (req, res) => {
  try {

      const currentPage = parseInt(req.query.page) || 1;
      const itemsPerPage = 15;
      const totalProduct = await productCollection.find();
      const totalPages = Math.ceil(totalProduct.length / itemsPerPage);
      const skip = (currentPage - 1) * itemsPerPage;
      const product = await productCollection.find({ availability: true }).skip(skip).limit(itemsPerPage);

      const userDetails = await userCollection.findOne({ email: req.session.user });
      const category = await categoryData.find();
      let cartCount, cart;
      
        cart = userDetails.cart;
        cartCount = cart.length;
      
      console.log("cart",cart);
      res.render('user/shop', { title: "Shop", user: req.session.user, cartCount, product, category, totalPages, currentPage });
  } catch (error) {
      console.log(error);
      res.status(500).send("Internal server Error On ShopView");
    }
}

  //Whishlist

  const   WishListLoad = async (req, res) => {
    try {
      
        // const user = req.session.user;
        const email = req.session.user;
        console.log(email);
      
        const userDetails = await userCollection.findOne({ email:email });
        const productData = userDetails.wishlist;
        console.log("productData>>",productData);
        const cart = userDetails.cart;
        const cartCount = cart.length;
        const productId = productData.map(items => items.productId);
        const productDetails = await productCollection.find({ _id: { $in: productId } });
        res.render('user/wishList',{title:"Wishlist",productDetails,cart,cartCount})
    } catch (error) {
        console.log(error)
        res.redirect("/login")

    }
}
const addingWishList = async (req, res) => {
  try {
    console.log("hai")
      const productId = req.params.id;
      console.log(productId);
      const useremail = req.session.user;
      const userDetails = await userCollection.findOne({email:useremail});
console.log(userDetails);
      const productExist = userDetails.wishlist.map(items => items.productId.toString() === productId);


      if (productExist.includes(true)) {
          return res.json("Already Exist");
      } else {
          const WishList = {
              productId: productId
          }
          userDetails.wishlist.push(WishList);
          await userDetails.save();
          return res.json('server got this....');
      }
  } catch (error) {
      console.log(error);
  }
}
const addingWishListtoCart = async (req, res) => {
  try {
      const id = req.params.id;
      
      console.log("id>>",id);
      const userEmail = req.session.user;
      const userData = await userCollection.findOne({ email: userEmail });
      console.log("userData>>",userData);
      const cartItems = userData.cart;
      const existingCartItem = cartItems.find(item => item.productId.toString() === id);
      const cartPrtoduct = await productCollection.findOne({ _id: id });
      const productPrice = cartPrtoduct.price;

      if (existingCartItem) {
          existingCartItem.quantity += 1;
          existingCartItem.price = existingCartItem.quantity * productPrice;
      } else {
          const newCartItem = {
              productId: id,
              quantity: 1,
              price: cartPrtoduct.price,
              originalprice: cartPrtoduct.originalprice
          };
          userData.cart.push(newCartItem);
      }

      await userData.save();
      // res.json("successfully cart  product")
      res.redirect('/cart')
  } catch (error) {
      console.log('Error adding to cart:', error);
  }
};
const WishProductDelete = async (req, res) => {
  try {
      const productId = req.params.id;
      const userEmail = req.session.email;
      await userCollection.findOneAndUpdate(
          { email: userEmail },
          { $pull: { wishlist: { productId: productId } } }
      );
      res.redirect("/wishList");
  } catch (error) {
      console.log("wish deleting Error" + error)
  }
}
  const checkout= async(req,res)=>{
    try {
      console.log("req.body",req.body);
      const user=req.session.user
      const userEmail=req.session.user
      const userDetails=await userCollection.findOne({email:userEmail})
      
      
      const cartItems=userDetails.cart
      const cartCount=cartItems.length
      
      const userAdress=userDetails.address
      const currentUserID = userDetails._id;
      const cartProductIds = cartItems.map(item => item.productId.toString());
      const cartProducts = await productCollection.find({ _id: { $in: cartProductIds } });
      console.log("cartproducts>>>",cartProducts);
      // const categorySelected = cartProducts.category
      const uniqueCategories = new Set();

// Iterate through the categoryproducts array and add each category to the Set
cartProducts.forEach(product => {
  uniqueCategories.add(product.category);
});

// Convert the Set back to an array if needed
const uniqueCategoriesArray = Array.from(uniqueCategories);

console.log("categorySelected",uniqueCategoriesArray);
const offer = await offerCollection.find({offerCategory: { $in: uniqueCategoriesArray }})
      console.log("offer",offer);
     // console.log("categorySelected",categorySelected);
      const totalP_Price = cartProducts.reduce((total, items) => total + parseFloat(items.originalprice), 0);
      // let totalPrice = 0;
      const totalPrice = cartItems.reduce((total, items) => total + parseFloat(items.price), 0);
      const coupon = await couponCollection.find ({},{couponName:1,percentage:1})
    //   let grantTotal = userDetails.cart.reduce((total, item) => total + item.originalprice, 0);
      // const total = userDetails.cart.reduce((total, item) => total + item.price, 0);
    // console.log(grantTotal)
  
    //   const discount = grantTotal - total;
    // cartItems.map(item => totalP_Price += item.originalprice);

    //   cartItems.map(item => totalPrice += item.price);

      // console.log('this is values',totalP_Price,totalPrice);
  
      const discount = Math.abs(totalP_Price - totalPrice)
      console.log(discount);
      res.render('user/account/billing',{title: 'e-Commerce' ,message:"Login Page",user:req.session.user,cartItems,
      userAdress,cartProducts,discount, totalP_Price, totalPrice,cartCount,coupon,offer})
    } catch (error) {
      console.log(error)
    }
  }

  const addressAdding=async(req,res)=>{
    try {
      
      const email = req.session.user;
      
      const { name, houseName, street, city, state, phone, postalCode } = req.body;

  
      const userData = await userCollection.findOne({ email: email });
    
      if (!userData) {
          return console.log("User not found")
      }
    const newAddress = {
      name: name,
      houseName: houseName,
      street: street,
      city: city,
      state: state,
      phone: phone,
      postalCode: postalCode
  };
  userData.address.push(newAddress);
  await userData.save();
  res.redirect('/checkOutPage');
  } catch (error) {
  console.log(error);
  res.status(500).send("Internal server error");
  }
  }

  const couponDiscount = async(req,res) => {
    try{
      console.log("hai i am couponDiscount ");
      const user=req.session.user;
      const coupon =req.body.coupon
      const couponDetails = await couponCollection.find({couponName:coupon})
      console.log("couponDetails",couponDetails);
      const userDetails = await userCollection.findOne({email:user})
      console.log("userDetails",userDetails);
      const coupon_per =couponDetails[0].percentage;
      const minValue =couponDetails[0].minValue;
      console.log("minValue",minValue)
      const cartDetails=userDetails.cart
      console.log("cartDetails",cartDetails)
      let totalPrice=0;
      if (Array.isArray(cartDetails) && cartDetails.length > 0) {
        // Iterate through the cart items
        cartDetails.forEach((cartItem) => {
          totalPrice+=cartItem.price
          console.log(`Product ID: ${cartItem.productId}, Quantity: ${cartItem.quantity}`);
        });
      }
      userDetails.totalPrice=totalPrice - Math.floor(totalPrice*(coupon_per/100))
      
  
      // const data ={
      //   totalPrice : totalPrice,
      // }
      // await userDetails.updateOne({ $set: data });
      //       // userDetails.totalPrice = totalPrice;
      await userDetails.save();
      console.log("totalPrice",totalPrice)
      // const cartProducts = await productCollection.find({ _id: { $in: cartProductIds } });
      // const price = cartProducts.price;
      if(totalPrice>minValue){
      const disc = Math.abs(totalPrice*(coupon_per/100))
      
      console.log("disc>>",disc);
      res.json({
        success: true,
        discountAmount: parseInt(disc),
        message: 'Coupon applied.',

        cartItems: userDetails.cart, // Send the updated cart items
      });
    } else {
      // Coupon not found or doesn't meet the criteria
      res.json({
        success: false,
        discountAmount: 0,
        message: 'Coupon not valid.',
        cartItems: userDetails.cart, // Send the current cart items (unchanged)
      });
      }
      
    }catch(error){
      console.log(error)
    }
  }

 

  const orderSuccess = async (req, res) => {
    console.log("hai i am orderSuccess");
    console.log("total==", req.body.totalAmt);
    console.log("discount==", req.body.discount);
    try {
      const currentDate = new Date();
      const data = req.body;
      const email = req.session.user;
      const foundUser = await userCollection.findOne({ email: email });
      const userDetails = await userCollection.findOne({email:email});
      const walletBalance =userDetails.walletBalance
      const cartItems = foundUser.cart;
      const cartProductIds = cartItems.map(item => item.productId.toString());
      const cartProducts = await productCollection.find({ _id: { $in: cartProductIds } });
      const userId = foundUser._id;
      const addressId = data.selectedAddress;
      const method = data.method;
      let amount = data.amount;
      let couponAddAmount=foundUser.totalPrice
      console.log("couponAddAmount",couponAddAmount)
      if (couponAddAmount>0)
      {
        amount=couponAddAmount
      }
      // Check if all cart items have a valid quantity before creating the order
      const hasInvalidQuantity = cartItems.some(item => typeof item.quantity !== 'number' || item.quantity < 1);
  
      if (hasInvalidQuantity) {
        return res.status(400).json({ error: 'Invalid quantity in cart items' });
      }
  
      // Data collecting for db Storing
      const productData = cartProducts.map(product => {
        const cartItem = cartItems.find(item => item.productId.toString() === product._id.toString());
        const quantity = cartItem ? cartItem.quantity : 0;
        console.log("product qty", quantity);
        return {
          productId: product._id,
          p_name: product.p_name,
          realPrice: product.originalprice,
          price: amount,
          description: product.description,
          images: product.images,
          category: product.category,
          quantity: quantity
        };
      });
      console.log("prod adata",productData);
      const deliveryDate = new Date();
      deliveryDate.setDate(currentDate.getDate() + 5);
  
      // Create and save the new order
      newOrder = new orderCollection({
        userId: userId,
        address: addressId,
        products: productData,
        payment: {
          method: method,
          amount: amount
        },
        Totalprice: req.body.totalAmt,
        Discountprice: req.body.discount,
        status: "Processing",
        createdAt: currentDate,
        expectedDelivery: deliveryDate
      });
  
      if (method === "COD") {
        await newOrder.save();
  
        // Update product stock and clear the user's cart
        for (let values of cartItems) {
          for (let products of cartProducts) {
            if (String(values.productId) === String(products._id)) {
              products.productStock = products.productStock - values.quantity;
              await products.save();
            }
          }
        }
  
        foundUser.cart = [];
        await foundUser.save();
  
        console.log("foundUser>>", foundUser);
        res.json({success:true,method:"COD",msg:"Successfully placed the order"});
      } else if (method === "InternetBanking") {
        var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET_KEY })
        var order = await instance.orders.create({
          amount: amount * 100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: "order_rcptid_11"
        });
  
        const responseJSON = {
          method:'Online Payment',
          success: true,
          msg: 'Order Created',
          order_id: order.id,
          amount: amount,
          key_Id: process.env.RAZORPAY_KEY_ID,
          productName: productData.map(item => item.p_name),
          description: productData.map(item => item.description),
          contact: '9061856177',
          email: 'preethasurej20@gmail.com',
          name: "Preetha S",
          order: newOrder, // Include the newOrder object here
        };
        res.status(200).json(responseJSON);

      }
      else if(method === "wallet"){
        if(walletBalance>=amount){
        await newOrder.save()

         // Update product stock and clear the user's cart
         for (let values of cartItems) {
          for (let products of cartProducts) {
            if (String(values.productId) === String(products._id)) {
              products.productStock = products.productStock - values.quantity;
              await products.save();
            }
          }
        }
        foundUser.wallethistory.push({
          process: "Payment",
          amount: amount,
        });
       foundUser.walletBalance=walletBalance-amount;
    
        foundUser.cart = [];
        await foundUser.save();
        console.log("foundUser>>", foundUser);

        res.json({success:true,method:"wallet",msg:"Successfully placed the order"});
      }else{
       
        res.send(JSON.stringify({success:true,method:"topupwallet",msg:'Not enough Balance in Wallet'}))
      }
      } else {
        res.status(400).send("Individual payment");
      }
    } catch (error) {
      console.log('Error:', error);
      res.status(500).send('An error occurred while processing the order');
    }
  }
  const savingData = async (req, res) => {
    try {
      console.log("hai razpay")
      await newOrder.save();
      const email = req.session.user;
      const userData = await userCollection.findOne({ email: email });
      const cartItems = userData.cart;
      const cartProductIds = cartItems.map(item => item.productId.toString());
      const cartProducts = await productCollection.find({ _id: { $in: cartProductIds } });
  
      for (let values of cartItems) {
        for (let product of cartProducts) {
          if (String(values.productId).trim() === String(product._id).trim()) {
            product.productStock -= values.quantity;
            await product.save();
          }
        }
      }
  
      userData.cart = [];
      await userData.save();
      res.json({msg:"data is saved",success:true})
    } catch (error) {
      console.log(error);
      res.status(500).send('An error occurred while saving the order and updating product quantities');
    }
  };
  // razerpay implementation end  
  

   const successTick=(req,res)=>
{
  cartCount=0
  res.render('user/successTick', { title: "Account", succ: "Success.....", user: req.session.user, cartCount })
}
//profile controll       
const profileAddress=async(req,res)=>{   
try {
  const user=req.session.user
  const userEmail=req.session.user
  const userDetails=await userCollection.findOne({email:userEmail})
  const cart=userDetails.cart
  const cartCount=cart.length
  const userAdress=userDetails.address
  res.render('user/account/address',{title: 'e-Commerce' ,message:"",user,cartCount:cartCount,userAdress})
} catch (error) {
  console.log(error)
}
}
//ORDER HISTORY
const loadorders = async (req, res) => {
  try {
    const user = req.session.user
    const userDtl = await userCollection.findOne({ email: req.session.user }, { cart: 1 });
    if (userDtl) {
      const pageNum = parseInt(req.query.page) || 1
      const perpage = 1
      const user_Id = userDtl._id.toString()
      //console.log(user_Id)
      const orderOfUser = await orderCollection.find({ userId: user_Id }).sort({ createdAt: -1 }).skip((pageNum - 1) * perpage).limit(perpage);;
      const cartData = userDtl.cart;
      let cartcount = cartData.length;
      // console.log('orderOfUser>>', orderOfUser);
      res.render('user/orderdetails', { title: 'e-Commerce', message: "", user: req.session.user, orders: orderOfUser, cartcount });
    }
  }
  catch (err) {
    console.log(err);
  }
}


const orderView = async (req, res) => {
  try {
      const user = req.session.user;
      const userDetails = await userCollection.findOne({ email: req.session.email });
      const cart = userDetails.cart;
      const cartCount = cart.length;
      const orderId = req.query.id;
      const order = await orderCollection.find({ _id: orderId });;
      const orderProducts = order.map(items => items.proCartDetail).flat();
      const cartProducts = order.map(items => items.cartProduct).flat();
      for (let i = 0; i < orderProducts.length; i++) {
          const orderProductId = orderProducts[i]._id;
          const matchingCartProduct = cartProducts.find(cartProduct => cartProduct.productId.toString() === orderProductId.toString());

          if (matchingCartProduct) {
              orderProducts[i].cartProduct = matchingCartProduct;
          }
      }
      const address = userDetails.address.find(items => items._id.toString() == order.map(items => items.address).toString());
      const subTotal = cartProducts.reduce((totals, items) => totals + items.realPrice, 0);
      const [orderCanceld] = order.map(item => item.orderCancleRequest);
      const orderStatus = order.map(item => item.status);
      res.render("user/account/orderStatus", { title: "Product view", user, cartCount, order, orderProducts, subTotal, address, orderCanceld, orderStatus })
  } catch (error) {
      console.log(error)
  }
}
const orderStatus = async (req, res) => {
  try {
      const user = req.session.user;
      const email=req.session.user
      const userDetails = await userCollection.findOne({ email:email });
      const cart = userDetails.cart;
      const cartCount = cart.length;
      const orderId = req.params.id;
      const order = await orderCollection.find({ _id: orderId });
      const orderProducts = order.map(items => items.proCartDetail).flat();
      const cartProducts = order.map(items => items.cartProduct).flat();
      for (let i = 0; i < orderProducts.length; i++) {
          const orderProductId = order.map(items=>items._id).toString;
           const matchingCartProduct = cartProducts.find(cartProduct => cartProduct.productId.toString() === orderProductId.toString());

          if (matchingCartProduct) {
              orderProducts[i].cartProduct = matchingCartProduct;
          }
      }
      const address = userDetails.address.find(items => items._id.toString() == order.map(items => items.address).toString());
      const subTotal = cartProducts.reduce((totals, items) => totals + items.realPrice, 0);
      const [orderCanceld] = order.map(item => item.orderCancleRequest);
      const orderStatus = order.map(item => item.status);
      res.render("user/account/orderStatus", { title: "Product view", user, cartCount, order, orderProducts, subTotal, address, orderCanceld, orderStatus,userDetails })
  } catch (error) {
      console.log(error)
  }
}

const cancelOrder = async(req,res) => {
  try{
  const productName = req.query.p_name;
  const user = req.session.user;
  const foundUser=await userCollection.findOne({email:user})
  console.log("productName>>>",productName);
  const orderId = req.query.order_id
  console.log("orderId11<<",orderId);
  const amount =foundUser.totalPrice;
  const walletBalance = foundUser.walletBalance;
  const order = await orderCollection.updateOne(
    {
      _id: orderId,
      products: { $elemMatch: { p_name: productName } }
    },
    {
      $set: {
        'products.$.productStatus': false,
        orderCancleRequest: true
         
      }
    }
  );

  foundUser.wallethistory.push({
    process: "Refund",
    amount: amount,
  });
 foundUser.walletBalance=walletBalance+amount;

  foundUser.cart = [];
  await foundUser.save();
  console.log('Update result:', order)
  res.redirect('/order')
  }
  catch(err)
  {
    console.log(err)
  }
}
const generateInvoice = async (order,   products ,address,price) => {
  try {
    const invoiceOptions = {
      documentTitle: 'Invoice',
      currency: 'INR',
      taxNotation: 'GST',
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      images: {
        logo: '',
      },
      sender: {
        company: 'Tech Shop',
        address: 'Thiruvananthapuram',
        zip: '695006',
        city: 'Trivandrum',
        country: 'Kerala',
        phone: '9061856177',
      },
      client: {
        company: address.name,
        address: address.houseName,
        zip: address.street,
        city: address.city,
        country: address.phone,
        phone: address.postalCode
      },
      information: {
        number: order.map(item => item._id),
        date: order.map(item => item.createdAt.toLocaleDateString()),
        'due-date': order.map(item => item.expectedDelivery.toLocaleDateString())
      },
      products: [],

      bottomNotice: 'Discount: $10',
      subtotal: 185,
      total: 175,
    };
    
    products.forEach((data) => {
      if (data.productStatus) {
      invoiceOptions.products.push({
        quantity: data.quantity,
        description: data.p_name,
        'tax-rate': 0,
        price: price,
      });
    }
    });
    const result = await easyinvoice.createInvoice(invoiceOptions);
    const pdfBuffer = Buffer.from(result.pdf, 'base64');

    return pdfBuffer;
  } catch (error) {
    console.log('Error generating invoice:', error);
    throw error;
  }
};

const pdf = async(req,res) => {
  try{
    const orderId = req.query.id;
    const userDetails = await userCollection.findOne({email:req.session.user});
    const price = userDetails.totalPrice
    const order = await orderCollection.find({_id:orderId})
    const products = order.map(items => items.products).flat();
    const address = userDetails.address.find(items => items._id.toString() == order.map(items => items.address).toString());
    const invoiceBuffer = await generateInvoice(order,  products, address,price);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.send(invoiceBuffer);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};
 
const addToWallet = async(req,res)=>{
  try{
    console.log("Hai i am addToWallet");
    const user=req.session.user;
    const foundUser = await userCollection.findOne({email:user})
    const walletBalance=foundUser.walletBalance;
    const amount=foundUser.totalPrice;
    foundUser.wallethistory.push({
      process: "Refund",
      amount: amount,
    });
   

    foundUser.cart = [];
    await foundUser.save();
  }catch(error){
    console.log(error);
  }
}

const returnOrder = async(req,res) =>{
  try{
  productName = req.query.p_name;
  console.log("productName>>>>>>",productName);
  console.log("Request Query Parameters:", req.query);

  const orderId = req.query.order_id
  const productId = req.query.product_id;
  console.log("orderId<<",orderId);
  const order = await orderCollection.updateOne(
    {
      _id:orderId ,
      products: { $elemMatch: { p_name: productName } }
    },
    {
      $set: {
        'products.$.productStatus': false,
        orderReturnRequest: true,
         status: "Delivered"
      }
    }
    );
    // res.redirect('/order')
  } catch (error) {
    console.log(error)
    res.status(500).send('An error occurred while saving the order and updating');
  }

}

  const newAddress=async(req,res)=>{
  try {
    const email = req.session.user;
    const { name, houseName, street, city, state, phone, postalCode, AddressId } = req.body;
    const userData = await userCollection.findOne({ email: email });
    const exisitingAddress = userData.address.find((data) => data._id.toString() === req.body.AddressId);

    if (exisitingAddress) {
        exisitingAddress.name = name;
        exisitingAddress.houseName = houseName;
        exisitingAddress.street = street;
        exisitingAddress.city = city;
        exisitingAddress.state = state;
        exisitingAddress.phone = phone;
        exisitingAddress.postalCode = postalCode;
    } else {
        const newAddress = {
            name: name,
            houseName: houseName,
            street: street,
            city: city,
            state: state,
            phone: phone,
            postalCode: postalCode
        };
        userData.address.push(newAddress);
    }
    await userData.save();
    res.redirect('/address');
  //   const user=req.session.user
  //   const data={
  //     name:req.body.name,
  //     houseName:req.body.houseName,
  //     street:req.body.street,
  //     city:req.body.city,
  //     state:req.body.state,
  //     phone:req.body.phone,
  //     postalCode:req.body.postalCode
  //   }
  // const update=await usersModel.updateOne({email:user},{$push:{address :data }})
  // const userDetails=await usersModel.findOne({email:user})
  
  // const cart=userDetails.cart
  // const cartCount=0//cart.length
  // const userAdress=userDetails.address
  // res.render('user/account/address',{title: 'e-Commerce' ,message:"",user,cartCount:cartCount,userAdress})
  } catch (error) {
    console.log(error)
  }
}

const editAddress=async(req,res)=>{   
  try {
        const user = req.session.user;
        const addressId = req.body.selectedAddress;
        const userDetails = await userCollection.findOne({ email: user });
        const cart = userDetails.cart;
        const cartCount = cart.length;
        const address = userDetails.address;
      
        const selectedAddress = address.find((data) => data._id.toString() === addressId);
      res.render('user/account/editAddress', { user, title: "Edit Address", selectedAddress, cartCount })
    
  } catch (error) {
    console.log(error);
  }
}

//ends profile controll
// const loadLoginpage=async(req,res,next)=>{

//     res.render('./user/login',{ title: 'e-Commerce' ,message:"Login Page",user:true});
//   }

// const logout=async(req,res)=>{
//   try{
//     req.session.user = null;
//     res.render('./user/login',{ title: 'e-Commerce' ,message:"Login Page",user:req.session.user});
//   }
//   catch(err){
//     console.log(err);
//   }
// }

const wallet = async (req,res)=>{
  try{
    if(req.session.user){
     const user = req.session.user;
     const userDetails = await userCollection.findOne({email:user});
     const walletBalance =userDetails.walletBalance
     console.log("walletBalance>>>",walletBalance);
      res.render('user/account/wallet',{user,title:"Wallet Balance",walletBalance})
  }
}catch(error){
      console.log(error);
  }
}

const walletPost = async (req,res) => {
  try{
    const user = req.session.user;
     const userDetails = await userCollection.findOne({email:user});
     console.log("userDetails",userDetails)
     const topupAmount=req.body.topUpAmount
     let newWalletBalance =userDetails.walletBalance
     newWalletBalance += Number(topupAmount)
     console.log("newWalletBalance>>",newWalletBalance);

     if (!userDetails.wallethistory) {
      userDetails.wallethistory = [];
    }
    userDetails.walletBalance=newWalletBalance
    userDetails.wallethistory.push({
      process: "TopUp",
      amount: topupAmount,
    });
    await userDetails.save();


    // Update the user's document in the database
    // await userDetails.updateOne(
    //   { email: user },
    //   { $set: { walletBalance: newWalletBalance } }
    // );
  //   await userDetails.updateOne(
  //     {email:user},
  //     {$set:{walletBalance:newWalletBalance}}
      
  //    );
     
     
  //    await userDetails.wallethistory.push({
  //     process : "topup",
  //     amount: newWalletBalance
  // })
    
     res.redirect('/wallet')
  }catch(error){
    console.log(error);
  }
}
const walletHist = async (req,res) =>{
  try{
    const user = req.session.user
    const userDetails = await userCollection.findOne({email:user})
    console.log("userDetails>>>",userDetails);
    const newWalletHisory = userDetails.wallethistory;
    
    
    
    
    res.render('user/account/walletHistory',{title:"walletHistory",userDetails:newWalletHisory})
  }catch(error){
    console.log(error);
  }
}
const productFilter = async (req, res) => {
  try {
    const sortFilter = req.body.sortOption
    console.log("sortFilter>>", sortFilter);
    const itemsPerPage = parseInt(req.body.itemsPerPage) || 10;
    const page = parseInt(req.body.page) || 1;
    const categoryName = JSON.parse(req.body.categoryName);
    console.log("categoryName>>", categoryName);
    const perpage = 15
    //price sorting
    let sortDirection = 1; // Default ascending
    if (sortFilter === 'heighToLow') {
      sortDirection = -1; // Descending
    }

    const productByCata = await productCollection.find({ availability: true, category: { $in: categoryName } }).sort({ price: sortDirection })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    const totalPages = Math.ceil(productByCata.length / perpage);
    const currentPage = page;

    const paginationData = { currentPage, totalPages };
    console.log("paginationHTML>>", paginationData);
    res.json({
      productByCata: productByCata,
      paginationHTML: paginationData
    });

  } catch (error) {
    console.log(error);
    res.json("no data found")
  }
}
//searchFilter
const Search = async (req, res) => {
  try {
    const key = req.query.q;
    const searchPattern = { $regex: key, $options: 'i' };
    const products = await productCollection.find({ p_name: searchPattern }).exec();
    console.log('products>>',products)
    res.json(products);
  } catch (err) {
    console.log(`Error while performing search: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

  
  


module.exports = {
    homefilter,
    home,
    showSample,
    loadRegister,
    verifyRegister,
    
    loadHomepage,
    loadLoginpage,
    verifyLoginpage,
   
    loadOtp,
    verifyOtp,
    logout,
    forgotPassword,
    numberValidation,
   productView,
   loadCart,
   addtoCart,
   cartQuantityUpdate,
   deleteFromCart,
   WishListLoad,
   WishProductDelete,
   addingWishList,
   addingWishListtoCart,
   checkout,
   addressAdding,
   couponDiscount,
   orderSuccess,
   savingData,
   successTick,
   profileAddress,
   wallet,
   walletPost,
   walletHist,
   loadorders,
   orderView,
   orderStatus,
  cancelOrder,
  pdf,
  addToWallet,
  returnOrder,
   newAddress,
   editAddress,
   shop,
   productFilter,
   Search,


    
}