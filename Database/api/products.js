
const express = require("express");
const router = express.Router();


const productModel = require("../models/product")
const brandModel = require("../models/brand")
const categoryModel = require('../models/category');
const variantModel = require("../models/variant")
const { ObjectId } = require('mongodb');


router.post("/addProduct", async (req, res) => {

    try {
        const variant = await variantModel.findOne({
            size: req.body.size,
            color: req.body.color
        });

        let newVariant;

        if (!variant) {
            newVariant = new variantModel({
                _id: new ObjectId(),
                size: req.body.size,
                color: req.body.color
            });

            await newVariant.save();
        }

        const brand = await brandModel.findOne({ brandName: req.body.brandName });
        let newBrand;

        if (!brand) {
            newBrand = new brandModel({
                _id: new ObjectId(),
                brandName: req.body.brandName
            });
            await newBrand.save();
        }

        const category = await categoryModel.findOne({ categoryName: req.body.categoryName });
        let newCategory;

        if (!category) {
            newCategory = new categoryModel({
                _id: new ObjectId(),
                categoryName: req.body.categoryName
            });
            await newCategory.save();
        }

        const newProduct = new productModel({
            _id: new ObjectId(),
            name: req.body.name,
            image: req.body.image,
            description: req.body.description,
            price: req.body.price,
            variantId: newVariant ? newVariant._id : variant._id,
            categoryId: newCategory?newCategory._id:category._id,
            brandId: newBrand?newBrand._id:brand._id,
            adminId: "653da2e7efe05ef4270de4f5" /// Need to change 
        });
        console.log(newProduct)
        await newProduct.save();
 
        res.status(200).json({
            message: "Product created successfully",
            product: newProduct
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.get('/products', async (req, res) => {
  console.log(req.query)
    try {
      const filters = {}; // Initialize an empty filter object
        console.log(req.query)
      // Check if the request includes filters for size, color, categoryName, or brandName
      if (req.query.size) {
        const variant = await variantModel.findOne({ size: req.query.size });
        console.log("Size",variant)
        if (variant) {
          filters['variantId'] = variant._id;
        }
      }
  
      if (req.query.color) {
        const variant = await variantModel.findOne({ color: req.query.color });
        console.log("Color",variant)
        if (variant) {
          filters['variantId'] = variant._id;
        }
      }
  
      if (req.query.categoryName) {
        const category = await categoryModel.findOne({ categoryName: req.query.categoryName });
        console.log("Category",category)
        if (category) {
          filters['categoryId'] = category._id;
        }
      }
  
      if (req.query.brandName) {
        const brand = await brandModel.findOne({ brandName: req.query.brandName });
        console.log("Brand",brand)
        if (brand) {
          filters['brandId'] = brand._id;
        }
      }
      console.log("filters----",filters)
     
      const products = await productModel.find(filters)
      .populate("variantId")
      .populate("categoryId")
      .populate("brandId")
      .exec();
      res.status(200).json({ products });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  router.get("/products", async (req, res) => {
  const brandName = req.query.brandName; 

  try {
    const brand = await brandModel.findOne({ brandName }); 

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const products = await productModel.find({ brandId: brand._id })
      .populate("variantId")
      .populate("categoryId")
      .populate("brandId")
      .exec();

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
});



module.exports = router;


