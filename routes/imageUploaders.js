
const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
global.atob = require("atob");

const router = express.Router();

const fileStorage = (fileName) => multer.diskStorage({
  destination: (req, file, cb) => {
    
    let date = new Date();
    date = "" + date.getMonth() + date.getFullYear();
    const uploadDir = path.join(
      "public",
      "uploads",
      fileName,
      `${date}`
    );
    fs.mkdir(uploadDir, function (e) {
      if (!e || (e && e.code === "EEXIST")) {
        cb(null, uploadDir);
      } else {
        console.log("File creation failed,", e);
      }
    });
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + new Date().toISOString().replace(/:/g, '-') + path.extname(file.originalname)
    );
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/wpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (
    file.mimetype === "file/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const imageUpload = (req, res, fileName) => {
  
    var upload = multer({ storage: fileStorage(fileName), fileFilter: fileFilter }).single('image');
    
    upload(req, res, function(err){
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }

        if(!req.file){
            return res.status(400).send({message: "Please upload an image."});
        }

        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }

        else if (err) {
            return res.send(err);
        }

        return res.status(200).send(`${req.file.path}`);
    })
}


const imageUploadFromFlutter = (req, res, fileName) => {
  var img = req.body.image;
  var imgInfo = img.split('#@');
  var realFile = Buffer.from(imgInfo[1],"base64");
  var nameAndExt = imgInfo[0].split('/');
  nameAndExt = nameAndExt[nameAndExt.length - 1];
  let name = nameAndExt.split('.')[0];
  let ext = nameAndExt.split('.')[1];

  let date = new Date();
    date = "" + date.getMonth() + date.getFullYear();
    
    const uploadDir = path.join(
      "public",
      "uploads",
      fileName,
      `${date}`
    );

    fs.mkdir(uploadDir,1, function (e) {
      if (!e || (e && e.code === "EEXIST")) {
        nameAndExt = new Date().toISOString().replace(/:/g, '-') + name+'.'+ext;
        let fullDir = path.join(uploadDir, nameAndExt);
        fs.writeFile(fullDir, realFile, function(err) {
          if(err)
             console.log(err);
          else{
            return res.status(200).send(fullDir);
          }
       });
      } else {
        console.log("File creation failed,", e);
      }
    });
}

const fileUpload = (req, res, fileName) => {
  var upload = multer({ storage: fileStorage(fileName) }).single('file');

  upload(req, res, function(err){
      if (req.fileValidationError) {
          return res.send(req.fileValidationError);
      }

      if(!req.file){
          return res.status(400).send({message: "Please upload a file."});
      }

      else if (err instanceof multer.MulterError) {
          return res.send(err);
      }

      else if (err) {
          return res.send(err);
      }

      return res.status(200).send(req.file.path);
  })
}

router.post('/admin-portal-image', [auth], (req, res) => {
  imageUpload(req, res, 'adminPortal');
});
router.post('/popup-banner-image', [auth], (req, res) => {
  imageUpload(req, res, 'popupBanners');
});

router.post('/product-image', [auth], (req, res) => {
    imageUpload(req, res, 'products');
});

router.post('/service-icon', [auth], (req, res) => {
  if(req.query.fromFlutter){
    imageUploadFromFlutter(req, res, 'servicesIcons');
  }else{
    imageUpload(req, res, 'servicesIcons');
  }
});

router.post('/profile-picture', [auth], (req, res) => {
  if(req.query.fromFlutter){
    imageUploadFromFlutter(req, res, 'profilePictures');
  }else
    imageUpload(req, res, 'profilePictures');
});

router.post('/banner', [auth], (req, res) => {
  if(req.query.fromFlutter){
    imageUploadFromFlutter(req, res, 'banners');
  }else
    imageUpload(req, res, 'banners');
});

router.post('/personal-photos', [auth], (req, res) => {
  if(req.query.fromFlutter){
    imageUploadFromFlutter(req, res, 'personalPhotos');
  }else
    imageUpload(req, res, 'personalPhotos');
});

router.post('/image-gallery', [auth], (req, res) => {
  if(req.query.fromFlutter){
    imageUploadFromFlutter(req, res, 'imageGallery');
  }else
    imageUpload(req, res, 'imageGallery');
});

router.post('/logo', [auth], (req, res) => {
  if(req.query.fromFlutter){
    imageUploadFromFlutter(req, res, 'logos');
  }else
    imageUpload(req, res, 'logos');
});

router.post('/company', [auth], (req, res) => {
  imageUpload(req, res, 'companies');
});

router.post('/provider-doc', [auth], (req, res) => {
  fileUpload(req, res, 'providerDocuments');
});

router.post('/provider-images', [auth], (req, res) => {
  imageUpload(req, res, 'providerImages');
});

router.post('/order-images', [auth], (req, res) => {
  imageUpload(req, res, 'orderImages');
});

router.post('/issue-images', [auth], (req, res) => {
  imageUploadFromFlutter(req, res, 'issueImages');
});

module.exports = router;
// S3H9MEUv7b0Nrwx28a