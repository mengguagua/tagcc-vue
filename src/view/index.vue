<template lang="pug">
  div(style="padding: 48px 120px")
    div.position
      Button(v-if="token") {{nickname}}
      span &nbsp;&nbsp;
      Button(v-if="token" @click="loginOut") 退出
      Button(v-else @click="loginShow") 登录
    div
      Button.button(icon="md-sync" @click="loadData") Refresh
      span &nbsp;&nbsp;
      Button.button(icon="md-add" @click="add()") Add
      Upload(action="share/content/upload")
        Button(icon="ios-cloud-upload-outline") Upload files
    Row
      Col(span="12")
        List
          ListItem(avatar="" title="" description="")
            span.list-title {{ headTitle }}
          ListItem(v-for="(item,index) in contentData" :key="index" :avatar="item.icon" title="" description="") {{ item.urlName }}&nbsp;&nbsp;&nbsp;&nbsp;
            template(slot="extra")
              Button(shape="circle" @click="goUp(item)") 推一把
              span &nbsp;&nbsp;
              Button(shape="circle" icon="md-paw" @click="goUrl(item)")
              span &nbsp;&nbsp;
              Button(shape="circle" icon="md-close" @click="remove(item)")
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
    Modal(v-model="loginModal", title="Login" width="400")
      Form(:label-width='80')
        FormItem(label="用户名")
          Input(v-model='loginData.username', placeholder="用户名")
        FormItem(label="密码")
          Input(v-model='loginData.password', placeholder="密码")
      template(slot="footer")
        Button(@click="login", :loading="loading"  type="primary" :disabled="loading") 确定
</template>

<script>
import md5 from 'md5'
import { cookie } from '../libs/common'
export default {
  name: 'HelloWorld',
  data () {
    return {
      token: cookie('token') || '',
      nickname: cookie('nickname') || '',
      headTitle: '常用链接',
      allData: [],
      contentData: [],
      showModal: false,
      loginModal: false,
      loading: false,
      total: 0,
      pageSize: 20,
      startPage: 1,
      formData: {
        url: '',
        urlName: ''
      },
      loginData: {
        username: '',
        password: ''
      }
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    loadData () {
      this.axios.get('share/content/query').then((resp) => {
        this.total = resp.length
        this.allData = resp
        this.changePage(this.startPage)
        // this.contentData = resp.slice(0, this.pageSize)
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
    loginShow () {
      this.loginModal = true
    },
    loginOut () {
      this.$cookie.delete('token')
      this.$cookie.delete('nickname')
      location.reload();
    },
    login () {
      this.loading = true
      Object.assign(this.loginData, {password: md5(this.loginData.password)})
      this.axios.post('base/login', {
        ...this.loginData
      }).then((resp) => {
        this.$cookie.set('token', resp.token, 1)
        this.$cookie.set('nickname', resp.user.nickname, 1)
        location.reload();
      })
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
        content: '<h4>tip：请主人再次确认<h4/>',
        onOk: () => {
          this.axios.post('share/content/one/delete', {
            id: ret.id
          }).then(() => {
            this.loadData()
            this.$Message.success('success')
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
