// miniprogram/pages/like/like.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //我的收藏列表
    likeList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLikeData();
  },

  getLikeData: function(){
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name:'get_like_product',
      data:{},
      success: res=>{
        wx.hideLoading();
        // console.log('我的收藏列表 res=>',res);
        let likeList = res.result.data;
        let ids = [];
        likeList.forEach((item)=>{
          ids.push(item.id);
        });
        this.getProductDetailData2(ids);
      },
      fail: err=>{
        wx.hideLoading();
        console.log('数据回调失败 err=>',err);
      }
    })
  },
  //获取商品（采用多次查询）
  getProductDetailData1: function(id){
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name:'get_detail',
      data:{
        id:id
      },
      success: res=>{
        wx.hideLoading();
        // console.log('商品详情 res=>',res);
        this.data.likeList.push(res.result.data[0])
        this.setData({
          likeList: this.data.likeList
        });
        // console.log(this.data.likeList);
      },
      fail: err=>{
        wx.hideLoading();
        console.log('数据回调失败 err=>',err);
      }
    })
  },
  //根据商品id集合查询商品数据，采用指令查询一次查出所有数据
  getProductDetailData2: function(ids){
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name:'get_product_byid',
      data:{
        ids:ids
      },
      success: res=>{
        wx.hideLoading();
        // console.log('商品详情 res=>',res);
        this.setData({
          likeList: res.result.data
        });
      },
      fail: err=>{
        wx.hideLoading();
        console.log('数据回调失败 err=>',err);
      }
    })
  },
  //删除商品
  deleteProduct: function(e){
    let productId = e.currentTarget.dataset.id;
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name:'remove_like_product',
      data:{
        id: productId
      },
      success: res =>{
        wx.hideLoading();
        wx.showToast({
          title: '删除收藏成功',
          icon: 'success',
          duration: 2000
        });
        // let likeList = this.data.likeList;
        // likeList.forEach((item,index)=>{
        //   if(item._id == productId){
        //     this.data.likeList.splice(index,1)
        //   }
        // });
        this.data.likeList.splice(e.currentTarget.dataset.index,1)
        this.setData({
          likeList: this.data.likeList
        })
      },
      fail: err => {
        wx.hideLoading();
        console.log('取消失败 err=>',err);
      }
    })
  }
})