// miniprogram/pages/my/my.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    if(!app.globalData.isAuth){
      wx.navigateTo({
        url: '../auth/auth',
      })
      return;
    }else{
      // 必须是在用户已经授权的情况下调用
      wx.getUserInfo({
        success: function(res) {
          console.log(res);
          _this.setData({
            userInfo: res.userInfo
          })
        }
      })
    }
  },
  //跳转我的收藏页面
  goLikeTap: function(){
    if(!app.globalData.isAuth){
      wx.navigateTo({
        url: '../auth/auth',
      })
      return;
    }
    wx.navigateTo({
      url: '../like/like',
    })
  },
  goPerson: function(){
    if(!app.globalData.isAuth){
      wx.navigateTo({
        url: '../auth/auth',
      })
      return;
    }
    wx.navigateTo({
      url: '../person/person',
    })
  }
  
})