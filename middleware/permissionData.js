const { READ_SELLER_BALANCE } = require('./permissionString.js');
const PERMISSIONS = require('./permissionString.js');

const PERMISSION_DATA = {
    CREATE_PRODUCTS: {moduleName: 'Product', permissionNumber: 0, permissionName: PERMISSIONS.CREATE_PRODUCTS},
    READ_PRODUCTS: {moduleName: 'Product', permissionNumber: 1, permissionName: PERMISSIONS.READ_PRODUCTS},
    UPDATE_PRODUCTS: {moduleName: 'Product', permissionNumber: 2, permissionName: PERMISSIONS.UPDATE_PRODUCTS},
    DELETE_PRODUCTS: {moduleName: 'Product', permissionNumber: 3, permissionName: PERMISSIONS.DELETE_PRODUCTS},
    
    CREATE_BANNERS: {moduleName: 'Banner', permissionNumber: 25, permissionName: PERMISSIONS.CREATE_BANNERS},
    READ_SINGLE_BANNER: {moduleName: 'Banner', permissionNumber: 26, permissionName: PERMISSIONS.READ_SINGLE_BANNER},
    READ_BANNERS: {moduleName: 'Banner', permissionNumber: 27, permissionName: PERMISSIONS.READ_BANNERS},
    UPDATE_BANNERS: {moduleName: 'Banner', permissionNumber: 28, permissionName: PERMISSIONS.UPDATE_BANNERS},
    DELETE_BANNERS: {moduleName: 'Banner', permissionNumber: 29, permissionName: PERMISSIONS.DELETE_BANNERS},
 
    CREATE_SERVICES: {moduleName: 'Service', permissionNumber: 34, permissionName: PERMISSIONS.CREATE_SERVICES},
    READ_SINGLE_SERVICE: {moduleName: 'Service', permissionNumber: 35, permissionName: PERMISSIONS.READ_SINGLE_SERVICE},
    READ_SERVICES: {moduleName: 'Service', permissionNumber: 36, permissionName: PERMISSIONS.READ_SERVICES},
    UPDATE_SERVICES: {moduleName: 'Service', permissionNumber: 37, permissionName: PERMISSIONS.UPDATE_SERVICES},
    DELETE_SERVICES: {moduleName: 'Service', permissionNumber: 38, permissionName: PERMISSIONS.DELETE_SERVICES},
    CREATE_HOT_SERVICES: {moduleName: 'Service', permissionNumber: 39, permissionName: PERMISSIONS.CREATE_HOT_SERVICES},
    VERIFY_SERVICES: {moduleName: 'Service', permissionNumber: 40, permissionName: PERMISSIONS.VERIFY_SERVICES},

    CREATE_ROLES: {moduleName: 'User', permissionNumber: 55, permissionName: PERMISSIONS.CREATE_ROLES},
    READ_SINGLE_ROLE: {moduleName: 'User', permissionNumber: 56, permissionName: PERMISSIONS.READ_SINGLE_ROLE},
    UPDATE_ROLES: {moduleName: 'User', permissionNumber: 57, permissionName: PERMISSIONS.UPDATE_ROLES},
    DELETE_ROLES: {moduleName: 'User', permissionNumber: 58, permissionName: PERMISSIONS.DELETE_ROLES},
 
    UPDATE_SELLER: {moduleName: 'Provider', permissionNumber: 59, permissionName: PERMISSIONS.UPDATE_SELLER},
    UPDATE_SELLER_PROFILE: {moduleName: 'Provider', permissionNumber: 60, permissionName: PERMISSIONS.UPDATE_SELLER_PROFILE},
    CREATE_SELLER_PHONE: {moduleName: 'Provider', permissionNumber: 61, permissionName: PERMISSIONS.CREATE_SELLER_PHONE},
    UPDATE_SELLER_PHONE: {moduleName: 'Provider', permissionNumber: 62, permissionName: PERMISSIONS.UPDATE_SELLER_PHONE},
    DELETE_SELLER_PHONE: {moduleName: 'Provider', permissionNumber: 63, permissionName: PERMISSIONS.DELETE_SELLER_PHONE},
    CREATE_SELLER_DELIVERY_ADDRESS: {moduleName: 'Provider', permissionNumber: 64, permissionName: PERMISSIONS.CREATE_SELLER_DELIVERY_ADDRESS},
    UPDATE_SELLER_DELIVERY_ADDRESS: {moduleName: 'Provider', permissionNumber: 65, permissionName: PERMISSIONS.UPDATE_SELLER_DELIVERY_ADDRESS},
    DELETE_SELLER_DELIVERY_ADDRESS: {moduleName: 'Provider', permissionNumber: 66, permissionName: PERMISSIONS.DELETE_SELLER_DELIVERY_ADDRESS},

    CREATE_STATIC_PAGES: {moduleName: 'StaticPage', permissionNumber: 67, permissionName: PERMISSIONS.CREATE_STATIC_PAGES},
    READ_SINGLE_STATIC_PAGE: {moduleName: 'StaticPage', permissionNumber: 68, permissionName: PERMISSIONS.READ_SINGLE_STATIC_PAGE},
    READ_SINGLE_STATIC_PAGE_BY_TITLE: {moduleName: 'StaticPage', permissionNumber: 69, permissionName: PERMISSIONS.READ_SINGLE_STATIC_PAGE_BY_TITLE},
    UPDATE_STATIC_PAGES: {moduleName: 'StaticPage', permissionNumber: 70, permissionName: PERMISSIONS.UPDATE_STATIC_PAGES},
    DELETE_STATIC_PAGES: {moduleName: 'StaticPage', permissionNumber: 71, permissionName: PERMISSIONS.DELETE_STATIC_PAGES},

    READ_PROFILES: {moduleName: 'User', permissionNumber: 72, permissionName: PERMISSIONS.READ_PROFILES},
    READ_SINGLE_PROFILE: {moduleName: 'User', permissionNumber: 73, permissionName: PERMISSIONS.READ_SINGLE_PROFILE},
    READ_LITE_PROFILE: {moduleName: 'User', permissionNumber: 74, permissionName: PERMISSIONS.READ_LITE_PROFILE},
    SIGNUP: {moduleName: 'User', permissionNumber: 75, permissionName: PERMISSIONS.SIGNUP},
    UPDATE_USERS_PASSWORD: {moduleName: 'User', permissionNumber: 76, permissionName: PERMISSIONS.UPDATE_USERS_PASSWORD},
    UPDATE_CUSTOMERS_PASSWORD: {moduleName: 'User', permissionNumber: 77, permissionName: PERMISSIONS.UPDATE_CUSTOMERS_PASSWORD},
    UPDATE_PASSWORD: {moduleName: 'User', permissionNumber: 78, permissionName: PERMISSIONS.UPDATE_PASSWORD},
    UPDATE_CUSTOMER_PROFILE: {moduleName: 'User', permissionNumber: 79, permissionName: PERMISSIONS.UPDATE_CUSTOMER_PROFILE},
    CREATE_CUSTOMER_PHONE: {moduleName: 'User', permissionNumber: 80, permissionName: PERMISSIONS.CREATE_CUSTOMER_PHONE},
    UPDATE_CUSTOMER_PHONE: {moduleName: 'User', permissionNumber: 81, permissionName: PERMISSIONS.UPDATE_CUSTOMER_PHONE},
    DELETE_CUSTOMER_PHONE: {moduleName: 'User', permissionNumber: 82, permissionName: PERMISSIONS.DELETE_CUSTOMER_PHONE},
    CREATE_CUSTOMER_DELIVERY_ADDRESS: {moduleName: 'User', permissionNumber: 83, permissionName: PERMISSIONS.CREATE_CUSTOMER_DELIVERY_ADDRESS},
    UPDATE_CUSTOMER_DELIVERY_ADDRESS: {moduleName: 'User', permissionNumber: 84, permissionName: PERMISSIONS.UPDATE_CUSTOMER_DELIVERY_ADDRESS},
    DELETE_CUSTOMER_DELIVERY_ADDRESS: {moduleName: 'User', permissionNumber: 85, permissionName: PERMISSIONS.DELETE_CUSTOMER_DELIVERY_ADDRESS},
    CREATE_USER: {moduleName: 'User', permissionNumber: 86, permissionName: PERMISSIONS.CREATE_USER},
    READ_SINGLE_USER: {moduleName: 'User', permissionNumber: 87, permissionName: PERMISSIONS.READ_SINGLE_USER},
    READ_USERS: {moduleName: 'User', permissionNumber: 88, permissionName: PERMISSIONS.READ_USERS},
    UPDATE_USERS: {moduleName: 'User', permissionNumber: 89, permissionName: PERMISSIONS.UPDATE_USERS},
    DELETE_USERS: {moduleName: 'User', permissionNumber: 90, permissionName: PERMISSIONS.DELETE_USERS},
    ALREADY_EXISTS_PHONE: {moduleName: 'User', permissionNumber: 91, permissionName: PERMISSIONS.ALREADY_EXISTS_PHONE},
    CREATE_SSL: {moduleName: 'User', permissionNumber: 92, permissionName: PERMISSIONS.CREATE_SSL},
    SUCCESS_SSL: {moduleName: 'User', permissionNumber: 93, permissionName: PERMISSIONS.SUCCESS_SSL},

    READ_SINGLE_COMPANY: {moduleName: 'Company', permissionNumber: 99, permissionName: PERMISSIONS.READ_SINGLE_COMPANY},
    READ_ROLES: {moduleName: 'User', permissionNumber: 100, permissionName: PERMISSIONS.READ_ROLES},

    VERIFY_PRODUCTS: {moduleName: 'Product', permissionNumber: 101, permissionName: PERMISSIONS.VERIFY_PRODUCTS},
   
    READ_STATIC_PAGES: {moduleName: 'StaticPage', permissionNumber: 108, permissionName: PERMISSIONS.READ_STATIC_PAGES},
    
    CREATE_GLOBAL_CONFIGS: {moduleName: 'GlobalConfig', permissionNumber: 114, permissionName: PERMISSIONS.CREATE_GLOBAL_CONFIGS},
    READ_SINGLE_GLOBAL_CONFIG: {moduleName: 'GlobalConfig', permissionNumber: 115, permissionName: PERMISSIONS.READ_SINGLE_GLOBAL_CONFIG},
    READ_GLOBAL_CONFIGS: {moduleName: 'GlobalConfig', permissionNumber: 116, permissionName: PERMISSIONS.READ_GLOBAL_CONFIGS},
    UPDATE_GLOBAL_CONFIGS: {moduleName: 'GlobalConfig', permissionNumber: 117, permissionName: PERMISSIONS.UPDATE_GLOBAL_CONFIGS},
    DELETE_GLOBAL_CONFIGS: {moduleName: 'GlobalConfig', permissionNumber: 118, permissionName: PERMISSIONS.DELETE_GLOBAL_CONFIGS},

    READ_SELLERS: {moduleName: 'Provider', permissionNumber: 119, permissionName: PERMISSIONS.READ_SELLERS},
    VERIFY_SELLERS: {moduleName: 'Provider', permissionNumber: 120, permissionName: PERMISSIONS.VERIFY_SELLERS},
    READ_SELLER_ACCOUNTS: {moduleName: 'Provider', permissionNumber: 139, permissionName: PERMISSIONS.READ_SELLER_ACCOUNTS},
    READ_SELLER_LEDGERS: {moduleName: 'Provider', permissionNumber: 140, permissionName: PERMISSIONS.READ_SELLER_LEDGERS},
    CANCEL_SELLER_PAYMENT: {moduleName: 'Provider', permissionNumber: 141, permissionName: PERMISSIONS.CANCEL_SELLER_PAYMENT},
    CREATE_SELLER_PAYMENT: {moduleName: 'Provider', permissionNumber: 142, permissionName: PERMISSIONS.CREATE_SELLER_PAYMENT},

    READ_WAREHOUSES_TO_SEND_STOCK: {moduleName: 'Warehouse', permissionNumber: 143, permissionName: PERMISSIONS.READ_WAREHOUSES_TO_SEND_STOCK},
    PRODUCT_ACTIVATE_DEACTIVATE: {moduleName: 'Product', permissionNumber: 144, permissionName: PERMISSIONS.PRODUCT_ACTIVATE_DEACTIVATE},


    READ_REQUESTED_COMPANIES: {moduleName: 'Company', permissionNumber: 145, permissionName: PERMISSIONS.READ_REQUESTED_COMPANIES},
    VERIFY_COMPANIES: {moduleName: 'Company', permissionNumber: 146, permissionName: PERMISSIONS.VERIFY_COMPANIES},

    
    VIEW_ONLINE_VISITORS: {moduleName: 'Dashboard', permissionNumber: 179, permissionName: PERMISSIONS.VIEW_ONLINE_VISITORS},
    VIEW_CUSTOMER_REGISTRATION_GRAPH: {moduleName: 'Dashboard', permissionNumber: 180, permissionName: PERMISSIONS.VIEW_CUSTOMER_REGISTRATION_GRAPH},
    VIEW_ORDER_GRAPH_BY_DAY: {moduleName: 'Dashboard', permissionNumber: 181, permissionName: PERMISSIONS.VIEW_ORDER_GRAPH_BY_DAY},
    VIEW_ORDER_GRAPH_BY_MONTH: {moduleName: 'Dashboard', permissionNumber: 182, permissionName: PERMISSIONS.VIEW_ORDER_GRAPH_BY_MONTH},
    VIEW_TOTAL_USER_COUNT: {moduleName: 'Dashboard', permissionNumber: 183, permissionName: PERMISSIONS.VIEW_TOTAL_USER_COUNT},
    VIEW_AVERAGE_NUMBER_OF_ORDER_PER_CUSTOMER: {moduleName: 'Dashboard', permissionNumber: 184, permissionName: PERMISSIONS.VIEW_AVERAGE_NUMBER_OF_ORDER_PER_CUSTOMER},
    VIEW_TOP_SOLD_PRODUCTS: {moduleName: 'Dashboard', permissionNumber: 185, permissionName: PERMISSIONS.VIEW_TOP_SOLD_PRODUCTS},
    VIEW_LAST_MONTH_TOTAL_SALE: {moduleName: 'Dashboard', permissionNumber: 186, permissionName: PERMISSIONS.VIEW_LAST_MONTH_TOTAL_SALE},
    VIEW_THIS_MONTH_TOTAL_SALE: {moduleName: 'Dashboard', permissionNumber: 187, permissionName: PERMISSIONS.VIEW_THIS_MONTH_TOTAL_SALE},
    VIEW_VENDOR_DASHBOARD: {moduleName: 'Dashboard', permissionNumber: 188, permissionName: PERMISSIONS.VIEW_VENDOR_DASHBOARD},

    CREATE_CITIES: {moduleName: 'City', permissionNumber: 192, permissionName: PERMISSIONS.CREATE_CITIES},
    READ_SINGLE_CITY: {moduleName: 'City', permissionNumber: 193, permissionName: PERMISSIONS.READ_SINGLE_CITY},
    READ_CITIES: {moduleName: 'City', permissionNumber: 194, permissionName: PERMISSIONS.READ_CITIES},
    UPDATE_CITIES: {moduleName: 'City', permissionNumber: 195, permissionName: PERMISSIONS.UPDATE_CITIES},
    DELETE_CITIES: {moduleName: 'City', permissionNumber: 196, permissionName: PERMISSIONS.DELETE_CITIES},

    CREATE_COUNTRY_CODES: {moduleName: "CountryCode", permissionNumber: 197, permissionName: PERMISSIONS.CREATE_COUNTRY_CODES},
    READ_SINGLE_COUNTRY_CODE: {moduleName: "CountryCode", permissionNumber: 198, permissionName: PERMISSIONS.READ_SINGLE_COUNTRY_CODE},
    READ_COUNTRY_CODES: {moduleName: "CountryCode", permissionNumber: 199, permissionName: PERMISSIONS.READ_COUNTRY_CODES},
    UPDATE_COUNTRY_CODES: {moduleName: "CountryCode", permissionNumber: 200, permissionName: PERMISSIONS.UPDATE_COUNTRY_CODES},
    DELETE_COUNTRY_CODES: {moduleName: "CountryCode", permissionNumber: 201, permissionName: PERMISSIONS.DELETE_COUNTRY_CODES},

    CREATE_TRANSACTIONS: {moduleName: 'Transaction', permissionNumber: 202, permissionName: PERMISSIONS.CREATE_TRANSACTIONS},
    READ_SINGLE_TRANSACTION: {moduleName: 'Transaction', permissionNumber: 203, permissionName: PERMISSIONS.READ_SINGLE_TRANSACTION},
    READ_TRANSACTIONS: {moduleName: 'Transaction', permissionNumber: 204, permissionName: PERMISSIONS.READ_TRANSACTIONS},
    UPDATE_TRANSACTIONS: {moduleName: 'Transaction', permissionNumber: 205, permissionName: PERMISSIONS.UPDATE_TRANSACTIONS},
    DELETE_TRANSACTIONS: {moduleName: 'Transaction', permissionNumber: 206, permissionName: PERMISSIONS.DELETE_TRANSACTIONS},
    
    CREATE_POPUP_BANNERS: {moduleName: 'PopupBanners', permissionNumber: 207, permissionName: PERMISSIONS.CREATE_POPUP_BANNERS},
    READ_SINGLE_POPUP_BANNER: {moduleName: 'PopupBanners', permissionNumber: 208, permissionName: PERMISSIONS.READ_SINGLE_POPUP_BANNER},
    READ_POPUP_BANNERS: {moduleName: 'PopupBanners', permissionNumber: 209, permissionName: PERMISSIONS.READ_POPUP_BANNERS},
    UPDATE_POPUP_BANNERS: {moduleName: 'PopupBanners', permissionNumber: 210, permissionName: PERMISSIONS.UPDATE_POPUP_BANNERS},
    DELETE_POPUP_BANNERS: {moduleName: 'PopupBanners', permissionNumber: 211, permissionName: PERMISSIONS.DELETE_POPUP_BANNERS}

}


module.exports = PERMISSION_DATA;
