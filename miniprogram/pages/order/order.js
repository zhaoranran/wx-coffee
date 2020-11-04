// miniprogram/pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [] //订单列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderData();
  },

  //获取订单详情
  getOrderData: function () {
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: 'get_order',
      success: res => {
        wx.hideLoading();
        // console.log('订单列表 res=>',res);
        let orderList = res.result.data;
        
        orderList.forEach(i => {
          let price = 0,
            count = 0;
          i.productList.forEach(j => {
            price += j.count * j.price;
            count += j.count
          })
          i.price = price;
          i.count = count;
          console.log(i.createDate);
        })
        this.setData({
          orderList: orderList
        })
        console.log(this.data.orderList);
      },
      fail: err => {
        wx.hideLoading();
        console.log('订单列表获取失败 err=>', err);
      }
    })
  }
})