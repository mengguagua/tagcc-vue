<template lang="pug">
  div(style="padding: 48px 120px")
    div.position
      Button(v-if="token") {{nickname}}
      span &nbsp;&nbsp;
      Button(v-if="token" @click="loginOut") 退出
      div(v-else)
        Button( @click="loginShow") 登录
        span &nbsp;&nbsp;
        Button( @click="registerShow") 注册
    div
      Button.button(icon="md-sync" @click="loadData") Refresh
      span &nbsp;&nbsp;
      Button.button(icon="md-add" @click="add()") Add
      Upload(action="share/content/upload" v-if="token")
        Button(icon="ios-cloud-upload-outline") Upload files
    Row
      Col(span="12")
        List
          ListItem(avatar="" title="" description="")
            span.list-title {{ headTitle }}
          ListItem(v-for="(item,index) in contentData" :key="index" :avatar="item.icon" title="" description="") {{ item.urlName }}&nbsp;&nbsp;&nbsp;&nbsp;
            template(slot="extra")
              Button(shape="circle" @click="goUp(item)") 顶
              span &nbsp;&nbsp;
              Button(v-if="token" shape="circle" icon="ios-people" @click="share(item)") 公开
              span &nbsp;&nbsp;
              Button(shape="circle" icon="md-paw" @click="goUrl(item)")
              span &nbsp;&nbsp;
              Button(v-if="token" shape="circle" icon="md-close" @click="remove(item)")
        Page(:total="total" size="small" :page-size="pageSize" @on-change="changePage")
      Col(span="12") &nbsp;
    Modal(v-model="showModal", title="Add" width="800")
      Form(:label-width='80')
        FormItem(label="URL")
          Input(v-model='formData.url', placeholder="URL")
        FormItem(label="描述")
          Input(v-model='formData.urlName', placeholder="描述")
      template(slot="footer")
        Button(@click="submit", :loading="loading"  type="primary" :disabled="loading") 确定
    Modal(v-model="userModal", title="Login" width="400")
      Form(:label-width='80')
        FormItem(label="邮箱" required)
          Input(v-model='userData.username', placeholder="邮箱")
        FormItem(label="密码" required)
          Input(v-model='userData.password', placeholder="密码" type="password")
        FormItem(label="验证码" required, v-if="type === 'register'")
          Row
            Col(span="14")
              Input(v-model="userData.code" type="text" placeholder="验证码", :maxlength="6")
            Col(span="2" style="text-align: center") -
            Col(span="8")
              Button(v-if="time" disabled long) {{time}}s
              Button(v-else @click="getCode" long type="primary" ghost, :disabled="loading") 获取验证码
      template(slot="footer")
        Button(@click="doHandle", :loading="loading"  type="primary" :disabled="loading") 确定
</template>

<script>
import md5 from 'md5'
import { cookie } from '../libs/common'
export default {
  name: 'HelloWorld',
  data () {
    return {
      time: 0,
      token: cookie('token') || '',
      nickname: cookie('nickname') || '',
      headTitle: '常用链接',
      allData: [],
      contentData: [],
      showModal: false,
      type: 'login',
      userModal: false,
      loading: false,
      total: 0,
      pageSize: 20,
      startPage: 1,
      formData: {
        url: '',
        urlName: ''
      },
      userData: {
        username: '',
        password: '',
        code: '',
      }
    }
  },
  mounted () {
    this.loadData()
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--;
        }, 1000);
      }
    }
  },
  methods: {
    getCode() {
      this.loading = true
      !this.time &&
      this.axios.post("share/content/email/send", {
        to: this.userData.username,
      }).then((resp) => {
          this.loading = false
          if (resp.code === 0) {
            this.time = 60;
            this.$Message.success('success')
          }
        });
    },
    loadData () {
      this.axios.get('share/content/query').then((resp) => {
        this.total = resp.data.length
        this.allData = resp.data
        this.changePage(this.startPage)
        // this.contentData = resp.data.slice(0, this.pageSize)
      }).catch((resp) => {
        console.log(resp)
      })
    },
    changePage (index) {
      this.startPage = index
      let start = (index - 1) * this.pageSize
      let end = index * this.pageSize
      this.contentData = this.allData.slice(start, end)
    },
    goUrl (ret) {
      this.goUp(ret);
      window.open(ret.url)
    },
    add () {
      this.showModal = true
    },
    goUp (ret) {
      let data = this.contentData
      let newData = ''
      data.forEach((item, index) => {
        if (ret.id === item.id) {
          newData = data[index]
        }
      })
      // newData.weight = Number(data[0].weight) + 1
      newData.weight = Number(ret.weight) + 1
      this.axios.post('share/content/one/weight/update', {
        ...newData
      }).then(() => {
        this.loadData()
      })
    },
    share (ret) {
      this.$Modal.confirm({
        okText: '公开',
        content: '<h4>tip：确定公开给游客<h4/>',
        onOk: () => {
          this.axios.post('share/content/tourist/one/add', {
            ...ret
          }).then((resp) => {
            this.loadData()
            if (resp.code === 0) {
              this.$Message.success('success')
            }
          })
        },
        onCancel: () => {
          this.$Message.info('Clicked cancel')
        }
      })
    },
    loginShow () {
      this.type = 'login'
      this.userModal = true
    },
    registerShow () {
      this.type = 'register'
      this.userModal = true
    },
    loginOut () {
      this.$cookie.delete('token')
      this.$cookie.delete('nickname')
      location.reload();
    },
    doHandle () {
      this.loading = true
      if(this.type === 'login') {
        this.axios.post('base/login', {
          ...this.userData,
          password: md5(this.userData.password)
        }).then((resp) => {
          this.loading = false
          if (resp.code === 0) {
            this.$cookie.set('token', resp.data.token, 1)
            this.$cookie.set('nickname', resp.data.user.nickname, 1)
            location.reload();
          }
        })
      } else {
        this.axios.post('base/register', {
          ...this.userData,
          password: md5(this.userData.password)
        }).then((resp) => {
          this.loading = false
          if (resp.code === 0) {
            this.$Message.success('success')
            this.userModal = false
          }
        })
      }

    },
    submit () {
      this.loading = true
      this.axios.post('share/content/one/add', {
        ...this.formData
      }).then(() => {
        this.loadData()
        this.loading = false
        this.showModal = false
      })
    },
    remove (ret) {
      this.$Modal.confirm({
        okText: '删除',
        content: '<h4>tip：请再次确认<h4/>',
        onOk: () => {
          this.axios.post('share/content/one/delete', {
            id: ret.id
          }).then((resp) => {
            this.loadData()
            if (resp.code === 0) {
              this.$Message.success('success')
            }
          })
        },
        onCancel: () => {
          this.$Message.info('Clicked cancel')
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .list-title {
    font-size: 14px;
    font-weight: 500;
  }
  .button {
    margin-bottom: 12px;
  }
  .position {
    padding: 0px 0px 12px 0px;
  }
</style>
