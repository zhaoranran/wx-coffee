// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库引用
let db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
 try{
   return await db.collection('product').where({
     _id: event.id
   }).get();
 }catch(err){
  console.log('接口联调失败',err);
 }
 
}