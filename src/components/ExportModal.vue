<template>
  <div class="modal" v-if="popup">
    <div class="modal-content">
      <div class="modal-head">
        <h2>Export</h2>
        <a class="close-btn" @click="closeModal">close <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg></a>
      </div>

      <div class="modal-body">
        <textarea class="generated-html-body" v-model="raw_html" @focus="$event.target.select()">
        </textarea>
      </div>

      <div class="modal-foot">
        <a class="btn" @click="copyToClipboard">
          <span v-if="copySucceeded !== true">Copy Code</span>
          <span v-if="copySucceeded === true">Copied!</span>
        </a>
      </div>
    </div>

    <div class="modal-bg"></div>
  </div>
</template>

<script>
export default {
  name: "ExportModal",

  props: {
    popup: null,
    raw_html: null
  },

  data() {
    return {
      copySucceeded: null
    };
  },

  computed: {},

  methods: {
    openModal() {
      this.$emit('toggleExportModal', 1);
      this.copySucceeded = null;
    },
    closeModal() {
      this.copySucceeded = false;
      this.$emit('toggleExportModal', 0);
    },
    copyToClipboard() {
      let _this = this;
      this.$copyText(this.raw_html).then(function() {
        _this.copySucceeded = true;
      }, function() {
        _this.copySucceeded = false;
      });
    }
  }
};
</script>
<style lang="scss">
.generated-html-body{
  height: 300px;
  overflow: auto;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #eee;
  background-color: #f4f4f4;
  width: 100%;
  box-sizing: border-box;
  color: #162c6f;
  font-family: monospace;
}
</style>