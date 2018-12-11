// pages/editimages/editimages.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    FileFullUrls: [],
    FileUrls: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCardInfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  // 选择图片
  onSwiperimages() {
    console.log(this.data.cardDetail.Images)
    let that = this;
    
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        console.log(res)
        wx.uploadFile({
          url: app.globalData.url + 'Uploader/Upload',
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            'server': '1'
          },
          success(res) {
            let str = JSON.parse(res.data)
            let cardDetail = that.data.cardDetail
            let FileUrls = that.data.FileUrls;
            if (str.State == 'Success') {
              FileUrls.push(str.Result.FileUrls[0])
              cardDetail.Images.push(str.Result.FileFullUrls[0])
              that.setData({
                cardDetail,
                FileUrls
              })
              console.log(str)
            }
          }
        })
      },
    })
  },

  // 删除选中图片
  onDelImg(e) {
    let index = e.currentTarget.dataset.index
    let cardDetail = this.data.cardDetail
    let FileUrls = this.data.FileUrls
    cardDetail.Images.splice(index, 1);
    FileUrls.splice(index, 1);
    this.setData({
      cardDetail,
      FileUrls
    })
  },

  // 获取名片详情信息
  getCardInfo() {
    let that = this
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.url + 'CardPersonal/GetCardInfo',
        method: 'get',
        data: {
          UserID: app.globalData.userInfo.UserID
        },
        success(res) {
          if (res.data.State == 'Success') {
            that.setData({
              cardDetail: res.data.Result,
              FileUrls:res.data.Result.Images
            })
          }
        }
      })
    })
  },

  // 改变图片介绍
  onChangeimages() {
    let that = this
    // if (this.data.cardDetail.Images.length == 0) {
    //   return
    // }
    wx.request({
      url: app.globalData.url + 'CardPersonal/EditCardInfo',
      method: 'post',
      data: {
        UserID: app.globalData.userInfo.UserID,
        PCardID: that.data.cardDetail.PCardID,
        Images: that.data.FileUrls.length == 0 ? [""] : that.data.FileUrls
      },
      success(res) {
        if (res.data.State == 'Success') {
          wx.showToast({
            title: '修改成功',
            success() {
              setTimeout(()=>{
                wx.navigateBack({
                  delta: 1
                })
              },1500)
            }
          })
         
        }
      }
    })
    console.log(12345)
  }
})