<template>
  <div>
    <div class="app-header">
      <div>
        <div class="nav">
          <a href="#" @click="showEditor" class="linkEditor">Editor</a> |
          <a href="#" @click="showViewer" class="linkViewer">Viewer</a>
        </div>
        <div class="actions">
          <a href="#" @click="toggleImportModal(1)" class="btn btn-import">Import</a>
          <a href="#" @click="exportCode" class="btn">Export</a>
          <a href="#" title="Enter Fullscreen" @click="requestFullscreen" class="icon-btn" v-if="!fullScreenMode"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg></a>
          <a href="#" title="Exit Fullscreen" @click="exitFullscreen" class="icon-btn" v-if="fullScreenMode"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg></a>
        </div>
      </div>
    </div>

    <kanban-board
      id="logic-model-app"
      :connections="connections"
      @updateConnections="updateConnections"
      ref="KanbanBoard">
    </kanban-board>

    <export-modal @toggleExportModal="toggleExportModal" :popup="exportModelShown" :raw_html="exportedHTML"></export-modal>

    <import-modal @toggleImportModal="toggleImportModal" :popup="importModelShown" @onImport="doImport" @onCsvImport="doCsvImport"></import-modal>

    <div class="add-column-container edit">
      <a @click="addStage()" class="add-column-btn btn">
        <span class="add-card-btntxt">
          Add Column
        </span>
        <span class="add-card-btnicon">
          +
        </span>
      </a>
    </div>
  </div>
</template>

<script>

let blockCssTpl = `
#block-%blockId%.drag-item{
  background-color:%bgcolor%!important;
  border-color: %bordercolor%!important;
}
#block-%blockId%.drag-item .card_h2{
  color:%txtcolor%!important;
}
#block-%blockId%.drag-item h2, #block-%blockId%.drag-item p, #block-%blockId%.drag-item a{
  color:%txtcolor%!important;
}
#modal-%blockId% .modal-content{
  border-color: %bordercolor%!important;
}
#modal-%blockId% h1,
#modal-%blockId% h2,
#modal-%blockId% h3,
#modal-%blockId% h4,
#modal-%blockId% h5,
#modal-%blockId% h6,
#modal-%blockId% p,
#modal-%blockId% a
{
  color:%txtcolor%!important;
}
`.replace(/(\r\n|\n)/gi, '');

/*global EXPORT_CSS, EXPORT_JS*/

let exportCss = EXPORT_CSS;
// IE 11 fixing
exportCss += `
  *::-ms-backdrop, .in_overflowHidden{
    overflow: visible!important;
  }
`.replace(/(\r\n|\n)/gi, '');

let exportJs = EXPORT_JS;

