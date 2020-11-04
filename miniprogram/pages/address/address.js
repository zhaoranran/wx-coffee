// miniprogram/pages/address/address.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAddressData();
  },
  addAddress: function(){
    wx.navigateTo({
      url: '../new/new',
    })
  },
  //获取收货地址
  getAddressData: function(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'get_address',
      success: res=>{
        wx.hideLoading();
        // console.log('收货地址 res=>',res);
        this.setData({
          addressList:res.result.data
        })
      },
      fail: err=>{
        wx.hideLoading();
        console.log('获取收货地址失败 err=>',err);
      }
    })
  },
  deleAddressTap: function(e){
    let _this = this;
    let dataset = e.currentTarget.dataset;
    wx.showModal({
      title: '确定删除收货地址吗？',
      content: '这是一个模态弹窗',
      showCancel:true,
      success (res) {
        if (res.confirm) {
          // console.log('用户点击确定')
          _this.deleAddress(dataset);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //删除收货地址
  deleAddress: function(dataset){
    wx.cloud.callFunction({
      name:'remove_address',
      data:{
        id:dataset.id
      },
      success: res=>{
        
        if(res.result.stats.removed == 1){
          this.data.addressList.splice(dataset.index,1);
          this.setData({
            addressList: this.data.addressList
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          });
        }
      },
      fail: err=>{
        console.log('删除失败 err=>',err);
      }
    })
  },
  //修改收货地址
  updateAddress: function(e){
    wx.navigateTo({
      url: '../new/new?id=' + e.currentTarget.dataset.id,
    })
  }
})