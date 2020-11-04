// miniprogram/pages/detail/detail.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //详情信息
    detailData:{},
    //商品描述信息
    descList:[],
    //是否收藏
    isLike:false,
    //商品规格列表
    ruleList:[],
    //商品数量
    count:1,
    //商品价格
    price:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    this.getDetail(id);
  },
  //商品详情
  getDetail: function(id){
    let _this = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name:'get_detail',
      data:{
        id: id
      },
      success:res => {
        // console.log('res=>',res);
        wx.hideLoading();
        let descList = res.result.data[0].desc.split('\n');
        // console.log(descList);
        this.setData({descList:descList});
        this.setData({detailData:res.result.data[0]});
        this.setData({price:res.result.data[0].price})
        this.getIsLike(this.data.detailData._id);
        this.getRule(this.data.detailData._id);
      },
      fail:err => {
        wx.hideLoading();
        console.log('err=>',err);
      }
    })
  },
  //收藏取消收藏点击事件
  likeProduct: function(e){
    if(!app.globalData.isAuth){
      wx.navigateTo({
        url: '../auth/auth',
      })
      return;
    }
    if(!this.data.isLike){
      this.like(e.currentTarget.dataset.id);
    }else{
      this.removeLike(e.currentTarget.dataset.id);
    }
  },
  //收藏
  like: function(id){
    wx.cloud.callFunction({
      name:'like_product',
      data:{
        id: id
      },
      success: res => {
        wx.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 2000
        });
        this.setData({
          isLike:true
        });
        console.log('收藏',res);
      },
      fail: err=>{
        wx.hideLoading();
        console.log("数据返回失败 err=>",err);
      }
    })
  },
  //取消收藏
  removeLike: function(id){
    wx.cloud.callFunction({
      name:'remove_like_product',
      data:{
        id:id
      },
      success: res =>{
        wx.showToast({
          title: '取消收藏成功',
          icon: 'success',
          duration: 2000
        });
        console.log('取消收藏',res);
        this.setData({
          isLike:false
        });
      },
      fail: err => {
        wx.hideLoading();
        console.log('取消失败 err=>',err);
      }
    })
  },
  //获取当前产品是否是收藏状态
  getIsLike(id){
    wx.cloud.callFunction({
      name:'get_like_product',
      data:{
        id: id
      },
      success: res => {
        if(res.result.data.length>0){
          this.setData({
            isLike:true
          });
        }else{
          this.setData({
            isLike:false
          });
        }
      },
      fail: err=>{
        console.log("数据返回失败 err=>",err);
      }
    })
  },
  //获取商品规格
  getRule: function(id){
    wx.cloud.callFunction({
      name:'get_rule',
      data:{
        id: id
      },
      success: res => {
        let _this = this,
            rules = res.result.data[0],
            rulesList = [];
        Object.keys(rules).forEach((key)=>{
          if(typeof rules[key] == 'object' && rules[key].value.length>0){
            rulesList.push({
              name:rules[key].key,
              value:rules[key].value,
              type: key
            });
          }
        })
        this.setData({
          ruleList:rulesList
        });
      },
      fail: err=>{
        console.log("数据返回失败 err=>",err);
      }
    })
  },
  //商品规格切换事件
  ruleTab: function(e){
    let dataset = e.currentTarget.dataset,
        ruleList = this.data.ruleList;
    // console.log(e);
    if(dataset.isSelect){
      return;
    }
    ruleList.find((item)=>{
      if(item.type == dataset.type){
        item.value.forEach((val)=>{
          if(val.isSelect){
            val.isSelect = false;
          }
        })
        item.value[dataset.index].isSelect = true;
      }
    })
    this.setData({
      ruleList:this.data.ruleList
    })
  },
  //商品减少事件
  reduceTap: function(e){
    if(this.data.count>1){
      this.setData({count:this.data.count - 1});
      //let price = this.data.detailData.price*this.data.count;
      //this.setData({price:price});
    }
    
  },
  //商品增加事件
  addTap: function(e){
    this.setData({count:this.data.count + 1});
    //let price = this.data.detailData.price*this.data.count;
    //this.setData({price:price});
  },
  //加入购物车点击事件
  addShopCartTap: function(isOnce){
    //isOnce 是否立即购买
    //获取商品规格
    if(!app.globalData.isAuth){
      wx.navigateTo({
        url: '../auth/auth',
      })
      return;
    }
    let rules = [];
    this.data.ruleList.forEach((item)=>{
      item.value.forEach((val)=>{
        if(val.isSelect){
          rules.push(val.v);
          return;
        }
      })
    })
    //加入购物车需要的参数：商品id,商品规格rule,商品数量
    let product = {
      id: this.data.detailData._id,//商品id
      count: this.data.count,//商品数量
      rule: rules.join('/')//商品规格
    }
    // console.log(product);
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name:'get_shopcart',
      data:product,
      success: res=>{
        wx.hideLoading();
        // console.log('购物车列表 res=>',res);
        if(res.result.data.length>0){
          let productId = res.result.data[0]._id;
          product.count = res.result.data[0].count + this.data.count;
          this.updateShopCart(product,isOnce,productId);
        }else{
          this.addShopCart(product,isOnce);
        }
      },
      fail: err =>{
        wx.hideLoading();
        console.log('购物车列表回调失败 err=>',err);
      }
    })
  },
  //加入购物车接口
  addShopCart: function(product,isOnce){
    wx.cloud.callFunction({
      name:'add_shopcart',
      data:product,
      success: res=>{
        wx.hideLoading();
        // console.log('加入购物车成功 res=>',res);
        //立即购买跳转到购买页面
        if(isOnce==1){
          wx.navigateTo({
            url: '../commit/commit?id=' + res.result._id,
          })
        }
      },
      fail: err =>{
        wx.hideLoading();
        console.log('加入购物车回调失败 err=>',err);
      }
    })
  },
  //更新购物车
  updateShopCart: function(product,isOnce,productId){
    wx.cloud.callFunction({
      name:'update_shopcart',
      data:product,
      success: res=>{
        wx.hideLoading();
        // console.log('购物车更新成功 res=>',res);
        //立即购买跳转到购买页面
        if(isOnce ==1){
          wx.navigateTo({
            url: '../commit/commit?id=' + productId,
          })
        }
      },
      fail: err =>{
        wx.hideLoading();
        console.log('购物车更新失败 err=>',err);
      }
    })
  },
  //立即购买
  buy: function(){
    if(!app.globalData.isAuth){
      wx.navigateTo({
        url: '../auth/auth',
      })
      return;
    }
    this.addShopCartTap(1);
  }
})