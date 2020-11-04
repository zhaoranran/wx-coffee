//import WxValidate from "../../utils/WxValidate";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressId:'',
    addressData:{
      userName:'',
      sex:'男',
      phone:'',
      address:'请输入地址',
      houseNum:'',
      tag:'公司',
      //非默认为：0，默认为：1
      default:false
    },
    sexList:[
      {isSelect:true,title:'男'},
      {isSelect:false,title:'女'}
    ],
    tagList:[
      {isSelect:true,title:'公司'},
      {isSelect:false,title:'家'},
      {isSelect:false,title:'学校'}
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.initValidate();
    if(options.id){
      this.getAddresData(options.id);
      this.setData({
        addressId: options.id
      })
      wx.setNavigationBarTitle({
        title: '编辑地址',
      })
    }
  },
  getAddresData: function(id){
    wx.showLoading({
      title: '加载中...',
    });
    wx.cloud.callFunction({
      name:'get_address',
      data:{
        id:id
      },
      success: res=>{
        wx.hideLoading();
        console.log(res);
        delete res.result.data[0]._id;
        this.setData({
          addressData:res.result.data[0]
        });
        console.log('dele ',this.data.addressData);
        this.data.sexList.forEach((item)=>{
          if(item.title == this.data.addressData.sex){
            item.isSelect = true;
          }else{
            item.isSelect = false;
          }
        })
        this.data.tagList.forEach((item)=>{
          if(item.title == this.data.addressData.tag){
            item.isSelect = true;
          }else{
            item.isSelect = false;
          }
        })
        this.setData({
          sexList: this.data.sexList
        })
        this.setData({
          tagList: this.data.tagList
        })
      },
      fail: err=>{
        wx.hideLoading();
        console.log('获取地址信息失败 err=>',err);
      }
    })
  },
  //性别标签切换
  sexChecked: function(e){
    // console.log(e.currentTarget.dataset);
    this.toggleChecked(e,'sex');
  },
  //标签切换
  tagChecked: function(e){
    this.toggleChecked(e,'tag');
  },
  //标签切换
  toggleChecked: function(e,key){
    let dataset = e.currentTarget.dataset,
    list = this.data[key+'List'];
    // console.log(list);
    //如果当前选中，不做任何处理
    if(dataset.isSelect){
      return;
    }
    //清除之前选中的
    list.forEach((item)=>{
      if(item.isSelect){
        item.isSelect = false;
      }
    });
    //设置当前选中
    list[dataset.index].isSelect = true;
    this.data.addressData[key] = list[dataset.index].title;
    this.setData({
      addressData:this.data.addressData
    });
    if(key == 'sex'){
      this.setData({
        sexList:this.data.sexList
      });
    }else if(key == 'tag'){
      this.setData({
        tagList: this.data.tagList
      });
    }
  },
  //设置默认地址点击事件
  defaultTap: function(e){
    // let nowDefault = !e.currentTarget.dataset.isSelect;
    this.data.addressData.default = !e.currentTarget.dataset.isSelect;
    this.setData({
      addressData : this.data.addressData
    })
  },
  initValidate: function(){
    const rules = {
      userName:{
        required:true,
      },
      phone:{
        required:true,
        tel:true,
      },
      address:{
        required:true,
      },
      houseNum:{
        required:true,
      }
    };
    const message = {
      userName:{
        required:'请输入您的称呼'
      },
      phone:{
        required:'请输入您的手机号',
        tel:'请输入正确的手机号'
      },
      address:{
        required:'请输入地址',
      },
      houseNum:{
        required:'请输入门牌号',
      }
    };
    this.WxValidate = new WxValidate(rules, message);
    console.log(this.WxValidate);
  },
  formChange(e){
    let dataset = e.currentTarget.dataset;
    this.data.addressData[dataset.name] = e.detail.value;
    //手机号码的验证
    if(dataset.name == 'phone'){
      var phoneReg = /^1[3456789]\d{9}$/
      if(!phoneReg.test(e.detail.value)){
        this.showModal({msg:'手机号格式不正确'});
        this.data.addressData.phone = '';
      }
    }else if(dataset.name == 'address'){
    
      this.data.addressData.address = e.detail.value.join('');
    }
    this.setData({
      addressData:this.data.addressData
    });
    // console.log(this.data.addressData);
  },
  //判断是否存在默认地址
  getDefultAddress: function(){
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name:'get_default_address',
      success: res=>{
        wx.hideLoading();
        if(res.result.data.length>0){
          // console.log('存在默认地址');
          this.updateDefaultAddress();
        }else{
         this.addAddress();
        }
      },
      fail: err=>{
        wx.hideLoading();
        console.log('获取默认地址数据失败 err=>',err);
        
      }
    })
  },
  //修改默认地址
  updateDefaultAddress: function(){
    wx.cloud.callFunction({
      name:'update_default_address',
      success: res=>{
        // console.log(res);
        if(this.data.addressId){
          this.updateAddress();
        }else{
          this.addAddress();
        }
        
      },
      fail: err=>{
        console.log('修改默认地址 err=>',err);
      }
    })
  },
  //修改地址
  updateAddress: function(){
    wx.showLoading({
      title: '加载中...',
    });
    wx.cloud.callFunction({
      name:'update_address',
      data:{
        id:this.data.addressId,
        address:this.data.addressData
      },
      success: res=>{
        wx.hideLoading();
        // console.log('修改地址成功 res=>',res);
        if(res.result.stats.updated == 1){
          wx.navigateTo({
            url: '../address/address',
          })
        }
      },
      fail: err=>{
        wx.hideLoading();
        console.log('修改地址失败 err=>',err);
      }
    })
  },
  //新增地址
  addAddress: function(){
    wx.cloud.callFunction({
      name:'address',
      data:this.data.addressData,
      success: res=>{
        wx.hideLoading();
        this.showModal({
          msg: '提交成功'
        })
        console.log(res);
        wx.navigateTo({
          url: '../address/addres',
        })
      },
      fail: err=>{
        wx.hideLoading();
        console.log('新增地址失败 err=>',err);
      }
    })
  },
  submitForm(e){
    let rulesMsg = {
      userName: {
        value: '',
        msg: '联系人不能为空'
      },
      phone: {
        value: '',
        msg: '手机号不能为空'
      },
      address: {
        value: '请输入地址',
        msg: '请填写地址'
      },
      houseNum: {
        value: '',
        msg: '门牌号不能为空'
      }
    };
    for(var key in rulesMsg){
      if(rulesMsg[key].value == this.data.addressData[key]){
        this.showModal({msg:rulesMsg[key].msg});
        return;
      }
    };
    if(this.data.addressId){
      if(this.data.addressData.default){
        this.getDefultAddress();
      }else{
        this.updateAddress();
      }
    }else{
      if(this.data.addressData.default){
        this.getDefultAddress();
      }else{
        wx.showLoading({
          title: '加载中...',
        })
        this.addAddress();
      }
    }
    
    
  },
  showModal(error){
    wx.showToast({
      title: error.msg,
      icon:'none',
      duration:2000
    })
  }
  
})