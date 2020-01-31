<template>
  <div class="modal" v-if="popup">
    <div class="modal-content">
      <div class="modal-head">
        <h2>Import</h2>

        <a class="close-btn" @click="closeModal">close <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg></a>
      </div>

      <div class="modal-body">
        <div v-if="!importByCsv">
          <label>Paste the code to below field</label>
          <textarea class="generated-html-body" v-model="raw_html">
          </textarea>
        </div>
        <div v-if="importByCsv">
          <label>Upload the csv file</label>
          <input type="file" id="input" @change="handleCsv($event)">
          <br>
          <br>
          <br>
        </div>
      </div>

      <div class="modal-foot">
        <a class="btn" @click="importCode">
          <span>Import</span>
        </a>
        <br>
        <div>
          <a v-if="!importByCsv" @click="importByCsv = true;">Import by CSV file</a>
          <a v-if="importByCsv" @click="importByCsv = false;">Import by code</a>
        </div>
      </div>
    </div>

    <div class="modal-bg"></div>
  </div>
</template>

<script>
export default {
  name: "ImportModal",

  props: {
    popup: null
  },

  data() {
    return {
      raw_html: null,
      importByCsv: false
    };
  },

  computed: {},

  methods: {
    openModal() {
      this.$emit('toggleImportModal', 1);
    },
    closeModal() {
      this.raw_html = null;
      this.$emit('toggleImportModal', 0);
    },
    handleCsv(e) {
      let _this = this;
      if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        let reader = new FileReader();
        reader.readAsText(e.target.files[0]);
        reader.onload = function(event){
          let csv = event.target.result;
          _this.raw_html = csv;
          _this.importCode();
        };
      }
      else {
        alert('This browser does not support local file reading.');
      }
    },
    importCode() {
      let search = this.raw_html.match(/tasrc\:(.+)\%\-\-\>/);
      if(search) {
        let data = JSON.parse(decodeURIComponent(escape(atob(search[1]))));

        this.$emit('onImport', data);
      }
      else {
        let csv_search = this.raw_html.match(/(\,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\,\r\n]*))/g);
        if(csv_search) {
          let totalCols = 3;
          let receivedStages = [];
          let data = {
            stages: [],
            blocks: [],
            blocksOrdering: []
          };
          let rawData = [];
          let pointer = -1;
          for(let i in csv_search) {
            if((i + totalCols) % totalCols == 0) {
              pointer++;
            }
            let value = csv_search[i].replace(/\n|\r\n/, '').replace(/^,/, '').replace(/^"/, '').replace(/"$/, '');
            if(value.length == 0) {
              continue;
            }
            if(!rawData[pointer]) {
              rawData[pointer] = [value];
            }
            else {
              rawData[pointer].push(value);
            }
          }
          rawData.shift();
          for(let j in rawData) {
            j = parseInt(j);
            let block = rawData[j];
            if(receivedStages.indexOf(block[0]) === -1) {
              receivedStages.push(block[0]);
              data.stages.push({
                id: receivedStages.indexOf(block[0]) + 1,
                name: block[0]
              });
              data.blocksOrdering[receivedStages.indexOf(block[0]) + 1] = [];
            }
            data.blocks.push({
              id: j + 1,
              title: block[1],
              teaser: block[2],
              stageref: receivedStages.indexOf(block[0]) + 1,
              type: "text",
              style: "-default",
              bgcolor: "white",
              txtcolor: "#005EB8"
            });
            data.blocksOrdering[receivedStages.indexOf(block[0]) + 1].push(j + 1);
          }

          this.$emit('onCsvImport', data);
        }
        else {
          console.log('no data');
        }
      }
    }
  }
};
</script>
<style lang="scss">

</style>