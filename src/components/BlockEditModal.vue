<template>
  <div :id="'modal-' + block.id" class="modal" v-if="popup">
    <v-style>
      #modal-{{ this.block.id }} .modal-content{
        border-color: {{ this.block.bordercolor }}!important;
      }
      #modal-{{ this.block.id }} .modal-view-mod h1,
      #modal-{{ this.block.id }} .modal-view-mod h2,
      #modal-{{ this.block.id }} .modal-view-mod h3,
      #modal-{{ this.block.id }} .modal-view-mod h4,
      #modal-{{ this.block.id }} .modal-view-mod h5,
      #modal-{{ this.block.id }} .modal-view-mod h6,
      #modal-{{ this.block.id }} .modal-view-mod p,
      #modal-{{ this.block.id }} .modal-view-mod a
      {
        color:{{ this.block.txtcolor}}!important;
      }
    </v-style>
    <div :class="modalClassObject" :style="{
      backgroundColor: viewMode ? block.bgcolor : 'white'
    }">
      <div class="modal-head">
        <h2>{{stage.name}}</h2>
        <a class="close-btn" @click="closeModal">  <span class="modal-edit-mod edit">Save & close</span><span class="modal-view-mod previewOnly">Close</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg></a>
      </div>

      <div class="modal-body">
        <div class="modal-view-mod previewOnly">
          <div>
            <h2>{{block.title}}</h2>
            <div v-html="block.description">
            </div>
          </div>
        </div>
        <div class="modal-edit-mod edit">
          <div class="modal-content-wrapper">
            <div>
              <label for="title">Title</label>
              <textarea
                placeholder="Enter Card Title"
                rows="1"
                :value="block.title"
                @blur="updateBlock('title', $event.target.value)"
                @keydown.enter="titleHitEnter($event)"
                @keydown="autosize($event.target)"
                @focus="autosize($event.target)"
                class="title-input"
                ></textarea>
            </div>
            <div>
              <label for="title">Short text</label>
              <textarea
                placeholder="Enter short text"
                :value="block.teaser"
                @blur="updateBlock('teaser', $event.target.value)"
                rows="3"
                ></textarea>
            </div>
            <div>
              <label for="title">Type</label>
              <select
                :value="block.type ? block.type : 'text'"
                @change="updateBlock('type', $event.target.value);"
                class="title-input" >
                <option value="text">Text</option>
                <option value="link">Link</option>
              </select>
            </div>
            <div v-if="isTypeLink">
              <label for="title">URL</label>
              <input
                placeholder="e.g. https://example.com"
                :value="block.url"
                @blur="updateBlock('url', $event.target.value)"
                class="title-input" />
            </div>
          </div>

          <div :class="detailConfigAccordionClass" v-if="isTypeText">
            <div class="collapsible-head" @click = "showStyleConfigAccordion = false; showDetailConfigAccordion = !showDetailConfigAccordion">
              <h3>Detail</h3>
              <span class="collapsible-btn"></span>
            </div>
            <div class="collapsible-body">
              <div>
                <label for="title">Description</label>
                <vue-ckeditor
                  placeholder="Type the text"
                  @blur="updateBlock('description', $event.editor._.data)"
                  :config="ckeditorConfig"
                  :value="block.description"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div :class="styleConfigAccordionClass">
            <div class="collapsible-head" @click = "showDetailConfigAccordion = false; showStyleConfigAccordion = !showStyleConfigAccordion">
              <h3>Style</h3>
              <span class="collapsible-btn"></span>
            </div>
            <div class="collapsible-body">
              <div>
                <div class="lm-2-columns">
                  <div>
                    <label>Card Colour</label>
                    <div class="color-palette-indicator">
                      <div :style="{backgroundColor: bgcolorTmp}"></div>
                      <input
                        :value="block.bgcolor"
                        class="title-input"
                        @click="showTxtColorPicker = false;showBorderColorPicker = false;showArrowColorPicker = false;showBgColorPicker = !showBgColorPicker;flushTheColorpicker();"
                         />
                    </div>
                    <compact-picker
                      id="the-colorpicker"
                      class="card-color"
                      v-if="showBgColorPicker"
                      :value="block.bgcolor"
                      :palette="colourPaletteNHS"
                      @input="bgcolorTmp=$event.hex; updateBlock('bgcolor', $event.hex);showBgColorPicker = false;"></compact-picker>
                  </div>
                  <div>
                    <label>Text Colour</label>
                    <div class="color-palette-indicator">
                      <div :style="{backgroundColor: txtcolorTmp}"></div>
                      <input
                        :value="block.txtcolor"
                        class="title-input"
                        @click="showBorderColorPicker = false; showBgColorPicker = false;showArrowColorPicker = false;showTxtColorPicker = !showTxtColorPicker;flushTheColorpicker();"
                        />
                    </div>
                    <compact-picker
                      id="the-colorpicker"
                      class="text-color"
                      v-if="showTxtColorPicker"
                      :value="block.txtcolor"
                      :palette="colourPaletteNHS"
                      @input="txtcolorTmp=$event.hex; updateBlock('txtcolor', $event.hex);showTxtColorPicker = false;"></compact-picker>
                  </div>
                </div>
                <br>
                <div class="lm-2-columns">
                  <div>
                    <label>Border Style</label>
                    <select
                      :value="block.style ? block.style : '-default'"
                      @change="updateBlock('style', $event.target.value)"
                      class="title-input" >
                      <option value="-default" selected="selected">No border</option>
                      <option value="-border-rounded">Rounded</option>
                      <option value="-border-rounded-dashed">Rounded dashed</option>
                      <option value="-border-rounded-bold">Rounded bold</option>
                      <option value="-border-square">Square</option>
                      <option value="-border-square-dashed">Square dashed</option>
                      <option value="-border-square-bold">Square bold</option>
                    </select>
                  </div>
                  <div>
                    <label>Border Color</label>
                    <div class="color-palette-indicator">
                      <div :style="{backgroundColor: bordercolorTmp}"></div>
                      <input
                        :value="block.bordercolor ? block.bordercolor: '#231F20'"
                        class="title-input"
                        @click="showTxtColorPicker = false; showBgColorPicker = false;showArrowColorPicker = false;showBorderColorPicker = !showBorderColorPicker;flushTheColorpicker();"
                        />
                    </div>
                    <compact-picker
                      id="the-colorpicker"
                      class="border-color"
                      v-if="showBorderColorPicker"
                      :value="block.bordercolor ? block.bordercolor: '#231F20'"
                      :palette="colourPaletteNHS"
                      @input="bordercolorTmp=$event.hex; updateBlock('bordercolor', $event.hex);showBorderColorPicker = false;"></compact-picker>
                  </div>
                </div>
                <br>
                <div class="lm-2-columns">
                  <div>
                    <label>Arrow Color</label>
                    <div class="color-palette-indicator">
                      <div :style="{backgroundColor: arrowcolorTmp}"></div>
                      <input
                        :value="block.arrowcolor ? block.arrowcolor: '#005EB8'"
                        class="title-input"
                        @click="showTxtColorPicker = false; showBgColorPicker = false;showBorderColorPicker = false;showArrowColorPicker = !showArrowColorPicker;flushTheColorpicker();"
                        />
                    </div>
                    <compact-picker
                      id="the-colorpicker"
                      class="arrow-color"
                      v-if="showArrowColorPicker"
                      :value="block.arrowcolor ? block.arrowcolor: '#005EB8'"
                      :palette="colourPaletteNHS"
                      @input="arrowcolorTmp=$event.hex; updateBlock('arrowcolor', $event.hex);showArrowColorPicker = false;"></compact-picker>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div class="modal-content-wrapper form-control-container">
            <div>
              <a class="delete-btn" @click="removeBlock">Delete item</a>
              <a class="btn" @click="saveThenClose">Save & close</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-bg"></div>
  </div>
