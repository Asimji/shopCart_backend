const express=require("express");
const productModel = require("../models/product.model");
const adminAuth = require("../middleware/admin.middleware");


const productRouter=express.Router();

productRouter.get('/',async(req,res)=>{
    try {
        let { category, q, page, limit, sortOrder,sortBy } = req.query;
        let filter = {};
    
        if (category) {
          // Convert type to an array if it's a single value
          const categories = Array.isArray(category) ? category : [category];
          filter.category = { $in: categories };
        }
    
        if (q) {
          filter.brand = { $regex: q, $options: "i" };
        }



    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    page = parseInt(page) ;
    limit = parseInt(limit) ;

    const products = await productModel
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
        res.status(200).json({products})
        
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})

productRouter.get('/:id',async(req,res)=>{
    const {id}=req.params;
    try {
        const product=await productModel.findOne({_id:id})
        res.status(200).json({product})
        
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})

productRouter.use(adminAuth)

productRouter.post("/add",async(req,res)=>{

       try {
        const product=new productModel(req.body);
        await product.save();
        res.status(200).json({msg:req.body})
       } catch (error) {
        res.status(400).json({error:error.message})
       }
})
productRouter.patch("/update/:id",async(req,res)=>{
    const {id}=req.params
    try {
        const product= await productModel.findOne({_id:id})
       await productModel.findByIdAndUpdate({_id:id},req.body);
       res.status(200).json({msg:`${product.title} got Updated Successfully`})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})
productRouter.delete("/delete/:id",async(req,res)=>{
    const {id}=req.params
    try {
        const product= await productModel.findOne({_id:id})
       await productModel.findByIdAndDelete({_id:id});
       res.status(200).json({msg:`${product.title} got Deleted Successfully`})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})

module.exports=productRouter