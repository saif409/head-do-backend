const auth = require("../middleware/auth");
const { updatePassword, addOrRemoveFavoriteHairstyleForCustomer, addOrRemoveFavoriteBeardAndMustacheForCustomer, getFavoriteHairStylesForCustomer, getFavoriteBeardAndMustachesForCustomer, checkRefCode, editServiceList } = require("../controllers/userController");
const {admin} = require("../middleware/authorization");
const {
    signup,
    getProfile,
    addUser,
getUserById,
deleteUser,
updateUser,
updateCustomerProfile,
getLiteProfile,
addPhoneNumber,
editPhoneNumber,
deletePhoneNumber,
getAllUsers,
changeUserPassword,
alreadyExistsPhoneNumber,
changeCustomerPassword,
mailTest,
createProviderInfo,
getAllProviderUsers,
updateProviderInfoForProvider,
addOrRemoveFavoriteProviderForCustomer,
getFavoriteProvidersForCustomer,
addPersonalPhotos,
removePersonalPhotos,
getClients,
addAddressList,
editAddressList,
deleteAddress,
getAllAddresses,
getSpecialistList,
socialMediaSignIn,
signOut,
sendNotificationToSpecificCustomer,
refUsagesHistory,
addServiceList,
deleteService,
getAllServices,
updateBankInfo,
checkRefIncome,
sendNotificationToUsers
} = require("../controllers/userController");
const asyncMiddleWare = require("../middleware/async");
const express = require("express");
const router = express.Router();
const PERMISSIONS = require('../middleware/permissionString');

router.get("", [auth, admin], asyncMiddleWare(getAllUsers));
router.get("/providers", asyncMiddleWare(getAllProviderUsers));
router.get("/profile", [auth], asyncMiddleWare(getProfile));
router.get("/lite-profile", [auth], asyncMiddleWare(getLiteProfile));

router.get("/provider/services", [auth], asyncMiddleWare(getAllServices));
router.post("/provider/service/create", [auth], asyncMiddleWare(addServiceList));
router.put("/provider/service/update/:id", [auth], asyncMiddleWare(editServiceList));
router.delete("/provider/service/delete/:id", [auth], asyncMiddleWare(deleteService));

router.post("/sign-up", asyncMiddleWare(signup));
router.post("/social-media-sign-in", asyncMiddleWare(socialMediaSignIn));

router.post('/create-provider-info', [auth], asyncMiddleWare(createProviderInfo));
router.put('/update-provider-info', [auth], asyncMiddleWare(updateProviderInfoForProvider));

router.put("/change-user-password/:userId", [auth, admin], asyncMiddleWare(changeUserPassword));
router.put('/change-customer-password',asyncMiddleWare(changeCustomerPassword));

router.put("/update-password", [auth], asyncMiddleWare(updatePassword));

router.put('/customer-profile/update', [auth], asyncMiddleWare(updateCustomerProfile));
router.put('/bank-info/update', [auth], asyncMiddleWare(updateBankInfo));
router.put('/customer/add-or-remove-fav-provider', [auth], asyncMiddleWare(addOrRemoveFavoriteProviderForCustomer));
router.put('/customer/add-or-remove-fav-hairstyle', [auth], asyncMiddleWare(addOrRemoveFavoriteHairstyleForCustomer));
router.put('/customer/add-or-remove-fav-beard-and-mustache', [auth], asyncMiddleWare(addOrRemoveFavoriteBeardAndMustacheForCustomer));
router.get('/customer/fav-providers', [auth], asyncMiddleWare(getFavoriteProvidersForCustomer));
router.get('/customer/fav-hairstyles', [auth], asyncMiddleWare(getFavoriteHairStylesForCustomer));
router.get('/customer/fav-beard-and-mustaches', [auth], asyncMiddleWare(getFavoriteBeardAndMustachesForCustomer));

router.post('/customer-phone/create', [auth], asyncMiddleWare(addPhoneNumber));
router.put('/customer-phone/update/:id', [auth], asyncMiddleWare(editPhoneNumber));
router.delete('/customer-phone/delete/:id', [auth], asyncMiddleWare(deletePhoneNumber));

router.get('/customer-addresses', [auth], asyncMiddleWare(getAllAddresses));
router.post('/customer-address/create', [auth], asyncMiddleWare(addAddressList));
router.put('/customer-address/update/:id', [auth], asyncMiddleWare(editAddressList));
router.delete('/customer-address/delete/:id', [auth], asyncMiddleWare(deleteAddress));
router.post('/customer-personal-photo/add', [auth], asyncMiddleWare(addPersonalPhotos));
router.delete('/customer-personal-photo/remove', [auth], asyncMiddleWare(removePersonalPhotos));

router.post('/favorite-barbers', [auth], asyncMiddleWare());


router.post("/create",asyncMiddleWare(addUser));

router.get("/id/:id", asyncMiddleWare(getUserById)); //[auth, selfOrStaff]

router.delete("/delete/:id", [auth, admin], asyncMiddleWare(deleteUser));

router.put("/update/:id", [auth], asyncMiddleWare(updateUser));

router.post("/already-exists-phone",asyncMiddleWare(alreadyExistsPhoneNumber));

router.get('/clients', [auth], asyncMiddleWare(getClients));

router.get('/specialist-list/:providerId', asyncMiddleWare(getSpecialistList));

router.post('/check-ref-code', asyncMiddleWare(checkRefCode));

router.get('/ref-usage-history',[auth], asyncMiddleWare(refUsagesHistory));

router.get('/check-ref-income', asyncMiddleWare(checkRefIncome));

router.get("/email-test", asyncMiddleWare(mailTest));

router.post("/sign-out", [auth], asyncMiddleWare(signOut));

router.post("/send-notification-to-customer/:userId",[auth], asyncMiddleWare(sendNotificationToSpecificCustomer));

router.post("/send-notification-to-users",[auth], asyncMiddleWare(sendNotificationToUsers));



module.exports = router;