</template>

<script>
export default {
  name: "BlockEditModal",

  props: {
    popup: null,
    block: null,
    stage: null
  },
  data() {
    return {
      ckeditorConfig: {
        toolbar: [
          [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', 'BulletedList', 'Link']
        ],
        height: 200
      },
      bgcolorTmp: null,
      txtcolorTmp: null,
      bordercolorTmp: null,
      arrowcolorTmp: null,
      showStyleConfigAccordion: false,
      showDetailConfigAccordion: true,
      isTypeLink: false,
      isTypeText: true,
      showArrowColorPicker: false,
      showBorderColorPicker: false,
      showBgColorPicker: false,
      showTxtColorPicker: false,
      colourPaletteNHS: [
      '#FFFFFF', '#005EB8', '#003087', '#0072CE', '#41B6E6', '#00A9CE',
      '#231f20', '#425563', '#768692', '#E8EDEE','#006747',
      '#009639', '#78BE20', '#330072', '#7C2855', '#AE2573', '#8A1538',
      '#DA291C', '#ED8B00', '#FFB81C', '#FAE100', '', '', '',

      '#4D4D4D', '#999999', '#F44E3B', '#FE9200', '#FCDC00',
      '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF',
      '#333333', '#808080', '#CCCCCC', '#D33115', '#E27300', '#FCC400',
      '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF',
      '#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00',
      '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E']


    };
  },
  computed: {
    viewMode() {
      return this.$store.state.viewMode;
    },
    modalClassObject() {
      let classObj = {'modal-content': true};
      classObj[`style-${this.block.style}`] = this.viewMode ? true : false;

      return classObj;
    },
    styleConfigAccordionClass() {
      return {
        collapsed: !this.showStyleConfigAccordion,
        'collapsible-container': true,
        'modal-content-wrapper': true
      };
    },
    detailConfigAccordionClass() {
      return {
        collapsed: !this.showDetailConfigAccordion,
        'collapsible-container': true,
        'modal-content-wrapper': true
      };
    }
  },
  watch: {
    popup() {
      if(this.popup) {
        this.bgcolorTmp = this.block.bgcolor ? this.block.bgcolor : 'white';
        this.txtcolorTmp = this.block.txtcolor ? this.block.txtcolor : '#005EB8';
        this.bordercolorTmp = this.block.bordercolor ? this.block.bordercolor : '#231F20';
        this.arrowcolorTmp = this.block.arrowcolor ? this.block.arrowcolor : '#005EB8';
        this.isTypeText = this.block.type == 'text' ? true : false;
        this.isTypeLink = this.block.type == 'link' ? true : false;
        this.showStyleConfigAccordion = false;
        this.showDetailConfigAccordion = this.isTypeText ? true : false;
        document.activeElement.blur();

        let _this = this;
        setTimeout(function() {
          _this.autosize(document.querySelector(`#modal-${_this.block.id} textarea.title-input`));
        }, 100);
      }
    }
  },
  methods: {
    flushTheColorpicker(){
      setTimeout(function() {
        var id = 'the-colorpicker';
        var elementOnShow = document.getElementById(id);
        var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
        if (isIE11 && elementOnShow){
          elementOnShow.focus();
          elementOnShow.style.zIndex = 7;
        }
      }, 0);
    },
    closeAllColorPicker() {
      this.showBorderColorPicker = false;
      this.showBgColorPicker = false;
      this.showTxtColorPicker = false;
    },
    openModal() {
      this.$emit('toggleBlockEditModal', this.block, 1, this.stage);
    },
    closeModal() {
      this.$emit('toggleBlockEditModal', this.block, 0, this.stage);
    },
    removeBlock() {
      this.$emit('removeBlock', this.block.id);
      this.closeModal();
    },
    stateManagement(field, value) {
      if(field == 'type') {
        this.isTypeLink = (value == 'link') ? true : false;
        this.isTypeText = (value == 'text') ? true : false;
      }
    },
    updateBlock(field, value) {
      this.stateManagement(field, value);
      this.$store.commit('putBlock', {
        id: this.block.id,
        key: field,
        value: value
      });
    },
    saveThenClose() {
      setTimeout(this.closeModal, 200);
    },
    autosize(el){
      setTimeout(function(){
        el.style.cssText = 'height:auto; padding:0';

        if(el.scrollHeight > 0) {
          el.style.cssText = 'height:' + (el.scrollHeight + 10) + 'px';
        }
      },0);
    },
    titleHitEnter() {
      document.activeElement.blur();
    }
  }
};
</script>




<style lang="scss">
</style>