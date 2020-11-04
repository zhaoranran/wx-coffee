// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//引入数据库
let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try{
    return await db.collection('shopcart').where({
      userInfo:event.userInfo
    }).get();
  }catch(err){
    console.log('云函数调用失败 err=>',err);
  }
}