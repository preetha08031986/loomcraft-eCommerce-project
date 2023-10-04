var express = require('express');
var router = express();
const multer = require('multer')
const adminMiddleware = require('../middleware/adminAuth')





const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'productImages'); // Destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    //return cb(null, `${Date.now()}-${file.originalname}`);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename for each uploaded image
  }
});

const upload = multer({storage: storage});


const adminController = require("../controller/adminController")

const Adminauth = require("../middleware/adminAuth")



/* GET users listing. */
router.get('/login',adminMiddleware.isLogout,adminController.loadLogin);

router.post('/login',adminController.verifyLogin);

router.get('/homepage', adminController.loadHomepage)


router.get('/signup',adminController.loadSignup);

router.post('/signup',adminController.verifysignup);
//dashboard

router.get('/dashboard',adminMiddleware.adminChecking,adminController.dashboard)
router.post('/dashboard/graph',adminMiddleware.adminChecking,adminController.graph)  
router.post('/dashboard/graphcategory',adminMiddleware.adminChecking,adminController.graphcategory)
router.get('/dashboard/salesReport',adminMiddleware.adminChecking,adminController.salesReport)
/** USER MANAGEMENT*/  
router.get('/userView',adminMiddleware.adminChecking,adminController.userView)
router.post('/userBlocking/:id', adminMiddleware.adminChecking,adminController.userBlocking);
router.post('/userUnBlocking/:id', adminMiddleware.adminChecking,adminController.userUnBlocking);
router.get('/searchuser', adminMiddleware.adminChecking,adminController.searchUser);

// /**/PRODUCT MANAGEMENT *//
router.get('/productView',adminMiddleware.adminChecking,adminController.productView)  
router.get('/productAdding',adminMiddleware.adminChecking,adminController.addProduct)
router.post('/productAdding', upload.array('images'),adminMiddleware.adminChecking,adminController.addProductPost)   
router.get('/productEdit/:id',adminMiddleware.adminChecking,adminController.editProduct)
router.post('/productEdit',upload.array('image'),adminMiddleware.adminChecking,adminController.editProductPost)  
router.post('/p_unlist/:id',adminMiddleware.adminChecking,adminController.prodUnlist) 
router.post('/p_list/:id',adminMiddleware.adminChecking,adminController.prodlist) 

router.get('/search', adminMiddleware.adminChecking,adminController.searchProduct);

/**CATEGORY MANAGEMENT */ 
router.get('/category',adminMiddleware.adminChecking,adminController.categoryDetails)
router.get('/createCategory',adminMiddleware.adminChecking,adminController.createCategory)  
router.post('/createCategory',adminMiddleware.adminChecking,adminController.createCategoryPost)
router.post('/unlistCategory/:id',adminMiddleware.adminChecking,adminController.unlistCategory)
router.get('/categoryEdit/:id',adminMiddleware.adminChecking,adminController.editCategory)  
router.post('/listCategory/:id',adminMiddleware.adminChecking,adminController.listCategory)
router.post('/categoryEdit',adminMiddleware.adminChecking,adminController.categoryEditPost)    

//router.post('/csearch', adminController.searchCategory);

router.get('/order',adminMiddleware.adminChecking,adminController.orderList)
router.post('/changeorderstatus',adminMiddleware.adminChecking,adminController.changeorderstatus)
router.post('/changeDeliverydate',adminMiddleware.adminChecking,adminController.changedate)

router.get('/details/:id',adminMiddleware.adminChecking,adminMiddleware.adminChecking,adminController.orderDetails);

router.get('/logout',adminMiddleware.isLogin,adminController.Logout)

//Coupon Management

router.get('/coupon',adminMiddleware.adminChecking,adminController.couponList)
router.get('/couponAdding',adminMiddleware.adminChecking,adminController.addCoupon)
router.post('/couponAdding',adminMiddleware.adminChecking,adminController.addCouponPost)
router.post('/couponDelete/:id',adminMiddleware.adminChecking,adminController.couponRemove)


//Offers
router.get('/offer',adminMiddleware.adminChecking,adminController.offerList)
router.get('/offeradding',adminMiddleware.adminChecking,adminController.addOffer)
router.post('/offeradding',adminMiddleware.adminChecking,adminController.addOfferpost)
router.post('/offerDelete/:id',adminMiddleware.adminChecking,adminController.offerRemove)

module.exports = router;
