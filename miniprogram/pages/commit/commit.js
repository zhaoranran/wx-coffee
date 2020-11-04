var format = require('../../utils/format.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowAddress: false,
    addressList: [], //地址列表
    shopcartList: [], //商品详情列表
    allCount: 0, //商品数量
    allPrice: 0, //共计钱数
    address: '选择收货地址',
    addressIndex: -1 //收货地址下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let productId = options.id;
    // console.log(productId);
    let ids = [];
    ids = productId.split("@");
    this.getShopcartData(ids);
    this.getAddressData();
  },
  //提交订单
  commit: function () {
    if (this.data.addressIndex === -1) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    let addressList = this.data.addressList,
      addressIndex = this.data.addressIndex,
      userAddress = {};
    userAddress = {
      addres: addressList[addressIndex].address + addressList[addressIndex].houseNum,
      phone: addressList[addressIndex].phone,
      userName: addressList[addressIndex].userName
    }
    let creatDate = format.formatDate(new Date());
    let order = {
      id: "NO" + new Date().getTime(),
      createDate: creatDate,
      userAddress: userAddress,
      productList: this.data.shopcartList
    }
    this.pushOrder(order);
  },
  //订单接口
  pushOrder: function (order) {
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: 'add_order',
      data: order,
      success: res => {
        wx.hideLoading();
        // console.log('订单成功 res',res);
        order.productList.forEach(item => {
          this.removeShopcartData([item._id]);
        })
      },
      fail: err => {
        wx.hideLoading();
        console.log('订单失败 err=>', err);
      }
    })
  },
  //显示收货地址
  showAddress: function () {
    this.setData({
      isShowAddress: !this.data.isShowAddress
    })

  },
  //获取收货地址
  getAddressData: function () {
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'get_address',
      success: res => {
        wx.hideLoading()
        console.log('收货地址列表 res=>', res);
        this.setData({
          addressList: res.result.data
        })
      },
      fail: err => {
        wx.hideLoading()
        console.log('获取收货地址失败 err=>', err);
      }
    })
  },
  //新增地址
  addAddress: function () {
    wx.navigateTo({
      url: '../new/new',
    })
  },
  //回显选中的收货地址
  selectAddressTap: function (e) {
    let index = e.currentTarget.dataset.index;
    let addres = this.data.addressList[index]
    this.setData({
      address: addres.address + addres.houseNum,
      addressIndex: index
    })
  },
  //获取商品详情
  getShopcartData: function (ids) {
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'get_shopcart_byid',
      data: {
        ids: ids
      },
      success: res => {
        wx.hideLoading();
        // console.log('商品列表 res=>',res);
        this.setData({
          shopcartList: res.result.data
        })
        let productIds = []
        this.data.shopcartList.forEach(item => {
          if (productIds.indexOf(item.id) == -1) {
            productIds.push(item.id)
          }
        })
        // console.log('productIds =>',productIds);
        this.getProductDetail(productIds)
      },
      fail: err => {
        wx.hideLoading();
        console.log('商品列表获取失败 err=>', err);
      }
    })
  },
  //获取要购买的商品详情
  getProductDetail: function (ids) {
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: 'get_product_byid',
      data: {
        ids: ids
      },
      success: res => {
        wx.hideLoading();
        // console.log('商品详情 res=>',res);
        let productList = res.result.data,
          allCount = 0,
          allPrice = 0;
        this.data.shopcartList.forEach(i => {
          allCount += i.count
          productList.forEach(j => {
            if (i.id == j._id) {
              i.name = j.name;
              i.small_img = j.small_img;
              i.price = j.price;
              allPrice += i.count * i.price;
              return false;
            }
          })
        })
        this.setData({
          shopcartList: this.data.shopcartList,
          allCount: allCount,
          allPrice: allPrice
        })
      },
      fail: err => {
        console.log('获取商品详情失败 err=>', err);
      }
    })
  },
  //订单结束后清除购物车次商品
  removeShopcartData: function (ids) {
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: "remove_shopcart_byid",
      data: {
        ids: ids
      },
      success: res => {
        wx.hideLoading()
        console.log('购物车删除成功 res=>', res);
        wx.switchTab({
          url: '../order/order',
          success: function (e) {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          }
        })
      },
      fail: err => {
        wx.hideLoading();
        console.log('购物车删除当前商品失败 err=>', err);
      }
    })
  }

})