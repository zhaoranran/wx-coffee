// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//引入数据库
let db = cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  try{
    return await db.collection('product').where({
      _id: _.in(event.ids)
    }).get();
  }catch(err){
    console.log('接口联调失败',err);
  }
}