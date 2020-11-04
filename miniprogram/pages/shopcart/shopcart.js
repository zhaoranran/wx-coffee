// miniprogram/pages/shopcart/shopcart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopcartList:[],
    //是否全选
    isAllSelect: false,
    //是否显示管理
    isManage: false,
    //合计钱数
    total:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  onShow: function(){
    this.setData({
      shopcartList:[]
    })
    this.getShopcartData();
  },
  //获取购物车列表
  getShopcartData: function(){
    wx.showLoading({
      title: '加载中...'
    });
    wx.cloud.callFunction({
      name:'get_shopcart_byuser',
      success: res=>{
        wx.hideLoading();
        // console.log('购物车列表 res=>',res);
        //过滤相同的id
        let ids = [],
            data = res.result.data;
            data.forEach(item=>{
              if(ids.indexOf(item.id) == -1){
                ids.push(item.id)
              }
              item.isSelect = false;
            })
            // console.log(ids);
            this.setData({
              shopcartList:res.result.data
            })
            this.getProductData(ids);
      },
      fail: err=>{
        wx.hideLoading();
        console.log('获取购物车列表失败 err=>',err);
      }
    })
  },
  //根据ids获取商品详情类别
  getProductData: function(ids){
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name:'get_product_byid',
      data:{
        ids: ids
      },
      success: res=>{
        wx.hideLoading();
        // console.log('商品详情列表 res=>',res)
        let productList =res.result.data;
        // console.log('shopcartList=>',this.data.shopcartList);
        this.data.shopcartList.forEach(i=>{
          productList.forEach(j=>{
            if(i.id == j._id){
              i.small_img = j.small_img;
              i.name = j.name;
              i.price = j.price;
              return false;
            }
          })
        })
        this.setData({
          shopcartList: this.data.shopcartList
        })
      },
      fail: err=>{
        wx.hideLoading();
        console.log('获取商品详情列表失败 err=>',err)
      }
    })
  },
  //单选
  toggleChecked: function(e){
    let dataset = e.currentTarget.dataset;
    this.data.shopcartList[dataset.index].isSelect = !dataset.isSelect;
    
    this.setData({
      shopcartList: this.data.shopcartList
    })
    let isHas = false;
    this.data.shopcartList.forEach(item=>{
      if(!item.isSelect){
        this.data.isAllSelect = false;
        isHas = true;
        return false;
      }
    })
    if(!isHas){
      this.data.isAllSelect = true;
    }
    this.setData({
      isAllSelect: this.data.isAllSelect
    })
    this.getTotal();
  },
  //全选
  toggleAll: function(){
    this.setData({
      isAllSelect: !this.data.isAllSelect
    });
    this.data.shopcartList.forEach(item=>{
      item.isSelect = this.data.isAllSelect;
    })
    this.setData({
      shopcartList: this.data.shopcartList
    })
    this.getTotal();
  },
  //商品数量增加
  addTap: function(e){
    let dataset = e.currentTarget.dataset
    this.data.shopcartList[dataset.index].count  = this.data.shopcartList[dataset.index].count + 1;
    this.setData({
      shopcartList: this.data.shopcartList
    })
    this.updateShopcartCount(dataset.id,this.data.shopcartList[dataset.index].count);
    this.getTotal();
    
  },
  //商品数量减少
  reduceTap: function(e){
    let dataset = e.currentTarget.dataset;
    this.data.shopcartList[dataset.index].count  = this.data.shopcartList[dataset.index].count - 1;
    if(this.data.shopcartList[dataset.index].count <=1){
      this.data.shopcartList[dataset.index].count = 1;
    }
    this.setData({
      shopcartList: this.data.shopcartList
    })
    this.updateShopcartCount(dataset.id,this.data.shopcartList[dataset.index].count);
    this.getTotal();
  },
  //修改数据库数量
  updateShopcartCount: function(id,count){
    wx.showLoading({
      title: '加载中...',
    });
    wx.cloud.callFunction({
      name:'update_shopcart_count',
      data:{
        id:id,
        count:count
      },
      success: res=>{
        wx.hideLoading();
        // console.log('修改数量成功 res=>',res);
      },
      fail: err=>{
        wx.hideLoading();
        console.log('修改数量失败 err=>',err);
      }
    })
  },
  //管理商品
  manageTap: function(){
    this.setData({
      isManage: !this.data.isManage
    })
  },
  //删除数据库商品
  removeShopcartProduct: function(ids,index){
    wx.showLoading({
      title: '加载中...'
    });
    wx.cloud.callFunction({
      name: 'remove_shopcart_byid',
      data: {
        ids: ids
      },
      success: res=>{
        wx.hideLoading();
        if(index != undefined){
          this.data.shopcartList.splice(index,1);
          // console.log('删除成功 res=>',res);
        }else{
          for(let i=this.data.shopcartList.length-1;i>=0;i--){
            if(this.data.shopcartList[i].isSelect){
              this.data.shopcartList.splice(i,1)
            }
          }
        }
        this.setData({
          shopcartList: this.data.shopcartList
        })

        this.getTotal();
      },
      fail: err=>{
        wx.hideLoading();
        console.log('删除失败 err=>',err);
      }
    })
  },
  //删除单个购物车商品
  removeOneProduct: function(e){
    let dataset = e.currentTarget.dataset,
        ids = [dataset.id],
        index = dataset.index;
    this.removeShopcartProduct(ids, index);
  },
  //删除选中的购物车商品
  removeSelectProduct: function(){
    let ids = [];
    this.data.shopcartList.forEach(item=>{
      if(item.isSelect){
        ids.push(item._id)
      }
    })
    if(ids.length == 0){ 
      wx.showToast({
        title: '请选择要删除的商品',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    this.removeShopcartProduct(ids);
  },
  //应付金额
  getTotal: function(){
    let total = 0;
    this.data.shopcartList.forEach(item=>{
      if(item.isSelect){
        total += item.count*item.price
      }
    })
    this.setData({
      total:total
    })
  },
  //去结算
  pay: function(){
    let ids = [];
    this.data.shopcartList.forEach(item=>{
      if(item.isSelect){
        ids.push(item._id)
      }
    })
    if(ids.length == 0){
      wx.showToast({
        title: '请选择要购买的商品',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    wx.navigateTo({
      url: '../commit/commit?id=' + ids.join('@'),
    })
  }
})