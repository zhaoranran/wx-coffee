// miniprogram/pages/address/auth.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  getUserInfo: function(res){
    console.log(res);
    if(res.detail && res.detail.userInfo){
      app.globalData.isAuth = true;
    }else{
      app.globalData.isAuth = false;
    }
  }
  
})