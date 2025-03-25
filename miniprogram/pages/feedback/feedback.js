const { init } = require('@cloudbase/wx-cloud-client-sdk')
var app = getApp()
  // 指定云开发环境 ID
  wx.cloud.init({
    env: app.globalData.envParams,
  })
  const client = init(wx.cloud)
  const models = client.models
Page({

  /**
   * 页面的初始数据
   */
  data:{
  
    feedbackText:'',
    chooseImgsPath:[],
    index:'1',
  
  
  },
  getindex(e){
  
    this.setData(
      {
        index:e.currentTarget.dataset.index
      }
    )
  },
  async submit(){
    const { data } = await models.feedback.create({
      data: {
          content: this.data.feedbackText,  // content
        },
      // envType: pre 体验环境， prod 正式环境
      envType: "pre",
    });
    
    // 返回创建的数据 id
    console.log(data);
    // { id: "7d8ff72c665eb6c30243b6313aa8539e"}
  },
  onInputFeedback(ev) {
    this.setData({feedbackText:ev.detail.value});
  },
  onTapChooseImg(ev) {
    wx.chooseImage({
      // 同时选中的图片数量
      count:9,
      // 图片压缩  original原图  compressed压缩
      sizeType:['original', 'compressed'],
      // 图片来源  album相册  camera照相机
      sourceType:['album', 'camera'],
      success:result => {
        console.log('选择的图片', result);
        // 拼接选择的图片的数组
        this.setData({chooseImgsPath:[...this.data.chooseImgsPath, ...result['tempFilePaths']]});
      },
      fail:err => {},
      complete:() => {}
    });
  },
  onTapRemoveImg(ev) {
    const {index} = ev.currentTarget.dataset;
    let {chooseImgsPath} = this.data;
    chooseImgsPath.splice(index, 1);
    this.setData({chooseImgsPath});
  },
 onTapSubmit(ev) {
    // 校验表单
    let feedbackText = this.data.feedbackText;
    if (feedbackText=='') {
      wx.showToast({title:'请输入您要反馈的问题', icon:'none', mask:true});
      return;
    }
    // if (chooseImgsPath.length > 0) {
    //   // 暂时不做图片上传功能
    //   return;
    //   // 上传图片
    //   chooseImgsPath.forEach((val, i, self) => {
    //     wx.uploadFile({
    //       // 文件上传地址
    //       url:'',
    //       // 被上传的文件路径
    //       filePath:val,
    //       // 文件的字段名称
    //       name:'file',
    //       // 顺带的文本信息
    //       formData:{},
    //       success:result => {
    //         console.log(result);
    //         let url = JSON.parse(result['data']);
    //       },
    //       fail:err => {},
    //       complete:() => {
    //         wx.navigateBack({delta:1});
    //       }
    //     });
    //   });
     else {
    this.submit()
      
      
      // 返回到上一个页面
   wx.navigateBack({delta:1});
    }
    wx.showToast({
        title: '提交成功！',
        duration:2000,
        mask:true
      })
  }
});