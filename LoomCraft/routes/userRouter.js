var express = require('express');
var router = express.Router();


const userController = require('../controller/userController')
const profileController = require('../controller/profileController')
const userMiddleware = require('../middleware/userAuth')

/* GET home page. */
router.get('/',userController.home)
router.get('/homefilter',userController.homefilter)

router.get('/sample',userController.showSample)

router.get('/register',userController.loadRegister)

router.post('/register',userController.verifyRegister)

router.get('/login',userMiddleware.isLogout,userController.loadLoginpage)

router.post('/login',userController.verifyLoginpage)

router.get('/otp',userController.loadOtp)

router.post('/otp',userController.verifyOtp)

router.get('/logout',userMiddleware.isLogin, userController.logout)

router.get('/forGotPassword',userController.forgotPassword)
router.post('/numberValidation',userController.numberValidation)

router.get('/product-view',userController.productView)


//Cart

router.get('/cart',userMiddleware.userChecking,userMiddleware.isblocked,userController.loadCart)
router.post('/quantityUpdate/:id',userMiddleware.userChecking,userMiddleware.isblocked,userController.cartQuantityUpdate)
router.post('/addtoCart/:id',userMiddleware.userChecking,userMiddleware.isblocked,userController.addtoCart)
router.post('/cartDelete/:id',userMiddleware.userChecking,userMiddleware.isblocked,userController.deleteFromCart)

router.get('/shop',userController.shop);
router.get('/search',userMiddleware.userChecking,userMiddleware.isblocked, userController.Search);
router.post('/productFilter', userMiddleware.userChecking,userMiddleware.isblocked,userController.productFilter); 



//Whishlist
router.get('/WishList',userMiddleware.userChecking,userMiddleware.isblocked, userController.WishListLoad);
router.get('/WishList/:id',userMiddleware.userChecking,userMiddleware.isblocked, userController.WishProductDelete);
router.post('/addToWishList/:id',userMiddleware.userChecking,userMiddleware.isblocked,userController.addingWishList);
router.post('/wishlistToCart/:id', userMiddleware.userChecking,userMiddleware.isblocked,userController.addingWishListtoCart);

//Coupon
router.post('/applycoupon',userMiddleware.userChecking,userMiddleware.isblocked,userController.couponDiscount);


//Profile
router.get('/profile', userMiddleware.userChecking,userMiddleware.isblocked,profileController.profile);
router.post('/profileUpdate',userMiddleware.userChecking,userMiddleware.isblocked,profileController.profileUpdate);

    
//profile details of user
//address
router.get('/address',userMiddleware.userChecking,userMiddleware.isblocked,userController.profileAddress)
router.post('/addNewAddress',userMiddleware.userChecking,userMiddleware.isblocked,userController.newAddress)
router.post('/editAddress',userMiddleware.userChecking,userMiddleware.isblocked,userController.editAddress)
router.post('/updateAddress',userMiddleware.userChecking,userMiddleware.isblocked,userController.newAddress)
router.get('/order', userMiddleware.userChecking,userMiddleware.isblocked,userController.loadorders);
router.get('/profile/orderView',userMiddleware.userChecking,userMiddleware.isblocked,userController.orderView);
router.get('/invoice',userMiddleware.userChecking,userMiddleware.isblocked,userController.pdf)
router.post('/profile/orderStatus/:id',userMiddleware.userChecking,userMiddleware.isblocked,userController.orderStatus);
router.get('/profile/orderReturn',userMiddleware.userChecking,userMiddleware.isblocked, profileController.listReturn);
router.post('/profile/orderReturn/:id', userMiddleware.userChecking,userMiddleware.isblocked, profileController.orderReturn);

//Wallet
router.get('/wallet',userMiddleware.userChecking,userMiddleware.isblocked,userController.wallet)
router.post('/topup',userMiddleware.userChecking,userMiddleware.isblocked,userController.walletPost)
router.get('/walletHistory',userMiddleware.userChecking,userMiddleware.isblocked,userController.walletHist)

router.get('/cancelorder', userMiddleware.userChecking,userMiddleware.isblocked,userController.cancelOrder)
router.get('/returnOrder',userMiddleware.userChecking,userMiddleware.isblocked,userController.returnOrder)
//END of profile details of user





//END of profile details of user

//CHECKOUT PAGE
router.get('/checkOutPage',userMiddleware.userChecking,userMiddleware.isblocked, userController.checkout)
router.post('/AddressUpdate',userMiddleware.userChecking,userMiddleware.isblocked,userController.addressAdding)
router.post('/CheckOut',userMiddleware.userChecking,userMiddleware.isblocked,userController.orderSuccess)
router.get('/success', userMiddleware.userChecking,userMiddleware.isblocked,userController.successTick);
router.post('/savingData', userMiddleware.userChecking,userMiddleware.isblocked,userController.savingData)



// router.get('/wishList',userController.WishListLoad)

module.exports= router



