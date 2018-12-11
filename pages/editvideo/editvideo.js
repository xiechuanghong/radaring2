// pages/editvideo/editvideo.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    this.getCardInfo()
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

  // 选择视频
  onSwiperVideo() {
    let that = this;
    wx.chooseVideo({
      success(res) {
        wx.showLoading({
          title: '正在上传中',
        })
        wx.uploadFile({
          url: app.globalData.url + 'Uploader/Upload',
          filePath: res.tempFilePath,
          name: 'file',
          formData: {
            'server': '1'
          },
          success(res) {
            let str = JSON.parse(res.data)
            let cardDetail = that.data.cardDetail
            console.log(str)
            if (str.State == 'Success') {
              cardDetail.Video = str.Result.FileFullUrls[0]
              that.setData({
                cardDetail
              }, () => {
                wx.hideLoading()
                wx.showToast({
                  title: '上传成功',
                  icon: 'none'
                })
              })
            }
          },
          fail() {
            wx.hideLoading()
            wx.showToast({
              title: '上传失败 请重新上传',
              icon: 'none'
            })
          }
        })
        console.log(res)
      }
    })
    console.log(12345)
  },

  //改变名片详情视频
  onChangeVideo() {
    let that = this
    // if (!this.data.cardDetail.Video) {
    //   return
    // }
    wx.request({
      url: app.globalData.url + 'CardPersonal/EditCardInfo',
      method: 'post',
      data: {
        UserID: app.globalData.userInfo.UserID,
        PCardID: that.data.cardDetail.PCardID,
        Video: that.data.cardDetail.Video
      },
      success(res) {
        if (res.data.State == 'Success') {
          wx.showToast({
            title: '修改成功',
            success() {
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1
                })
              }, 1500)
            }
          })
        }
      }
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
            })
          }
        }
      })
    })
  },

  // 删除视频
  onDel() {
    let that = this;
    let cardDetail = this.data.cardDetail
    cardDetail.Video = ''
    this.setData({
      cardDetail
    }, () => {
      wx.request({
        url: app.globalData.url + 'CardPersonal/EditCardInfo',
        method: 'post',
        data: {
          UserID: app.globalData.userInfo.UserID,
          PCardID: that.data.cardDetail.PCardID,
          Video: ' '
        },
        success(res) {
          if (res.data.State == 'Success') {
            wx.showToast({
              title: '删除成功',
              icon: 'none'
            })
          }
        }
      })
    })
  }
})