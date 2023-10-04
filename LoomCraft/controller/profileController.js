const adminCollection = require('../models/adminDetails');
const userCollection= require('../models/userDetails');
const categoryCollection = require('../models/categoryDetails');
const productCollection = require('../models/productDetails');
const orderCollection = require('../models/orders')
const multer = require('multer')
const bcrypt = require('bcrypt')

const pwdEncription = (password) => {
    const hashedPWD = bcrypt.hash(password, 10)
    return hashedPWD
  }

    const profile = async (req, res) => {
        try {
            const userInfo = await userCollection.find({ email: req.session.user });

             console.log(userInfo);
            let cart = userInfo[0].cart;
            console.log("cart");
            let cartCount = cart.length;
            const user = req.session.user;
            const FoundUser = req.session.user;
            const userData = await userCollection.findOne({ email: FoundUser });
            res.render('user/account/profile', { title: "Profile", user, userData, cartCount });
        } catch (error) {
            console.log(error)
        }

    }
    
    const profileUpdate = async (req, res) => {
        try {
            const user = req.session.user;
            const { name, email, number, password, password1, password2 } = req.body;
            const userData = await userCollection.findOne({ email: user });
    
            if (!userData) {
                return res.render('user/account/profile', {
                    title: "Profile",
                    user,
                    error: "User not found",
                });
            }
    
            if (password1 !== password2) {
                return res.render('user/account/profile', {
                    title: "Profile",
                    user,
                    userData,
                    error: "Check the password correctly",
                });
            }
    
            const isMatch = await bcrypt.compare(password, userData.password);
    
            if (isMatch) {
                const encryptedPwd = await pwdEncription(password1);
                userData.username = name;
                userData.email = email;
                userData.phone = number;
                userData.password = encryptedPwd;
                await userData.save();
    
                //req.session.email = userData.email;
                req.session.user = userData.email;
    
                let cartCount = userData.cart.length;
    
                return res.render('user/account/profile', {
                    title: "Profile",
                    user,
                    userData,
                    success: "Successfully Updated",
                    cartCount,
                });
            } else {
                return res.render('user/account/profile', {
                    title: "Profile",
                    user,
                    userData,
                    error: "Please check your current password",
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send("Internal Server Error");
        }
    };
    const listReturn = async (req, res) => {
        try {
            const user = req.session.email;
            const email = req.session.user;
            console.log("email>>>>",email);
            const userDetails = await userCollection.findOne({ email: email });
            const cart = userDetails.cart;
            console.log("cart<<<",cart);
            const cartCount = cart.length;
            const userid = userDetails._id;
            const returnProduct = await orderCollection.find({
                _id: userid,
                orderReturnRequest: true
            });
    
            console.log(returnProduct)
            res.render("user/return", {
                title: "OrderPage",
                user,
                cartCount,
                returnProduct
            })
        } catch (error) {
            console.log(error)
        }
    }
    const orderReturn = async (req, res) => {
        try {
            const id = req.params.id;
            await orderCollection.findByIdAndUpdate({ _id: id },
                {
                    $set: {
                        orderReturnRequest: true,
                        status: "Return Requested"
                    }
                });
    
            res.redirect('/profile/order');
        } catch (error) {
            console.log(error)
        }
    }
    
    

module.exports = {
   
    profile,
    profileUpdate,
    listReturn,
    orderReturn,
    
}