// pages/radarring/radarring.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRadar: true,
    cardListArr: [{},
      {},
      {},
      {},
    ],
    radarList: {
      Data: [],
      Page: {}
    },
    testArr: [],
    btmArr: [{
      Amount: 3170,
      Avatar: "http://image.dtoao.com/201810261055233940.jpg",
      Name: "wc201810261055246403",
      Rank: 1,
      Type: 1,
      UserID: "01f1704d-fd1f-409d-a3d1-eb23f2fd6415",
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;

    this.getRadarList().then((res) => {
      let radarList = that.data.radarList
      radarList.Data.push(...res.data.Result.Data)
      radarList.Page = res.data.Result.Page
      that.setData({
        radarList,
        userInfo: app.globalData.userInfo
      })
    })

    let query = wx.createSelectorQuery();
    query.select('.radar').boundingClientRect(function(rect) {
      console.log(rect)
      let testX = rect.width / 2;
      let testY = rect.height / 2;
      console.log(testX, testY)
      that.setData({
        testX,
        testY
      })
      wx.showLoading({
        title: '正在加载中',
        mask: true
      })
      let r = rect.width / 2;
      let xCenter = testX;
      let yCenter = testY;
      console.log({
        r: r,
        x: xCenter,
        y: yCenter
      })
      var myIndex = -1;
      that.getRadarList(1, 100).then((res) => {
        // console.log(res)
        res.data.Result.Data.forEach((item, index, arr) => {
          let r1 = that.randomFrom(r * (2 / 5), r * 0.9);
          let a = that.randomFrom(0, 360);
          let x2 = (xCenter + r1 * Math.cos(a * Math.PI / 180)).toFixed(0)
          let y2 = (yCenter + r1 * Math.sin(a * Math.PI / 180)).toFixed(0)
          item.positionX = x2;
          item.positionY = y2;
          item.hidden = true;
          if (item.UserID == app.globalData.userInfo.UserID) {
            myIndex = index;
          }
        })
        if (myIndex >= 0) {
          res.data.Result.Data.splice(myIndex, 1);
        }
        that.setData({
          testArr: res.data.Result.Data,
          totalSum: res.data.Result.Page.TotalItemCount
        }, () => {
          wx.hideLoading()
        })
        let i = 0
        let maxShow = 15
        maxShow = maxShow < res.data.Result.Page.TotalItemCount ? maxShow : (res.data.Result.Page.TotalItemCount - 1)
        setInterval(() => {
          let item = res.data.Result.Data[i]
          if (i >= maxShow) {
            let itemb = res.data.Result.Data[i - maxShow]
            itemb.hidden = true;

          } else {
            let ii = res.data.Result.Data.length - maxShow + i
            let itemb = res.data.Result.Data[ii < 0 ? 0 : ii]
            itemb.hidden = true;
          }
          item.hidden = false
          i++;
          that.setData({
            testArr: res.data.Result.Data
          })

          if (i == res.data.Result.Data.length) {
            i = 0;
          }
        }, 1000)
      })
    }).exec();

    this.getVipAmount().then((res) => {
      let btmI = 0
      setInterval(()=>{
        let btmArr = that.data.btmArr
        btmArr[0] = res[btmI]
        that.setData({
          btmArr,
          isShow:false
        },()=>{
          that.setData({
            isShow:true
          })
        })
        btmI++
        if (btmI == res.length) {
          btmI = 0
        }
      },2000)
    })

  },

  // 获取收入排行榜
  getVipAmount() {
    let that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.url + '/VipAmount/Top',
        method: 'get',
        data: {
          Page: 1,
          Type: 0,
          PageSize: 100,
        },
        success(res) {
          console.log(res)
          if (res.data.State == 'Success') {
            that.setData({
              incomeList: res.data.Result.Data
            }, () => {
              resolve(res.data.Result.Data)
            })
          }
        }
      })
    })

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
    let that = this
    this.getCardInfo().then((res) => {
      that.setData({
        State: res.data.State,
        cardDetail: res.data.Result,
      })
    })
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
    let that = this;
    if (!this.data.radarList.Page.HasNextPage) {
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.getRadarList(++this.data.radarList.Page.PageNumber).then((res) => {
      let radarList = that.data.radarList
      radarList.Data.push(...res.data.Result.Data)
      radarList.Page = res.data.Result.Page
      that.setData({
        radarList
      }, () => {
        wx.hideLoading()
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let that = this
    return {
      title: '脉乐圈',
      path: '/pages/test1/test1?PCardID=' + that.data.cardDetail.PCardID // 路径，传递参数到指定页面。
    }
  },

  // 雷达列表切换
  onSwitch() {
    this.setData({
      isRadar: !this.data.isRadar
    })
  },

  // 获取雷达名片列表
  getRadarList(Page, PageSize) {
    let that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.url + 'CardPersonal/HomeList',
        method: 'get',
        data: {
          Page: Page || 1,
          PageSize: PageSize || 10
        },
        success(res) {
          if (res.data.State == 'Success') {
            resolve(res)
            console.log(res)
          }
        }
      })
    })

  },

  // 雷达圈显示与隐藏
  timeout(sum) {
    let that = this
    return new Promise((resolve, reject) => {
      for (var i = 0; i < sum.length; i++) {
        (function(i) {
          setTimeout(function() {
            console.log(i)
            if (i + 1 == sum.length) {
              resolve(that.timeout(sum))
            }
            let testArr = that.data.testArr
            if (testArr.length >= 10) {
              testArr.splice(0, 1)
            }
            sum[i].positionX = that.randomFrom(1, that.data.radarWidth)
            sum[i].positionY = that.randomFrom(1, that.data.radarWidth)
            testArr.push(sum[i])
            that.setData({
              testArr,
            })
            console.log(that.randomFrom(1, 343))
          }, i * 1000);
        })(i);
      }
    })

  },

  // 获取随机数
  randomFrom(lowerValue, upperValue) {
    return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
  },

  // 获取用户手机号
  getUserPhone(e) {
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      app.globalData.userInfo.iv = e.detail.iv;
      app.globalData.userInfo.encryptedData = e.detail.encryptedData
      wx.request({
        url: app.globalData.url + 'Account/GetPhoneNumberFromWeChat',
        method: 'get',
        data: {
          UserID: app.globalData.userInfo.UserID,
          IV: e.detail.iv,
          EncryptedData: e.detail.encryptedData
        },
        success(res) {
          if (res.data.State == 'Success') {
            wx.navigateTo({
              url: '/pages/invite/invite?phone=' + res.data.Result + '&url=2',
            })
          }
          console.log(res)
        }
      })
    }
  },

  // 获取个人中心状态
  getCardInfo() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.url + 'CardPersonal/GetCardInfo',
        method: 'get',
        data: {
          UserID: app.globalData.userInfo.UserID
        },
        success(res) {
          console.log(res)
          if (res.data.State == 'PCardNoFound' || res.data.State == 'Success') {
            resolve(res)
          }
        }
      })
    })
  },

})