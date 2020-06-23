/**
 * controller.js
 * @fileoverview フォーム基本処理を管理
 * @requires jQuery
 */

/**
 * formApp
 * @namespace
 */
var formApp = formApp || {};

/**
 * @class 基本処理クラス
 * @memberOf formApp
 */
(function ($) {
  function Controller(formId, formModel, validation, options) {
    this.formId = formId;
    this.$form = $('[data-form-app="' + formId + '"]');
    this.formModel = formModel;
    this.validation = validation || null;
    this.options = $.extend(
      {
        containerDataName: 'data-form-container',
        itemDataName: 'data-name',
        errorDataName: 'data-error-name',
        errorVisibilityDataName: 'data-error-visibility',
        button: '[type="submit"]',
        alphabetsPattern: 'a-zA-Z',
        multiAlphabetsPattern: 'ａ-ｚＡ-Ｚ',
        numbersPattern: '0-9',
        multiNumbersPattern: '０-９',
        symbolsPattern:
          '"' +
          "!#\\$%&'\\(\\)\\*\\+,\\-\\.\\\\/:;<=>\\?@\\[\\]\\^_`\\{\\|\\}！＃＄％＆（）＊＋，－．／：；＜＝＞？＠［］＾＿｀｛｜｝~ 　"
      },
      options
    );
    this.util = formApp.Utility;
  }

  /**
   * 入力画面の処理を起動
   * @method
   */
  Controller.prototype.bootInput = function () {
    if (!this.formId || !this.formModel) {
      return false;
    }
    /* 初期化処理時フックの実行 */
    this.addHookInitializeInput();

    /* ユーザーアクショントリガーを設定 */
    this.addActionTrigger();

    /* validationインスタンスが設定されている場合は実行 */
    if (this.validation instanceof formApp.Validation) {
      /* バリデーションを初期化 */
      this.validation.initialize(this.$form, this.formModel, this.options);
    }

    /* ユーザー操作時のイベントリスナを設定 */
    this.addActionListener();
  };

  /**
   * 入力画面の初期化処理時のフック
   * @method
   */
  Controller.prototype.addHookInitializeInput = function () {
    return;
  };

  /**
   * 確認画面の処理を起動
   * @method
   */
  Controller.prototype.bootConfirm = function () {
    /* 初期化処理の実行 */
    this.addHookInitializeConfirm();
  };

  /**
   * 入力画面の初期化処理時のフック
   * @method
   */
  Controller.prototype.addHookInitializeConfirm = function () {
    return;
  };

  /**
   * 完了画面の処理を起動
   * @method
   */
  Controller.prototype.bootFinish = function () {
    /* 初期化処理の実行 */
    this.addHookInitializeFinish();
  };

  /**
   * 入力画面の初期化処理時のフック
   * @method
   */
  Controller.prototype.addHookInitializeFinish = function () {
    return;
  };

  /**
   * updateイベントのトリガーを追加
   * @method
   */
  Controller.prototype.addActionTrigger = function () {
    $(
      'input[type="text"], input[type="tel"], input[type="email"], input[type="password"], textarea',
      this.form
    ).on('blur', function () {
      $(this).trigger('user_action');
    });

    $('input[type="checkbox"], input[type="radio"], select', this.form).on(
      'change',
      function () {
        $(this).trigger('user_action');
      }
    );
  };

  /**
   * バリデーションイベントの設定
   * @method
   */
  Controller.prototype.addActionListener = function () {
    $('[' + this.options.itemDataName + ']').on(
      'user_action',
      function (e) {
        /* フィルタリングの実行 */
        this.execFilter(e.target);

        /* バリデーションの実行 */
        if (this.validation instanceof formApp.Validation) {
          this.addHookBeforeValidation(e);
          const result = this.validation.execValidation(e.target);
          this.addHookAfterValidation(e);
          if (result !== null) {
            result['label'] = this.formModel[result['name']]['label'];
            this.validation.updateErrorState(result);
          }
        }
      }.bind(this)
    );
  };

  /**
   * バリデートの実行
   * @method
   * @param {HTMLElement} target
   */
  Controller.prototype.execFilter = function (target) {
    const util = formApp.Utility;
    const itemDataName = this.options.itemDataName;
    const itemName = $(target).attr(itemDataName);
    if (
      this.formModel[itemName] !== undefined &&
      this.formModel[itemName]['filters'] !== undefined
    ) {
      const filters = this.formModel[itemName]['filters'];
      const value = util.getValue(target, itemDataName);
      const filtered = this.filter(filters, value);

      $(target).val(filtered);
    }
  };

  /**
   * バリデートの実行
   * @method
   * @param {array} filters
   * @param {any} value
   * @param {string} status
   * @return {boolean}
   */
  Controller.prototype.filter = function (filters, value, status) {
    const self = this;
    const util = formApp.Utility;
    let filtered = value;

    if (!Array.isArray(filters)) {
      return filtered;
    }

    filters.forEach(function (filter) {
      const methodName = 'filter' + util.convertCamelcase(filter, true);
      if (self[methodName]) {
        filtered = self[methodName](filtered);
      }
    });

    return filtered;
  };

  /**
   * フィルター：空白文字トリミング
   * @method
   * @param {string} value
   * @return {string}
   */
  Controller.prototype.filterTrim = function (value) {
    if (typeof value !== 'string') {
      return filtered;
    }
    const filtered = value.trim();

    return filtered;
  };

  /**
   * バリデーション直前のフック処理を追加
   * @method
   * @param {Object} e
   */
  Controller.prototype.addHookBeforeValidation = function (e) {
    return;
  };

  /**
   * バリデーション直後のフック処理を追加
   * @method
   * @param {Object} e
   */
  Controller.prototype.addHookAfterValidation = function (e) {
    return;
  };

  formApp.Controller = Controller;
})(jQuery);