export default {
  name: "app",
  data: function() {
    return {
      connections: [],
      active: 1,
      exportedHTML: '',
      exportModelShown: 0,
      importModelShown: 0,
      fullScreenMode: false
    };
  },
  computed: {
    blocks() {
      return this.$store.state.blocks;
    },
    stages() {
      return this.$store.state.stages;
    },
    arrowStyles() {
      let blocks = this.$store.state.blocks;
      let allArrowStyles = [];
      blocks.forEach(function(e) {
        //not sure about this comparison method but it works
        allArrowStyles[e.id] = e.arrowcolor;
      });
      return allArrowStyles;
    }
  },

  components: {
    KanbanBoard: () => import("./components/KanbanBoard"),
    ExportModal: () => import("./components/ExportModal"),
    ImportModal: () => import("./components/ImportModal")
  },
  methods: {
    requestFullscreen() {
      let requestMethod = document.documentElement.requestFullScreen || document.documentElement.webkitRequestFullScreen || document.documentElement.mozRequestFullScreen || document.documentElement.msRequestFullScreen;
      if (requestMethod) { // Native full screen.
        requestMethod.call(document.documentElement);
        this.fullScreenMode = true;
      }
    },
    exitFullscreen() {
      let requestMethod = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (requestMethod) { // Native full screen.
        requestMethod.call(document);
        this.fullScreenMode = false;
      }
    },
    addStage() {
      let newId = 1;
      if(this.$store.state.stages.length > 0) {
        newId = this.$store.state.stages[this.$store.state.stages.length - 1].id + 1;
      }
      this.$store.commit('addStage', {
        id: newId,
        name: "New Column"
      });


      setTimeout(() => {
        let input = document.querySelector('[data-stage-id="' + newId + '"] input');
        input.focus();
        input.select();
        this.$refs.KanbanBoard.$refs.BgCanvas.refreshConnections();
      }, 100);

    },

    updateConnections(connections) {
      this.connections = connections;
    },

    changeView(view) {
      var $body = document.querySelector("body");
      let _this = this;
      if (view == "editor") {
        $body.classList.remove("mode--viewer");
        $body.classList.add("mode--editor");
        this.$store.commit("putViewMode", 0);

        setTimeout(() => {
          if(_this.connections.length > 0) {
            _this.$refs.KanbanBoard.refreshBg();
          }
        }, 50);


      } else if (view == "viewer") {
        $body.classList.remove("mode--editor");
        $body.classList.add("mode--viewer");

        this.$store.commit("putViewMode", 1);

        setTimeout(() => {
          _this.$refs.KanbanBoard.refreshBg();
        }, 50);


      }
    },

    showEditor() {
      this.changeView("editor");
    },

    showViewer() {
      this.changeView("viewer");
    },
    exportCode() {
      this.showViewer();
      let _this = this;
      setTimeout(() => {
        let appDom = document.getElementById('logic-model-app');
        let appDomClone = appDom.cloneNode(true);
        appDomClone.classList.remove("mode--editor");
        appDomClone.classList.add("mode--viewer");

        let exportBlockCssArr = [];
        for(let i in _this.blocks) {
          let cssString = blockCssTpl.replace(new RegExp('%bordercolor%', 'gi'), _this.blocks[i].bordercolor);
          cssString = cssString.replace(new RegExp('%txtcolor%', 'gi'), _this.blocks[i].txtcolor);
          cssString = cssString.replace(new RegExp('%bgcolor%', 'gi'), _this.blocks[i].bgcolor);
          cssString = cssString.replace(new RegExp('%blockId%', 'gi'), _this.blocks[i].id);
          exportBlockCssArr.push(cssString);
        }

        // Preparing export
        let exportHTMLArr = [
          '<script>',
          `var kanban_connections = JSON.parse('${JSON.stringify(_this.connections)}');`,
          `var arrowStyles = JSON.parse('${JSON.stringify(_this.arrowStyles)}');`,
          `var kanban_blocks = JSON.parse('${JSON.stringify(_this.blocks)
              .replace(/[\\]/g, '\\\\')
              .replace(/[\"]/g, '\\\"')
              .replace(/[\/]/g, '\\/')
              .replace(/[\b]/g, '\\b')
              .replace(/[\f]/g, '\\f')
              .replace(/[\n]/g, '\\n')
              .replace(/[\r]/g, '\\r')
              .replace(/[\t]/g, '\\t')}');`,
          exportJs,
          '<\/script>',
          '<style>',
          exportCss,
          exportBlockCssArr.join(''),
          '<\/style>',
          appDomClone.outerHTML,
        ];

        let exportHTML = exportHTMLArr.join('');
        exportHTML += `<!--%datasrc:${_this.getImportableData()}%-->`;
        _this.exportedHTML = exportHTML;

        _this.toggleExportModal(1);
      }, 500);
    },
    getImportableData() {
      let data = {
        connections: this.connections,
        blocks: this.blocks,
        stages: this.stages,
        blocksOrdering: this.$store.state.blocksOrdering
      }

      return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    },
    toggleExportModal(state) {
      this.exportModelShown = state;
    },
    toggleImportModal(state) {
      this.importModelShown = state;
    },
    doImport(data) {
      this.$store.commit('overwriteStages', data.stages);
      this.$store.commit('overwriteBlocks', data.blocks);
      this.$store.commit('overwriteBlocksOrdering', data.blocksOrdering);
      this.connections = data.connections;
      this.toggleImportModal(0);

      let _this = this;
      setTimeout(function() {
        _this.$refs.KanbanBoard.$refs.BgCanvas.refreshConnections();
      }, 200);
    },
    doCsvImport(data) {
      this.$store.commit('overwriteStages', data.stages);
      this.$store.commit('overwriteBlocks', data.blocks);
      this.$store.commit('overwriteBlocksOrdering', data.blocksOrdering);
      this.connections = [];
      this.toggleImportModal(0);
    }
  },

  mounted() {

    let _this = this;
    this.changeView("editor");

    window.addEventListener("resize", function(event) {
      var maxHeight = window.screen.height,
          maxWidth = window.screen.width,
          curHeight = window.innerHeight,
          curWidth = window.innerWidth;

      if (maxWidth == curWidth && maxHeight == curHeight) {
        // full screen mdoe
        _this.fullScreenMode = true;
      }
      else {
        _this.fullScreenMode = false;
      }
    });
  }
};
</script>

<style lang="scss">
@import "src/assets/kanban.scss";
@import "src/assets/logicmodel.scss";
</style>
