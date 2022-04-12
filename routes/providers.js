const auth = require("../middleware/auth");
const { addWarehouseList, editWarehouseAddressList } = require("../controllers/userController");
const {
    updateProviderProfile,
    addPhoneNumber,
    editPhoneNumber,
    deletePhoneNumber,
    getProviders,
    verifyProvider,
    getAllShops,
    getProviderByShopUrl,
    cancelProviderPayment,
    createProviderLedgers,
    deleteWarehouseAddress } = require("../controllers/providerController");
const asyncMiddleWare = require("../middleware/async");
const express = require("express");
const { checkPermission } = require("../middleware/authorization");
const router = express.Router();
const PERMISSIONS = require('../middleware/permissionString');

router.get('/', asyncMiddleWare(getProviders));
router.put('/verify/:id', [auth, checkPermission(PERMISSIONS.VERIFY_SELLERS)], asyncMiddleWare(verifyProvider));
router.put('/provider-profile/update', [auth], asyncMiddleWare(updateProviderProfile));

router.post('/provider-phone/create', [auth, checkPermission(PERMISSIONS.CREATE_SELLER_PHONE)], asyncMiddleWare(addPhoneNumber));
router.put('/provider-phone/update/:id', [auth, checkPermission(PERMISSIONS.UPDATE_SELLER_PHONE)], asyncMiddleWare(editPhoneNumber));
router.delete('/provider-phone/delete/:id', [auth, checkPermission(PERMISSIONS.DELETE_SELLER_PHONE)], asyncMiddleWare(deletePhoneNumber));

router.post('/provider-delivery-address/create', [auth, checkPermission(PERMISSIONS.CREATE_SELLER_DELIVERY_ADDRESS)], asyncMiddleWare(addWarehouseList));
router.put('/provider-delivery-address/update/:id', [auth, checkPermission(PERMISSIONS.UPDATE_SELLER_DELIVERY_ADDRESS)], asyncMiddleWare(editWarehouseAddressList));
router.delete('/provider-delivery-address/delete/:id', [auth, checkPermission(PERMISSIONS.DELETE_SELLER_DELIVERY_ADDRESS)], asyncMiddleWare(deleteWarehouseAddress));
router.get('/shops', asyncMiddleWare(getAllShops));
router.get('/shop-url/:shopUrl', asyncMiddleWare(getProviderByShopUrl));

router.put('/payment/cancel/:id', [auth, checkPermission(PERMISSIONS.CANCEL_SELLER_PAYMENT)], asyncMiddleWare(cancelProviderPayment));
router.post('/payment/create/:providerId', [auth, checkPermission(PERMISSIONS.CREATE_SELLER_PAYMENT)], asyncMiddleWare(createProviderLedgers));

module.exports = router;
