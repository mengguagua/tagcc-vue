<template lang="pug">
  div(style="padding: 48px 120px")
    div
      Button.button(icon="md-sync") Refresh
      span &nbsp;&nbsp;
      Button.button(icon="md-add" @click="add()") Add
      Upload(action="share/content/content/upload")
        Button(icon="ios-cloud-upload-outline") Upload files
    Row
      Col(span="12")
        List
          ListItem(avatar="" title="" description="")
            span.list-title {{ headTitle }}
          ListItem(v-for="(item,index) in contentData" :key="index" :avatar="item.icon" title="" description="") {{ item.urlName }}&nbsp;&nbsp;&nbsp;&nbsp;
            template(slot="extra")
              Button(shape="circle" icon="ios-paw" @click="goUrl(item.url)") 前往
              span &nbsp;&nbsp;
              Tag(type="border" closable @on-close="remove(item)" color="volcano") 删除
      Col(span="12") &nbsp;
    Modal(v-model="showModal", title="Add" width="800")
      Form(:label-width='80')
        FormItem(label="URL")
          Input(v-model='formData.url', placeholder="URL")
        FormItem(label="描述")
          Input(v-model='formData.urlName', placeholder="描述")
      template(slot="footer")
        Button(@click="submit", :loading="loading"  type="primary" :disabled="loading") 确定
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      headTitle: '常用链接',
      contentData: [],
      showModal: false,
      loading: false,
      formData: {
        url: '',
        urlName: ''
      }
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    loadData () {
      this.axios.get('share/content/query').then((resp) => {
        this.contentData = resp
      }).catch((response) => {
        console.log(response)
      })
    },
    goUrl (url) {
      window.open(url)
    },
    add () {
      this.showModal = true
    },
    submit () {
      this.axios.post('share/content/one/add', {
        ...this.formData
      }).then(() => {
        this.loadData()
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
  .list-title{
    font-size: 14px;
    font-weight: 500;
  }
  .button{
    margin-bottom: 12px;
  }
</style>
