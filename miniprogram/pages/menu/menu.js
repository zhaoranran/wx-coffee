// miniprogram/pages/menu/menu.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //轮播数据
    bannerObj:[
      {
        imgUrl:'cloud://text-9gduojj2cd7b4a29.7465-text-9gduojj2cd7b4a29-1303829965/banner/bga1.jpg'
      },
      {
        imgUrl:'cloud://text-9gduojj2cd7b4a29.7465-text-9gduojj2cd7b4a29-1303829965/banner/bga2.jpg'
      },
      {
        imgUrl:'cloud://text-9gduojj2cd7b4a29.7465-text-9gduojj2cd7b4a29-1303829965/banner/bga3.jpg'
      },
      {
        imgUrl:'cloud://text-9gduojj2cd7b4a29.7465-text-9gduojj2cd7b4a29-1303829965/banner/bga4.jpg'
      }
    ],
    //轮播配置
    swiperOption:{
      indicatorDots:true,
      indicatorColor:"#fff",
      indicatorActiveColor:"#165DAD",
      autoplay:true,
      interval:3000,
      circular:true
    },
    //侧边栏数据
    asideList:[
      {
        title:'最新推荐',
        isActive:true,
        key:'is_hot',
        value:1
      },
      {
        title:'大师咖啡',
        isActive:false,
        key:'type',
        value:'coffee'
      },
      {
        title:'拿铁',
        isActive:false,
        key:'type',
        value:'latte'
      },
      {
        title:'瑞纳冰',
        isActive:false,
        key:'type',
        value:'rena_ice'
      }
    ],
    //右侧商品
    productList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let obj = {
      key:'is_hot',
      value:1
    }
   this.getProductList(obj);
  },
  //切换侧边栏菜单
  toggleAsideMenu(event){
    let _this = this,
        thisActive = event.currentTarget.dataset.active,//当前点击的选中状态
        thisIndex = event.currentTarget.dataset.index,//当前点击的选中状态
        asideList = this.data.asideList;
    asideList.forEach(element => {
      if(element.isActive){
        element.isActive = false;
        return;
      }
    });
    this.data.asideList[thisIndex].isActive = true 
    this.setData({
      asideList:this.data.asideList
    });
    this.getProductList(event.currentTarget.dataset);
  },
  getProductList(obj){
    //获取云函数：[get_product]
    let _this = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name:'get_product',
      //参数
      data:{
        key:obj.key,
        value:obj.value
      },
      success:res =>{
        // console.log(res);
        wx.hideLoading();
        _this.setData({
          productList:res.result.data
        });
      },
      fail: err => {
        wx.hideLoading();
        console.log('失败了 ',err);
      }
    })
  },
  goDetail:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?id='+id,
    })
  }
})